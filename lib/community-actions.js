"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  COMMUNITY_MODE_COOKIE,
  COMMUNITY_SESSION_COOKIE,
  createCommunityPost,
  createCommunitySession,
  createCommunityUser,
  deleteCommunityPost,
  getCommunitySessionFromCookies,
  getCommunityUserByEmail,
  getCommunityUserBySessionToken,
  revokeCommunitySession,
  updateCommunityPost,
  verifyPassword,
} from "./community";

function isInvalidText(value) {
  return !value || value.trim() === "";
}

async function setCommunityCookies({ sessionToken = null, guestMode = false }) {
  const cookieStore = await cookies();

  if (sessionToken) {
    cookieStore.set(COMMUNITY_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } else {
    cookieStore.delete(COMMUNITY_SESSION_COOKIE);
  }

  if (guestMode) {
    cookieStore.set(COMMUNITY_MODE_COOKIE, "guest", {
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } else {
    cookieStore.delete(COMMUNITY_MODE_COOKIE);
  }
}

function getRedirectPath(formData, fallback = "/community") {
  const redirectTo = String(formData.get("redirectTo") ?? "");

  if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }

  return fallback;
}

export async function signUpCommunityUser(prevState, formData) {
  const displayName = String(formData.get("displayName") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = getRedirectPath(formData);

  if (
    isInvalidText(displayName) ||
    isInvalidText(email) ||
    !email.includes("@") ||
    password.length < 6
  ) {
    return {
      message:
        "Please provide a name, a valid email, and a password with at least 6 characters.",
    };
  }

  const existingUser = await getCommunityUserByEmail(email);

  if (existingUser) {
    return {
      message: "That email is already registered. Try logging in instead.",
    };
  }

  const user = await createCommunityUser({ displayName, email, password });
  const sessionToken = await createCommunitySession(user.id);

  await setCommunityCookies({ sessionToken, guestMode: false });
  revalidatePath("/community");
  revalidatePath("/meals");
  redirect(redirectTo);
}

export async function logInCommunityUser(prevState, formData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = getRedirectPath(formData);

  if (isInvalidText(email) || !email.includes("@") || isInvalidText(password)) {
    return { message: "Please provide a valid email and password." };
  }

  const user = await getCommunityUserByEmail(email);

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { message: "Invalid login credentials." };
  }

  const sessionToken = await createCommunitySession(user.id);

  await setCommunityCookies({ sessionToken, guestMode: false });
  revalidatePath("/community");
  revalidatePath("/meals");
  redirect(redirectTo);
}

export async function logOutCommunityUser(formData) {
  const { sessionToken } = await getCommunitySessionFromCookies();
  const redirectTo = formData ? getRedirectPath(formData) : "/community";

  if (sessionToken) {
    await revokeCommunitySession(sessionToken);
  }

  await setCommunityCookies({ sessionToken: null, guestMode: false });
  revalidatePath("/community");
  revalidatePath("/meals");
  redirect(redirectTo);
}

export async function createCommunityPostAction(prevState, formData) {
  const title = String(formData.get("title") ?? "");
  const cuisine = String(formData.get("cuisine") ?? "");
  const body = String(formData.get("body") ?? "");
  const { sessionToken, guestMode } = await getCommunitySessionFromCookies();

  if (guestMode || !sessionToken) {
    return {
      message:
        "Guests can browse, but they cannot post. Log in or sign up to share something.",
    };
  }

  const currentUser = await getCommunityUserBySessionToken(sessionToken);

  if (!currentUser) {
    return { message: "Your session expired. Please log in again." };
  }

  if (isInvalidText(title) || isInvalidText(cuisine) || isInvalidText(body)) {
    return {
      message: "Please fill in the title, cuisine, and your food story.",
    };
  }

  await createCommunityPost({
    userId: currentUser.id,
    title,
    cuisine,
    body,
  });

  revalidatePath("/community");
  redirect("/community");
}
export async function deleteCommunityPostAction(formData) {
  const postId = Number(formData.get("postId"));
  const { sessionToken, guestMode } = await getCommunitySessionFromCookies();

  if (!postId || guestMode || !sessionToken) {
    return;
  }

  const currentUser = await getCommunityUserBySessionToken(sessionToken);

  if (!currentUser) {
    return;
  }

  await deleteCommunityPost({ postId, userId: currentUser.id });
  revalidatePath("/community");
}

export async function updateCommunityPostAction(prevState, formData) {
  const postId = Number(formData.get("postId"));
  const title = String(formData.get("title") ?? "");
  const cuisine = String(formData.get("cuisine") ?? "");
  const body = String(formData.get("body") ?? "");
  const { sessionToken, guestMode } = await getCommunitySessionFromCookies();

  if (!postId || guestMode || !sessionToken) {
    return { message: "Guests can browse, but they cannot edit posts." };
  }

  const currentUser = await getCommunityUserBySessionToken(sessionToken);

  if (!currentUser) {
    return { message: "Your session expired. Please log in again." };
  }

  if (isInvalidText(title) || isInvalidText(cuisine) || isInvalidText(body)) {
    return {
      message: "Please fill in the title, cuisine, and your food story.",
    };
  }

  await updateCommunityPost({
    postId,
    userId: currentUser.id,
    title,
    cuisine,
    body,
  });

  revalidatePath("/community");
  redirect("/community");
}
