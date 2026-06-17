import { createClient } from "@tursodatabase/serverless/compat";
import crypto from "node:crypto";
import slugify from "slugify";
import xss from "xss";
import environment from "./environment";
import { deleteMealImage, uploadMealImage } from "./r2";

const { loadLocalEnv, requireEnv } = environment;

loadLocalEnv();

const db = createClient({
  url: requireEnv("TURSO_DATABASE_URL"),
  authToken: requireEnv("TURSO_AUTH_TOKEN"),
});

function mapRows(result) {
  return result.rows.map((row) =>
    Object.fromEntries(result.columns.map((column, index) => [column, row[index]])),
  );
}

export async function getMeals() {
  const meals = await db.execute("SELECT * FROM meals ORDER BY id DESC");
  return mapRows(meals);
}

export async function getMeal(slug) {
  const meal = await db.execute("SELECT * FROM meals WHERE slug = ?", [slug]);
  return mapRows(meal)[0];
}

export async function deleteMeal(id) {
  await db.execute("DELETE FROM meals WHERE id = ?", [id]);
}

export async function saveMeal(meal) {
  const slugBase = slugify(meal.title, { lower: true, strict: true });
  meal.slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;
  meal.instructions = xss(meal.instructions);

  const extension = meal.image.name.split(".").pop();
  const fileName = `meals/${meal.slug}-${crypto.randomUUID()}.${extension}`;

  meal.image = await uploadMealImage(meal.image, fileName);

  try {
    await db.execute(
      `
      INSERT INTO meals 
        (title, summary, instructions, image, creator, creator_email, slug) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        meal.title,
        meal.summary,
        meal.instructions,
        meal.image,
        meal.creator,
        meal.creator_email,
        meal.slug,
      ],
    );
  } catch (error) {
    await deleteMealImage(meal.image).catch(() => {});
    throw error;
  }
}
