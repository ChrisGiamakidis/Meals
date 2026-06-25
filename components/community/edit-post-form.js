"use client";

import { useActionState } from "react";

import {
  createCommunityPostAction,
  updateCommunityPostAction,
} from "@/lib/community-actions";
import classes from "./community-hub.module.css";
import SubmitButton from "./submit-button";

export default function EditPostForm({
  currentUser,
  post = null,
  submitLabel = "Publish post",
  pendingLabel,
  heading = "Share a post to the feed",
  placeholder = "Tell the community about your food experience",
}) {
  const action = post ? updateCommunityPostAction : createCommunityPostAction;
  const [state, formAction] = useActionState(action, { message: null });
  const canPost = Boolean(currentUser);
  const resolvedPendingLabel =
    pendingLabel ?? (post ? "Applying changes..." : "Publishing...");

  return (
    <form action={formAction} className={classes.postComposer}>
      <div className={classes.composerHeader}>
        <div>
          <p className={classes.panelLabel}>{heading}</p>
        </div>
      </div>

      {post ? <input type="hidden" name="postId" value={post.id} /> : null}

      <div className={classes.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          placeholder="Enter a title"
          defaultValue={post?.title ?? ""}
          disabled={!canPost}
        />
      </div>

      <div className={classes.formGroup}>
        <label htmlFor="cuisine">Cuisine / Topic</label>
        <input
          id="cuisine"
          name="cuisine"
          placeholder="e.g. Italian, Dessert, Baking"
          defaultValue={post?.cuisine ?? ""}
          disabled={!canPost}
        />
      </div>

      <div className={classes.formGroup}>
        <label htmlFor="body">Content</label>
        <textarea
          id="body"
          name="body"
          rows="5"
          placeholder={placeholder}
          defaultValue={post?.body ?? ""}
          disabled={!canPost}
        />
      </div>

      {!canPost ? (
        <p className={classes.muted}>
          Log in or sign up to post. Guests can only browse.
        </p>
      ) : null}

      {state?.message ? <p className={classes.error}>{state.message}</p> : null}
      {canPost ? (
        <SubmitButton pendingLabel={resolvedPendingLabel}>
          {submitLabel}
        </SubmitButton>
      ) : null}
    </form>
  );
}
