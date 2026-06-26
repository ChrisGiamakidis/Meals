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
  heading = "Share your story",
  subheading,
  placeholder = "Your food story...",
}) {
  const action = post ? updateCommunityPostAction : createCommunityPostAction;
  const [state, formAction] = useActionState(action, { message: null });
  const canPost = Boolean(currentUser);
  const resolvedPendingLabel =
    pendingLabel ?? (post ? "Applying changes..." : "Publishing...");
  const isEditPage = Boolean(post);

  return (
    <form action={formAction} className={classes.postComposer}>
      <p className={classes.composerHeading}>{heading}</p>
      {subheading && <p className={classes.composerSub}>{subheading}</p>}

      {post ? <input type="hidden" name="postId" value={post.id} /> : null}

      {isEditPage ? (
        <>
          <div className={classes.composerRow}>
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
        </>
      ) : (
        <>
          <div className={classes.composerRow}>
            <input
              name="title"
              placeholder="Title"
              defaultValue=""
              disabled={!canPost}
            />
            <input
              name="cuisine"
              placeholder="Cuisine"
              defaultValue=""
              disabled={!canPost}
            />
          </div>
          <textarea
            name="body"
            rows="4"
            placeholder={placeholder}
            defaultValue=""
            disabled={!canPost}
          />
        </>
      )}

      {state?.message ? <p className={classes.error}>{state.message}</p> : null}

      {canPost ? (
        <SubmitButton pendingLabel={resolvedPendingLabel}>
          {submitLabel}
        </SubmitButton>
      ) : null}
    </form>
  );
}
