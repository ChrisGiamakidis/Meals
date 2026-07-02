"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState, useTransition } from "react";

import { DeletedMealsContext } from "@/store/deleted-meals-context";
import MealSearchBar from "./meal-search-bar";
import classes from "./meals-browser.module.css";
import MealsGrid from "./meals-grid";

export default function MealsBrowser({
  meals,
  accessData,
  pageSize,
  currentPage,
}) {
  const { hiddenMealIds, isLoaded, restoreMeals } =
    useContext(DeletedMealsContext);
  const router = useRouter();
  const [isRestoringMeals, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const currentUser = accessData?.currentUser ?? null;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const visibleMeals = useMemo(
    () => meals.filter((meal) => !hiddenMealIds.includes(String(meal.id))),
    [hiddenMealIds, meals],
  );

  const totalPages = Math.max(1, Math.ceil(visibleMeals.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageMeals = useMemo(
    () => visibleMeals.slice(startIndex, startIndex + pageSize),
    [startIndex, visibleMeals, pageSize],
  );
  const isPageOutOfRange = currentPage > totalPages;

  useEffect(() => {
    if (currentPage <= totalPages) {
      return;
    }

    router.replace(totalPages > 1 ? `/meals?page=${totalPages}` : "/meals");
  }, [currentPage, router, totalPages]);

  const filteredMeals = useMemo(() => {
    const normalized = debouncedTerm.trim().toLowerCase();
    if (!normalized) return pageMeals;
    return pageMeals.filter((meal) =>
      [meal.title, meal.summary, meal.creator]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [debouncedTerm, pageMeals]);

  if (!isLoaded) {
    return <div className={classes.emptyState}>Loading meals...</div>;
  }

  if (isRestoringMeals) {
    return <div className={classes.emptyState}>Restoring hidden meals...</div>;
  }

  if (isPageOutOfRange) {
    return <div className={classes.emptyState}>Updating meals...</div>;
  }

  if (pageMeals.length === 0) {
    return (
      <div className={classes.emptyState}>
        <p>No meals available yet. Please add yours.</p>
        {currentUser ? <Link href="/meals/share">+ Add Meal</Link> : null}
      </div>
    );
  }

  return (
    <section className={classes.browser}>
      <div className={classes.toolbar}>
        <div className={classes.controls}>
          <MealSearchBar
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {currentUser && hiddenMealIds.length > 0 ? (
            <button
              type="button"
              className={classes.restoreButton}
              disabled={isRestoringMeals}
              onClick={() => {
                startTransition(() => {
                  restoreMeals();
                  router.refresh();
                });
              }}
            >
              Restore Hidden Meals
            </button>
          ) : null}
          {currentUser ? (
            <Link href="/meals/share" className={classes.shareButton}>
              Share Your Favourite Recipe
            </Link>
          ) : (
            <Link
              href="/auth?redirectTo=/meals"
              className={classes.loginButton}
            >
              Log in / Sign up
            </Link>
          )}
        </div>
      </div>

      {filteredMeals.length === 0 ? (
        <div className={classes.noResults}>
          <p>No meals match your search.</p>
          <button type="button" onClick={() => setSearchTerm("")}>
            Clear search
          </button>
        </div>
      ) : (
        <MealsGrid meals={filteredMeals} currentUser={currentUser} />
      )}

      {totalPages > 1 && (
        <div className={classes.pagination}>
          {currentPage > 1 && (
            <Link
              href={`/meals?page=${currentPage - 1}`}
              className={classes.pageButton}
            >
              ← Previous
            </Link>
          )}
          <span className={classes.pageInfo}>
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/meals?page=${currentPage + 1}`}
              className={classes.pageButton}
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
