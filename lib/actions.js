"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import {
  getCommunitySessionFromCookies,
  getCommunityUserBySessionToken,
} from "./community";
import { hasUploadedImage, validateMealImage } from "./image-validation";
import {
  deleteMealForCreator,
  getMealById,
  saveMeal,
  updateMealForCreator,
} from "./meals";
import { deleteMealImage, uploadMealImage } from "./r2";

function isInvalidText(text) {
  return !text || text.trim() === "";
}

export async function shareMeal(previousState, formData) {
  const { sessionToken, guestMode } = await getCommunitySessionFromCookies();

  if (guestMode || !sessionToken) {
    return {
      message:
        "Guests can browse meals, but they cannot share recipes. Please log in or sign up.",
    };
  }

  const currentUser = await getCommunityUserBySessionToken(sessionToken);

  if (!currentUser) {
    return {
      message:
        "Your session expired. Please log in again before sharing a meal.",
    };
  }

  const meal = {
    title: formData.get("title")?.trim(),
    summary: formData.get("summary")?.trim(),
    instructions: formData.get("instructions")?.trim(),
    image: formData.get("image"),
    creator: currentUser.display_name,
    creator_email: currentUser.email,
  };

  if (!meal.title || !meal.summary || !meal.instructions) {
    return {
      message: "Please provide a title, summary, and instructions.",
    };
  }

  const imageValidation = await validateMealImage(meal.image);

  if (!imageValidation.valid) {
    return {
      message: imageValidation.message,
    };
  }

  try {
    await saveMeal(meal, imageValidation);
  } catch (error) {
    console.error("Failed to create meal:", error);
    return {
      message: "Failed to create meal. Please try again.",
    };
  }

  revalidatePath("/");
  revalidatePath("/meals");
  revalidateTag("meals");
  redirect("/meals");
}

function isSeedMealImage(imageUrl) {
  try {
    return new URL(imageUrl).pathname.startsWith("/seed/");
  } catch {
    return true;
  }
}

export async function deleteMealEntry(mealId) {
  const normalizedMealId = Number(mealId);

  if (!Number.isInteger(normalizedMealId) || normalizedMealId <= 0) {
    return {
      deleted: false,
      invalidMeal: true,
      message: "Invalid meal.",
    };
  }

  const { sessionToken, guestMode } = await getCommunitySessionFromCookies();

  if (guestMode || !sessionToken) {
    return {
      deleted: false,
      unauthorized: true,
      message: "You must be logged in to delete a meal.",
    };
  }

  const currentUser = await getCommunityUserBySessionToken(sessionToken);

  if (!currentUser) {
    return {
      deleted: false,
      unauthorized: true,
      message: "Your session has expired. Please log in again.",
    };
  }

  const meal = await getMealById(normalizedMealId);

  if (!meal) {
    return {
      deleted: false,
      notFound: true,
      message: "This meal no longer exists.",
    };
  }

  if (isSeedMealImage(meal.image)) {
    return {
      deleted: false,
      protectedMeal: true,
      message: "Default meals cannot be permanently deleted.",
    };
  }

  const ownsMeal =
    currentUser.email.toLowerCase() === meal.creator_email.toLowerCase();

  if (!ownsMeal) {
    return {
      deleted: false,
      unauthorized: true,
      message: "You can only delete meals you added.",
    };
  }

  const wasDeleted = await deleteMealForCreator(
    normalizedMealId,
    currentUser.email,
  );

  if (!wasDeleted) {
    return {
      deleted: false,
      message: "The meal could not be deleted.",
    };
  }

  let imageCleanupFailed = false;

  try {
    await deleteMealImage(meal.image);
  } catch (error) {
    imageCleanupFailed = true;

    console.error("Meal deleted, but its R2 image cleanup failed.", {
      mealId: normalizedMealId,
      imageUrl: meal.image,
      error,
    });
  }

  revalidatePath("/");
  revalidatePath("/meals");
  revalidatePath(`/meals/${meal.slug}`);
  revalidateTag("meals");

  return {
    deleted: true,
    imageCleanupFailed,
  };
}

export async function updateMeal(prevState, formData) {
  const mealId = Number(formData.get("mealId"));
  const image = formData.get("image");
  const { sessionToken, guestMode } = await getCommunitySessionFromCookies();

  if (!mealId || guestMode || !sessionToken) {
    return {
      message: "Guests can browse meals, but they cannot edit recipes.",
    };
  }

  const currentUser = await getCommunityUserBySessionToken(sessionToken);
  const existingMeal = await getMealById(mealId);

  if (
    !currentUser ||
    !existingMeal ||
    isSeedMealImage(existingMeal.image) ||
    currentUser.email.toLowerCase() !== existingMeal.creator_email.toLowerCase()
  ) {
    return {
      message: "You can only edit meals you added.",
    };
  }

  const meal = {
    title: formData.get("title"),
    summary: formData.get("summary"),
    instructions: formData.get("instructions"),
    image: null,
  };

  if (
    isInvalidText(meal.title) ||
    isInvalidText(meal.summary) ||
    isInvalidText(meal.instructions)
  ) {
    return {
      message: "Please provide a title, summary, and instructions.",
    };
  }

  if (hasUploadedImage(image)) {
    const imageValidation = await validateMealImage(image);

    if (!imageValidation.valid) {
      return {
        message: imageValidation.message,
      };
    }

    const fileName = `meals/${existingMeal.slug}-${crypto.randomUUID()}.${imageValidation.extension}`;

    meal.image = await uploadMealImage(
      image,
      fileName,
      imageValidation.contentType,
    );
  }

  try {
    await updateMealForCreator(mealId, currentUser.email, meal);

    if (meal.image) {
      await deleteMealImage(existingMeal.image).catch(() => {});
    }
  } catch (error) {
    if (meal.image) {
      await deleteMealImage(meal.image).catch(() => {});
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath("/meals");
  revalidatePath(`/meals/${existingMeal.slug}`);
  revalidateTag("meals");
  redirect(`/meals/${existingMeal.slug}`);
}
