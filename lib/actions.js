"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import {
  getCommunitySessionFromCookies,
  getCommunityUserBySessionToken,
} from "./community";
import {
  deleteMealForCreator,
  getMealById,
  saveMeal,
  updateMealForCreator,
} from "./meals";
import { deleteMealImage, uploadMealImage } from "./r2";

const allowedImageTypes = ["image/jpeg", "image/png"];
const maxImageSize = 5 * 1024 * 1024;

function isInvalidText(text) {
  return !text || text.trim() === "";
}

function isInvalidImage(image) {
  return (
    !image ||
    image.size === 0 ||
    image.size > maxImageSize ||
    !allowedImageTypes.includes(image.type)
  );
}

function hasImage(image) {
  return image && image.size > 0;
}

export async function shareMeal(prevState, formData) {
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
    title: formData.get("title"),
    summary: formData.get("summary"),
    instructions: formData.get("instructions"),
    image: formData.get("image"),
    creator: currentUser.display_name,
    creator_email: currentUser.email,
  };

  if (
    isInvalidText(meal.title) ||
    isInvalidText(meal.summary) ||
    isInvalidText(meal.instructions) ||
    isInvalidText(meal.creator) ||
    isInvalidText(meal.creator_email) ||
    !meal.creator_email.includes("@") ||
    isInvalidImage(meal.image)
  ) {
    return {
      message:
        "Invalid input. Please provide text fields and a JPEG or PNG image under 5MB.",
    };
  }

  await saveMeal(meal);
  revalidatePath("/");
  revalidatePath("/meals");
  redirect("/meals");
}

function isSeedMealImage(imageUrl) {
  try {
    return new URL(imageUrl).pathname.startsWith("/seed/");
  } catch {
    return true;
  }
}

export async function deleteMealEntry(mealId, imageUrl) {
  if (!mealId || !imageUrl || isSeedMealImage(imageUrl)) {
    return { deleted: false, protectedMeal: true };
  }

  const { sessionToken, guestMode } = await getCommunitySessionFromCookies();

  if (guestMode || !sessionToken) {
    return { deleted: false, unauthorized: true };
  }

  const currentUser = await getCommunityUserBySessionToken(sessionToken);
  const meal = await getMealById(mealId);

  if (
    !currentUser ||
    !meal ||
    currentUser.email.toLowerCase() !== meal.creator_email.toLowerCase() ||
    meal.image !== imageUrl
  ) {
    return { deleted: false, unauthorized: true };
  }

  await deleteMealImage(imageUrl);
  await deleteMealForCreator(mealId, currentUser.email);

  revalidatePath("/");
  revalidatePath("/meals");

  return { deleted: true };
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

  if (hasImage(image)) {
    if (isInvalidImage(image)) {
      return {
        message: "Please choose a JPEG or PNG image under 5MB.",
      };
    }

    const extension = image.name.split(".").pop();
    const fileName = `meals/${existingMeal.slug}-${crypto.randomUUID()}.${extension}`;

    meal.image = await uploadMealImage(image, fileName);
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
  redirect(`/meals/${existingMeal.slug}`);
}
