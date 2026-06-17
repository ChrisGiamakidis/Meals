"use server";

import { redirect } from "next/navigation";
import { deleteMeal, saveMeal } from "./meals";
import { revalidatePath } from "next/cache";
import { deleteMealImage } from "./r2";

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

export async function shareMeal(prevState, formData) {
  const meal = {
    title: formData.get("title"),
    summary: formData.get("summary"),
    instructions: formData.get("instructions"),
    image: formData.get("image"),
    creator: formData.get("name"),
    creator_email: formData.get("email"),
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
      message: "Invalid input. Please provide text fields and a JPEG or PNG image under 5MB.",
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

  await deleteMealImage(imageUrl);
  await deleteMeal(mealId);

  revalidatePath("/");
  revalidatePath("/meals");

  return { deleted: true };
}
