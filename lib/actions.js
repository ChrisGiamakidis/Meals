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
import { INPUT_LIMITS, validateRequiredText } from "./validation";

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

  const titleValidation = validateRequiredText(formData.get("title"), {
    label: "Title",
    maxLength: INPUT_LIMITS.mealTitle,
  });
  if (!titleValidation.valid) {
    return {
      message: titleValidation.message,
    };
  }

  const summaryValidation = validateRequiredText(formData.get("summary"), {
    label: "Summary",
    maxLength: INPUT_LIMITS.mealSummary,
  });
  if (!summaryValidation.valid) {
    return {
      message: summaryValidation.message,
    };
  }

  const instructionsValidation = validateRequiredText(
    formData.get("instructions"),
    {
      label: "Instructions",
      maxLength: INPUT_LIMITS.mealInstructions,
    },
  );
  if (!instructionsValidation.valid) {
    return {
      message: instructionsValidation.message,
    };
  }

  const image = formData.get("image");
  const imageValidation = await validateMealImage(image);
  if (!imageValidation.valid) {
    return {
      message: imageValidation.message,
    };
  }

  const meal = {
    title: titleValidation.value,
    summary: summaryValidation.value,
    instructions: instructionsValidation.value,
    image,
    creator: currentUser.display_name,
    creator_email: currentUser.email,
    creator_id: currentUser.id,
  };
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

  const ownsMeal = Number(meal.creator_id) === Number(currentUser.id);
  if (!ownsMeal) {
    return {
      deleted: false,
      unauthorized: true,
      message: "You can only delete meals you added.",
    };
  }

  const wasDeleted = await deleteMealForCreator(
    normalizedMealId,
    currentUser.id,
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
  if (!Number.isInteger(mealId) || mealId <= 0 || guestMode || !sessionToken) {
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
    Number(existingMeal.creator_id) !== Number(currentUser.id)
  ) {
    return {
      message: "You can only edit meals you added.",
    };
  }

  const titleValidation = validateRequiredText(formData.get("title"), {
    label: "Title",
    maxLength: INPUT_LIMITS.mealTitle,
  });
  if (!titleValidation.valid) {
    return {
      message: titleValidation.message,
    };
  }

  const summaryValidation = validateRequiredText(formData.get("summary"), {
    label: "Summary",
    maxLength: INPUT_LIMITS.mealSummary,
  });
  if (!summaryValidation.valid) {
    return {
      message: summaryValidation.message,
    };
  }

  const instructionsValidation = validateRequiredText(
    formData.get("instructions"),
    {
      label: "Instructions",
      maxLength: INPUT_LIMITS.mealInstructions,
    },
  );
  if (!instructionsValidation.valid) {
    return {
      message: instructionsValidation.message,
    };
  }

  const meal = {
    title: titleValidation.value,
    summary: summaryValidation.value,
    instructions: instructionsValidation.value,
    image: null,
  };

  let uploadedImageUrl = null;
  if (hasUploadedImage(image)) {
    const imageValidation = await validateMealImage(image);
    if (!imageValidation.valid) {
      return {
        message: imageValidation.message,
      };
    }
    const fileName = `meals/${existingMeal.slug}-${crypto.randomUUID()}.${imageValidation.extension}`;
    try {
      uploadedImageUrl = await uploadMealImage(
        image,
        fileName,
        imageValidation.contentType,
      );
      meal.image = uploadedImageUrl;
    } catch (error) {
      console.error("Failed to upload replacement meal image:", error);
      return {
        message: "The new image could not be uploaded. Please try again.",
      };
    }
  }

  try {
    const wasUpdated = await updateMealForCreator(
      mealId,
      currentUser.id,
      meal,
    );
    if (wasUpdated === false) {
      if (uploadedImageUrl) {
        await deleteMealImage(uploadedImageUrl).catch((cleanupError) => {
          console.error(
            "Failed to clean up unused replacement image:",
            cleanupError,
          );
        });
      }
      return {
        message: "The meal could not be updated.",
      };
    }
  } catch (error) {
    if (uploadedImageUrl) {
      await deleteMealImage(uploadedImageUrl).catch((cleanupError) => {
        console.error("Failed to clean up replacement image:", cleanupError);
      });
    }
    console.error("Failed to update meal:", error);
    return {
      message: "The meal could not be updated. Please try again.",
    };
  }

  if (uploadedImageUrl && existingMeal.image !== uploadedImageUrl) {
    try {
      await deleteMealImage(existingMeal.image);
    } catch (error) {
      console.error(
        "Meal updated, but the old image could not be removed:",
        error,
      );
    }
  }

  revalidatePath("/");
  revalidatePath("/meals");
  revalidatePath(`/meals/${existingMeal.slug}`);
  revalidateTag("meals");
  redirect(`/meals/${existingMeal.slug}`);
}
