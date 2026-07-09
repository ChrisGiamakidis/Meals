"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

import { deleteMealEntry } from "@/lib/actions";
import { DeletedMealsContext } from "../../store/deleted-meals-context";
import DeleteMealModal from "./delete-meal-modal";
import classes from "./meal-item.module.css";

export default function MealItem({
  id,
  title,
  slug,
  image,
  summary,
  creator,
  creator_id,
  currentUser,
}) {
  const { hideMeal } = useContext(DeletedMealsContext);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const isSeedMeal = (() => {
    try {
      return new URL(image).pathname.startsWith("/seed/");
    } catch {
      return true;
    }
  })();

  const isOwner =
    Boolean(currentUser?.id && creator_id) &&
    Number(currentUser.id) === Number(creator_id);

  const canEditMeal = Boolean(currentUser) && !isSeedMeal && isOwner;

  const canHideSeedMeal = Boolean(currentUser) && isSeedMeal;

  const canDeleteMeal = Boolean(currentUser) && !isSeedMeal && isOwner;

  const canUseMealAction = canHideSeedMeal || canDeleteMeal;

  function handleOpenModal() {
    setDeleteError("");
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    if (!isDeleting) {
      setDeleteError("");
      setIsModalOpen(false);
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError("");

    try {
      if (isSeedMeal) {
        hideMeal(id);
        setIsModalOpen(false);
        return;
      }

      const result = await deleteMealEntry(id);
      if (!result?.deleted) {
        setDeleteError(
          result?.message ?? "The meal could not be deleted. Please try again.",
        );
        return;
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete meal:", error);
      setDeleteError("Something went wrong while deleting the meal.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article className={classes.meal}>
      <Link href={`/meals/${slug}`} className={classes.clickableArea}>
        <header>
          <div className={classes.image}>
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={75}
              loading="eager"
            />
          </div>

          <div className={classes.headerText}>
            <h2>{title}</h2>
            <p>by {creator}</p>
          </div>
        </header>

        <p className={classes.summary}>{summary}</p>
      </Link>

      <div className={classes.actions}>
        <Link href={`/meals/${slug}`}>View Details</Link>

        {canEditMeal ? <Link href={`/meals/${slug}/edit`}>Edit</Link> : null}

        {canUseMealAction ? (
          <button type="button" onClick={handleOpenModal}>
            {isSeedMeal ? "Hide" : "Delete"}
          </button>
        ) : null}
      </div>

      {deleteError ? <p className={classes.error}>{deleteError}</p> : null}

      {canUseMealAction ? (
        <DeleteMealModal
          open={isModalOpen}
          title={title}
          action={isSeedMeal ? "hide" : "delete"}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={handleCloseModal}
        />
      ) : null}
    </article>
  );
}
