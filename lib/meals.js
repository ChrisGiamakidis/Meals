import { unstable_cache } from "next/cache";
import crypto from "node:crypto";
import slugify from "slugify";
import xss from "xss";
import { db, mapRows } from "./database";
import { deleteMealImage, uploadMealImage } from "./r2";

export const getMeals = unstable_cache(
  async () => {
    const meals = await db.execute("SELECT * FROM meals ORDER BY id DESC");
    return mapRows(meals);
  },
  ["meals"],
  { revalidate: 3600, tags: ["meals"] },
);

export const getPaginatedMeals = unstable_cache(
  async ({ page = 1, limit = 6, hiddenMealIds = [] } = {}) => {
    const offset = (page - 1) * limit;
    const excludedMealIds = [...new Set(hiddenMealIds.map(String))];
    const exclusionClause =
      excludedMealIds.length > 0
        ? `WHERE id NOT IN (${excludedMealIds.map(() => "?").join(", ")})`
        : "";
    const [mealsResult, countResult] = await Promise.all([
      db.execute(
        `SELECT * FROM meals ${exclusionClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
        [...excludedMealIds, limit, offset],
      ),
      db.execute(`SELECT COUNT(*) as count FROM meals ${exclusionClause}`, [
        ...excludedMealIds,
      ]),
    ]);
    const meals = mapRows(mealsResult);
    const total = mapRows(countResult)[0].count;
    return {
      meals,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  },
  ["meals-paginated"],
  { revalidate: 3600, tags: ["meals"] },
);

export async function getMeal(slug) {
  const meal = await db.execute("SELECT * FROM meals WHERE slug = ?", [slug]);
  return mapRows(meal)[0];
}

export async function getMealById(id) {
  const meal = await db.execute("SELECT * FROM meals WHERE id = ?", [id]);
  return mapRows(meal)[0];
}

export async function deleteMealForCreator(id, creatorId) {
  const result = await db.execute(
    `
      DELETE FROM meals
      WHERE id = ?
        AND creator_id = ?
    `,
    [id, creatorId],
  );

  return result.rowsAffected > 0;
}

export async function updateMealForCreator(id, creatorId, meal) {
  const sanitizedInstructions = xss(meal.instructions);
  let result;
  if (meal.image) {
    result = await db.execute(
      `
        UPDATE meals
        SET title = ?, summary = ?, instructions = ?, image = ?
        WHERE id = ?
          AND creator_id = ?
      `,
      [
        meal.title,
        meal.summary,
        sanitizedInstructions,
        meal.image,
        id,
        creatorId,
      ],
    );
  } else {
    result = await db.execute(
      `
        UPDATE meals
        SET title = ?, summary = ?, instructions = ?
        WHERE id = ?
          AND creator_id = ?
      `,
      [meal.title, meal.summary, sanitizedInstructions, id, creatorId],
    );
  }

  return result.rowsAffected > 0;
}

export async function saveMeal(meal, imageMetadata) {
  const slugBase = slugify(meal.title, {
    lower: true,
    strict: true,
  });

  meal.slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;

  meal.instructions = xss(meal.instructions);

  const fileName = `meals/${meal.slug}-${crypto.randomUUID()}.${imageMetadata.extension}`;

  meal.image = await uploadMealImage(
    meal.image,
    fileName,
    imageMetadata.contentType,
  );

  try {
    await db.execute(
      `
        INSERT INTO meals (
          title,
          summary,
          instructions,
          image,
          creator,
          creator_email,
          creator_id,
          slug
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        meal.title,
        meal.summary,
        meal.instructions,
        meal.image,
        meal.creator,
        meal.creator_email,
        meal.creator_id,
        meal.slug,
      ],
    );
  } catch (error) {
    await deleteMealImage(meal.image).catch((cleanupError) => {
      console.error("Failed to clean up uploaded meal image.", cleanupError);
    });

    throw error;
  }
}
