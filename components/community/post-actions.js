import DeleteMealModal from "@/components/meals/delete-meal-modal";
import { deleteCommunityPostAction } from "@/lib/community-actions";
import Link from "next/link";
import { useRef, useState } from "react";
import classes from "./post-actions.module.css";

export default function PostActions({ post }) {
  const formRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleOpenModal() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    if (!isDeleting) {
      setIsModalOpen(false);
    }
  }

  function handleConfirmDelete() {
    setIsDeleting(true);
    formRef.current?.requestSubmit();
  }

  return (
    <div className={classes.postActions}>
      <Link
        href={`/community/posts/${post.id}/edit`}
        className={classes.postActionButton}
      >
        Edit
      </Link>

      <form
        ref={formRef}
        action={deleteCommunityPostAction}
        className={classes.deleteForm}
      >
        <input type="hidden" name="postId" value={post.id} />
        <button
          type="button"
          className={classes.postActionButton}
          onClick={handleOpenModal}
          disabled={isModalOpen || isDeleting}
        >
          Delete post
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
