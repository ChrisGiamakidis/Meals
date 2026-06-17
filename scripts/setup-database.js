const { createClient } = require("@tursodatabase/serverless/compat");
const { loadLocalEnv, requireEnv } = require("../lib/environment").default;
const { buildSeedImageUrl, SEED_MEALS } = require("../lib/seed-data");

loadLocalEnv();

const db = createClient({
  url: requireEnv("TURSO_DATABASE_URL"),
  authToken: requireEnv("TURSO_AUTH_TOKEN"),
});

async function setupDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      summary TEXT NOT NULL,
      instructions TEXT NOT NULL,
      creator TEXT NOT NULL,
      creator_email TEXT NOT NULL
    )
  `);

  for (const meal of SEED_MEALS) {
    await db.execute(
      `
      INSERT OR IGNORE INTO meals
        (slug, title, image, summary, instructions, creator, creator_email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        meal.slug,
        meal.title,
        buildSeedImageUrl(meal.imageFileName),
        meal.summary.trim(),
        meal.instructions.trim().replace(/\n\s+/g, "\n"),
        meal.creator,
        meal.creator_email,
      ],
    );
  }

  console.log("Turso database is ready.");
}

setupDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
