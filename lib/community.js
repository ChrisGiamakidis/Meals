import { cookies } from "next/headers";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { db, mapRows } from "./database.js";

const scryptAsync = promisify(crypto.scrypt);
const PASSWORD_KEY_LENGTH = 64;

export const COMMUNITY_SESSION_COOKIE = "community_session";
export const COMMUNITY_DEFAULT_PASSWORD = "demo1234";
export const COMMUNITY_MODE_COOKIE = "community_mode";
export const COMMUNITY_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;
const COMMUNITY_SESSION_DURATION_MS = COMMUNITY_SESSION_DURATION_SECONDS * 1000;

function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");

  const derivedKey = await scryptAsync(password, salt, PASSWORD_KEY_LENGTH);

  return `scrypt$${salt}$${Buffer.from(derivedKey).toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  if (typeof password !== "string" || typeof storedHash !== "string") {
    return false;
  }

  const [algorithm, salt, storedKey] = storedHash.split("$");
  if (
    algorithm !== "scrypt" ||
    !salt ||
    !storedKey ||
    !/^[a-f\d]+$/i.test(storedKey)
  ) {
    return false;
  }

  const storedKeyBuffer = Buffer.from(storedKey, "hex");
  if (storedKeyBuffer.length !== PASSWORD_KEY_LENGTH) {
    return false;
  }
  try {
    const derivedKey = await scryptAsync(password, salt, PASSWORD_KEY_LENGTH);
    return crypto.timingSafeEqual(Buffer.from(derivedKey), storedKeyBuffer);
  } catch (error) {
    console.error("Password verification failed:", error);
    return false;
  }
}

export async function getCommunityUserByEmail(email) {
  const result = await db.execute(
    "SELECT * FROM community_users WHERE email = ? LIMIT 1",
    [email.toLowerCase()],
  );

  return mapRows(result)[0];
}

export async function getCommunityUserBySessionToken(sessionToken) {
  if (!sessionToken) {
    return null;
  }

  const result = await db.execute(
    `
    SELECT users.*
    FROM community_sessions AS sessions
    JOIN community_users AS users ON users.id = sessions.user_id
    WHERE sessions.token = ?
      AND sessions.expires_at > datetime('now')
    LIMIT 1
  `,
    [sessionToken],
  );

  return mapRows(result)[0] ?? null;
}

export async function getCommunityPosts() {
  const result = await db.execute(
    `
    SELECT
      posts.id,
      posts.title,
      posts.cuisine,
      posts.body,
      posts.seed_key,
      posts.created_at,
      posts.user_id,
      users.display_name AS author_name,
      users.email AS author_email,
      users.is_demo AS author_is_demo
    FROM community_posts AS posts
    LEFT JOIN community_users AS users ON users.id = posts.user_id
    ORDER BY posts.id DESC
  `,
  );

  return mapRows(result);
}

export async function getCommunityPostById(postId) {
  const result = await db.execute(
    `
    SELECT
      posts.id,
      posts.title,
      posts.cuisine,
      posts.body,
      posts.seed_key,
      posts.created_at,
      posts.user_id,
      users.display_name AS author_name,
      users.email AS author_email,
      users.is_demo AS author_is_demo
    FROM community_posts AS posts
    LEFT JOIN community_users AS users ON users.id = posts.user_id
    WHERE posts.id = ?
    LIMIT 1
  `,
    [postId],
  );

  return mapRows(result)[0];
}

export async function getCommunityStats() {
  const [usersResult, postsResult] = await Promise.all([
    db.execute("SELECT COUNT(*) AS user_count FROM community_users"),
    db.execute("SELECT COUNT(*) AS post_count FROM community_posts"),
  ]);

  const [{ user_count: userCount } = {}] = mapRows(usersResult);
  const [{ post_count: postCount } = {}] = mapRows(postsResult);

  return {
    userCount: Number(userCount ?? 0),
    postCount: Number(postCount ?? 0),
  };
}

export async function getCommunityDemoUsers() {
  const result = await db.execute(
    `
    SELECT display_name, email, bio
    FROM community_users
    WHERE is_demo = 1
    ORDER BY id ASC
  `,
  );

  return mapRows(result);
}

export async function createCommunityUser({ displayName, email, password }) {
  const passwordHash = await createPasswordHash(password);

  const result = await db.execute(
    `
    INSERT INTO community_users (display_name, email, password_hash)
    VALUES (?, ?, ?)
  `,
    [displayName, email.toLowerCase(), passwordHash],
  );

  const insertedId = Number(result.lastInsertRowid);
  const userResult = await db.execute(
    "SELECT * FROM community_users WHERE id = ? LIMIT 1",
    [insertedId],
  );

  return mapRows(userResult)[0];
}

export async function createCommunitySession(userId) {
  await deleteExpiredCommunitySessions();
  await db.execute(
    `
    DELETE FROM community_sessions
    WHERE user_id = ?
      AND token NOT IN (
        SELECT token
        FROM community_sessions
        WHERE user_id = ?
          AND expires_at > datetime('now')
        ORDER BY expires_at DESC
        LIMIT 4
      )
  `,
    [userId, userId],
  );
  const sessionToken = createSessionToken();
  const expiresAt = new Date(Date.now() + COMMUNITY_SESSION_DURATION_MS)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);

  await db.execute(
    `
    INSERT INTO community_sessions (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `,
    [userId, sessionToken, expiresAt],
  );

  return sessionToken;
}

export async function revokeCommunitySession(sessionToken) {
  if (!sessionToken) {
    return;
  }

  await db.execute("DELETE FROM community_sessions WHERE token = ?", [
    sessionToken,
  ]);
}

export async function deleteExpiredCommunitySessions() {
  await db.execute(
    `
      DELETE FROM community_sessions
      WHERE expires_at <= datetime('now')
    `,
  );
}

export async function createCommunityPost({ userId, title, cuisine, body }) {
  const result = await db.execute(
    `
    INSERT INTO community_posts (user_id, title, cuisine, body)
    VALUES (?, ?, ?, ?)
  `,
    [userId, title, cuisine, body],
  );

  const insertedId = Number(result.lastInsertRowid);
  const postResult = await db.execute(
    `
    SELECT
      posts.id,
      posts.title,
      posts.cuisine,
      posts.body,
      posts.created_at,
      users.display_name AS author_name,
      users.email AS author_email,
      users.is_demo AS author_is_demo
    FROM community_posts AS posts
    LEFT JOIN community_users AS users ON users.id = posts.user_id
    WHERE posts.id = ?
    LIMIT 1
  `,
    [insertedId],
  );

  return mapRows(postResult)[0];
}

export async function deleteCommunityPost({ postId, userId }) {
  const result = await db.execute(
    `
      DELETE FROM community_posts
      WHERE id = ?
        AND user_id = ?
        AND seed_key IS NULL
    `,
    [postId, userId],
  );

  return result.rowsAffected > 0;
}

export async function updateCommunityPost({
  postId,
  userId,
  title,
  cuisine,
  body,
}) {
  const result = await db.execute(
    `
      UPDATE community_posts
      SET title = ?, cuisine = ?, body = ?
      WHERE id = ?
        AND user_id = ?
        AND seed_key IS NULL
    `,
    [title, cuisine, body, postId, userId],
  );

  return result.rowsAffected > 0;
}

export async function getCommunityAccessData() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COMMUNITY_SESSION_COOKIE)?.value;
  const guestMode = cookieStore.get(COMMUNITY_MODE_COOKIE)?.value === "guest";

  const currentUser = await getCommunityUserBySessionToken(sessionToken);

  return {
    currentUser,
    isGuest: guestMode && !currentUser,
    hasAccess: Boolean(currentUser) || guestMode,
  };
}

export async function getCommunityPageData() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COMMUNITY_SESSION_COOKIE)?.value;
  const guestMode = cookieStore.get(COMMUNITY_MODE_COOKIE)?.value === "guest";

  const [currentUser, posts, stats, demoUsers] = await Promise.all([
    getCommunityUserBySessionToken(sessionToken),
    getCommunityPosts(),
    getCommunityStats(),
    getCommunityDemoUsers(),
  ]);

  return {
    currentUser,
    isGuest: guestMode && !currentUser,
    hasAccess: Boolean(currentUser) || guestMode,
    posts,
    stats,
    demoUsers,
    demoPassword: COMMUNITY_DEFAULT_PASSWORD,
  };
}

export async function getCommunitySessionFromCookies() {
  const cookieStore = await cookies();

  return {
    sessionToken: cookieStore.get(COMMUNITY_SESSION_COOKIE)?.value ?? null,
    guestMode: cookieStore.get(COMMUNITY_MODE_COOKIE)?.value === "guest",
  };
}
