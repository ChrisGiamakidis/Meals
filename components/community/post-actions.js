"use client";

import DeleteMealModal from "@/components/meals/delete-meal-modal";
import { deleteCommunityPostAction } from "@/lib/community-actions";
import Link from "next/link";
import { useRef, useState } from "react";
import classes from "./post-actions.module.css";

export default function PostActions({ post, iconOnly = false }) {
  const formRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleOpenModal() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    if (!isDeleting) setIsModalOpen(false);
  }

  function handleConfirmDelete() {
    setIsDeleting(true);
    formRef.current?.requestSubmit();
  }

  return (
    <div className={iconOnly ? classes.postActionsIcon : classes.postActions}>
      <Link
        href={`/community/posts/${post.id}/edit`}
        className={iconOnly ? classes.iconButton : classes.postActionButton}
        title="Edit post"
      >
        {iconOnly ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        ) : (
          "Edit"
        )}
      </Link>

      <form
        ref={formRef}
        action={deleteCommunityPostAction}
        className={classes.deleteForm}
      >
        <input type="hidden" name="postId" value={post.id} />
        <button
          type="button"
          className={
            iconOnly ? classes.iconButtonDelete : classes.postActionButton
          }
          onClick={handleOpenModal}
          disabled={isModalOpen || isDeleting}
          title="Delete post"
        >
          {iconOnly ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          ) : (
            "Delete post"
          )}
        </button>
      </form>

      <DeleteMealModal
        open={isModalOpen}
        title={post.title}
        action="delete"
        entityLabel="post"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseModal}
      />
    </div>
  );
}
