"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COMMUNITY_MODE_COOKIE,
  COMMUNITY_SESSION_COOKIE,
  COMMUNITY_SESSION_DURATION_SECONDS,
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
import {
  INPUT_LIMITS,
  validateEmail,
  validatePassword,
  validatePositiveInteger,
  validateRequiredText,
} from "./validation";

async function setCommunityCookies({ sessionToken = null, guestMode = false }) {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  if (sessionToken) {
    cookieStore.set(COMMUNITY_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: COMMUNITY_SESSION_DURATION_SECONDS,
    });
  } else {
    cookieStore.delete(COMMUNITY_SESSION_COOKIE);
  }

  if (guestMode) {
    cookieStore.set(COMMUNITY_MODE_COOKIE, "guest", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: COMMUNITY_SESSION_DURATION_SECONDS,
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
  const displayNameValidation = validateRequiredText(
    formData.get("displayName"),
    {
      label: "Display name",
      maxLength: INPUT_LIMITS.displayName,
    },
  );
  if (!displayNameValidation.valid) {
    return {
      message: displayNameValidation.message,
    };
  }

  const emailValidation = validateEmail(formData.get("email"));
  if (!emailValidation.valid) {
    return {
      message: emailValidation.message,
    };
  }

  const passwordValidation = validatePassword(formData.get("password"));
  if (!passwordValidation.valid) {
    return {
      message: passwordValidation.message,
    };
  }

  const redirectTo = getRedirectPath(formData);
  try {
    const existingUser = await getCommunityUserByEmail(emailValidation.value);
    if (existingUser) {
      return {
        message: "That email is already registered. Try logging in instead.",
      };
    }
    const user = await createCommunityUser({
      displayName: displayNameValidation.value,
      email: emailValidation.value,
      password: passwordValidation.value,
    });
    const sessionToken = await createCommunitySession(user.id);
    await setCommunityCookies({
      sessionToken,
      guestMode: false,
    });
  } catch (error) {
    console.error("Failed to create community account:", error);
    return {
      message: "Your account could not be created. Please try again.",
    };
  }

  revalidatePath("/community");
  revalidatePath("/meals");
  redirect(redirectTo);
}

export async function logInCommunityUser(prevState, formData) {
  const emailValidation = validateEmail(formData.get("email"));
  if (!emailValidation.valid) {
    return {
      message: "Please provide a valid email and password.",
    };
  }

  const passwordValidation = validatePassword(formData.get("password"), {
    requireMinimumLength: false,
  });
  if (!passwordValidation.valid) {
    return {
      message: "Please provide a valid email and password.",
    };
  }

  const redirectTo = getRedirectPath(formData);
  try {
    const user = await getCommunityUserByEmail(emailValidation.value);
    if (!user) {
      return {
        message: "Invalid login credentials.",
      };
    }
    const passwordIsValid = await verifyPassword(
      passwordValidation.value,
      user.password_hash,
    );
    if (!passwordIsValid) {
      return {
        message: "Invalid login credentials.",
      };
    }
    const sessionToken = await createCommunitySession(user.id);
    await setCommunityCookies({
      sessionToken,
      guestMode: false,
    });
  } catch (error) {
    console.error("Failed to log in:", error);
    return {
      message: "Login is temporarily unavailable. Please try again.",
    };
  }

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
  const titleValidation = validateRequiredText(formData.get("title"), {
    label: "Title",
    maxLength: INPUT_LIMITS.postTitle,
  });

  if (!titleValidation.valid) {
    return {
      message: titleValidation.message,
    };
  }

  const cuisineValidation = validateRequiredText(formData.get("cuisine"), {
    label: "Cuisine",
    maxLength: INPUT_LIMITS.cuisine,
  });

  if (!cuisineValidation.valid) {
    return {
      message: cuisineValidation.message,
    };
  }

  const bodyValidation = validateRequiredText(formData.get("body"), {
    label: "Food story",
    maxLength: INPUT_LIMITS.postBody,
  });

  if (!bodyValidation.valid) {
    return {
      message: bodyValidation.message,
    };
  }

  const { sessionToken, guestMode } = await getCommunitySessionFromCookies();
  if (guestMode || !sessionToken) {
    return {
      message:
        "Guests can browse, but they cannot post. Log in or sign up to share something.",
    };
  }

  const currentUser = await getCommunityUserBySessionToken(sessionToken);
  if (!currentUser) {
    return {
      message: "Your session expired. Please log in again.",
    };
  }

  try {
    await createCommunityPost({
      userId: currentUser.id,
      title: titleValidation.value,
      cuisine: cuisineValidation.value,
      body: bodyValidation.value,
    });
  } catch (error) {
    console.error("Failed to create community post:", error);

    return {
      message: "The post could not be published. Please try again.",
    };
  }

  revalidatePath("/community");
  redirect("/community");
}

export async function deleteCommunityPostAction(formData) {
  const postIdValidation = validatePositiveInteger(
    formData.get("postId"),
    "Post",
  );
  if (!postIdValidation.valid) {
    return {
      deleted: false,
      message: postIdValidation.message,
    };
  }

  const { sessionToken, guestMode } = await getCommunitySessionFromCookies();
  if (guestMode || !sessionToken) {
    return {
      deleted: false,
      message: "You must be logged in to delete a post.",
    };
  }

  const currentUser = await getCommunityUserBySessionToken(sessionToken);
  if (!currentUser) {
    return {
      deleted: false,
      message: "Your session expired. Please log in again.",
    };
  }
  try {
    await deleteCommunityPost({
      postId: postIdValidation.value,
      userId: currentUser.id,
    });
  } catch (error) {
    console.error("Failed to delete community post:", error);
    return {
      deleted: false,
      message: "The post could not be deleted. Please try again.",
    };
  }
  revalidatePath("/community");
  return {
    deleted: true,
  };
}

export async function updateCommunityPostAction(prevState, formData) {
  const postIdValidation = validatePositiveInteger(
    formData.get("postId"),
    "Post",
  );
  if (!postIdValidation.valid) {
    return {
      message: postIdValidation.message,
    };
  }

  const titleValidation = validateRequiredText(formData.get("title"), {
    label: "Title",
    maxLength: INPUT_LIMITS.postTitle,
  });
  if (!titleValidation.valid) {
    return {
      message: titleValidation.message,
    };
  }

  const cuisineValidation = validateRequiredText(formData.get("cuisine"), {
    label: "Cuisine",
    maxLength: INPUT_LIMITS.cuisine,
  });
  if (!cuisineValidation.valid) {
    return {
      message: cuisineValidation.message,
    };
  }

  const bodyValidation = validateRequiredText(formData.get("body"), {
    label: "Food story",
    maxLength: INPUT_LIMITS.postBody,
  });
  if (!bodyValidation.valid) {
    return {
      message: bodyValidation.message,
    };
  }

  const { sessionToken, guestMode } = await getCommunitySessionFromCookies();
  if (guestMode || !sessionToken) {
    return {
      message: "Guests can browse, but they cannot edit posts.",
    };
  }

  const currentUser = await getCommunityUserBySessionToken(sessionToken);
  if (!currentUser) {
    return {
      message: "Your session expired. Please log in again.",
    };
  }
  try {
    await updateCommunityPost({
      postId: postIdValidation.value,
      userId: currentUser.id,
      title: titleValidation.value,
      cuisine: cuisineValidation.value,
      body: bodyValidation.value,
    });
  } catch (error) {
    console.error("Failed to update community post:", error);
    return {
      message: "The post could not be updated. Please try again.",
    };
  }

  revalidatePath("/community");
  redirect("/community");
}
