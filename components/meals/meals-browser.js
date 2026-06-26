"use client";

import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";

import { DeletedMealsContext } from "@/store/deleted-meals-context";
import MealSearchBar from "./meal-search-bar";
import classes from "./meals-browser.module.css";
import MealsGrid from "./meals-grid";

export default function MealsBrowser({
  meals,
  accessData,
  totalPages,
  currentPage,
}) {
  const { hiddenMealIds, isLoaded } = useContext(DeletedMealsContext);
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

  const filteredMeals = useMemo(() => {
    const normalized = debouncedTerm.trim().toLowerCase();
    if (!normalized) return visibleMeals;
    return visibleMeals.filter((meal) =>
      [meal.title, meal.summary, meal.creator]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [debouncedTerm, visibleMeals]);

  if (!isLoaded) {
    return <div className={classes.emptyState}>Loading meals...</div>;
  }

  if (visibleMeals.length === 0) {
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
