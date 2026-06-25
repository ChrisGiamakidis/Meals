const { createClient } = require("@tursodatabase/serverless/compat");
const { loadLocalEnv, requireEnv } = require("../lib/environment").default;
const { buildSeedImageUrl, SEED_MEALS } = require("../lib/seed-data");
const { demoUsers, demoPasswordHash, demoPosts } = require("../lib/demo-users");

loadLocalEnv();

const db = createClient({
  url: requireEnv("TURSO_DATABASE_URL"),
  authToken: requireEnv("TURSO_AUTH_TOKEN"),
});

function toRows(result) {
  return result.rows.map((row) =>
    Object.fromEntries(
      result.columns.map((column, index) => [column, row[index]]),
    ),
  );
}

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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS community_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      display_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      bio TEXT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS community_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      cuisine TEXT NOT NULL,
      body TEXT NOT NULL,
      seed_key TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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

  for (const user of demoUsers) {
    await db.execute(
      `
      INSERT OR IGNORE INTO community_users
        (display_name, email, password_hash, bio, is_demo)
      VALUES (?, ?, ?, ?, 1)
    `,
      [user.displayName, user.email, demoPasswordHash, user.bio],
    );
  }

  const usersResult = await db.execute(
    "SELECT id, email FROM community_users WHERE is_demo = 1 ORDER BY id ASC",
  );
  const demoUserRows = toRows(usersResult);
  const userIdByEmail = new Map(demoUserRows.map((row) => [row.email, row.id]));

  for (const post of demoPosts) {
    await db.execute(
      `
      INSERT OR IGNORE INTO community_posts
        (user_id, title, cuisine, body, seed_key)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        userIdByEmail.get(post.userEmail),
        post.title,
        post.cuisine,
        post.body,
        post.seedKey,
      ],
    );
  }

  console.log("Turso database is ready.");
}

setupDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
