"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

import { deleteMealEntry } from "@/lib/actions";
import { DeletedMealsContext } from "../../store/deleted-meals-context";
import DeleteMealModal from "./delete-meal-modal";
import classes from "./meal-item.module.css";

export default function MealItem({ id, title, slug, image, summary, creator }) {
  const { hideMeal } = useContext(DeletedMealsContext);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSeedMeal = (() => {
    try {
      return new URL(image).pathname.startsWith("/seed/");
    } catch {
      return true;
    }
  })();

  function handleOpenModal() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    if (!isDeleting) {
      setIsModalOpen(false);
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);

    try {
      if (!isSeedMeal) {
        await deleteMealEntry(id, image);
        router.refresh();
      }

      hideMeal(id);
      setIsModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article className={classes.meal}>
      <header>
        <div className={classes.image}>
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="eager"
          />
        </div>
        <div className={classes.headerText}>
          <h2>{title}</h2>
          <p>by {creator}</p>
        </div>
      </header>
      <div className={classes.content}>
        <p className={classes.summary}>{summary}</p>
        <div className={classes.actions}>
          <Link href={`/meals/${slug}`}>View Details</Link>
          <button type="button" onClick={handleOpenModal}>
            Delete
          </button>
        </div>
      </div>
      <DeleteMealModal
        open={isModalOpen}
        title={title}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseModal}
      />
    </article>
  );
}
