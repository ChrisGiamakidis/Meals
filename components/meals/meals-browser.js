"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState, useTransition } from "react";

import { DeletedMealsContext } from "@/store/deleted-meals-context";
import MealSearchBar from "./meal-search-bar";
import classes from "./meals-browser.module.css";
import MealsGrid from "./meals-grid";
import MealsPagination from "./meals-pagination";
import MealsToolbar from "./meals-toolbar";

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
    const timer = window.setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const visibleMeals = useMemo(
    () => meals.filter((meal) => !hiddenMealIds.includes(String(meal.id))),
    [hiddenMealIds, meals],
  );

  const searchedMeals = useMemo(() => {
    const normalizedTerm = debouncedTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return visibleMeals;
    }

    return visibleMeals.filter((meal) =>
      [meal.title, meal.summary, meal.creator]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedTerm),
    );
  }, [debouncedTerm, visibleMeals]);

  const totalPages = Math.max(1, Math.ceil(searchedMeals.length / pageSize));

  const isPageOutOfRange = currentPage > totalPages;

  const startIndex = (currentPage - 1) * pageSize;

  const pageMeals = useMemo(
    () => searchedMeals.slice(startIndex, startIndex + pageSize),
    [pageSize, searchedMeals, startIndex],
  );

  useEffect(() => {
    if (!isPageOutOfRange) {
      return;
    }

    router.replace(totalPages > 1 ? `/meals?page=${totalPages}` : "/meals");
  }, [isPageOutOfRange, router, totalPages]);

  useEffect(() => {
    if (!debouncedTerm || currentPage === 1) {
      return;
    }

    router.replace("/meals");
  }, [currentPage, debouncedTerm, router]);

  function handleRestoreMeals() {
    startTransition(() => {
      restoreMeals();
      router.replace("/meals");
      router.refresh();
    });
  }

  function handleClearSearch() {
    setSearchTerm("");
    setDebouncedTerm("");

    if (currentPage !== 1) {
      router.replace("/meals");
    }
  }

  if (!isLoaded) {
    return <div className={classes.emptyState}>Loading meals...</div>;
  }

  if (isRestoringMeals) {
    return <div className={classes.emptyState}>Restoring hidden meals...</div>;
  }

  if (isPageOutOfRange) {
    return <div className={classes.emptyState}>Updating meals...</div>;
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
      <MealsToolbar
        currentUser={currentUser}
        hiddenMealCount={hiddenMealIds}
        isRestoringMeals={isRestoringMeals}
        searchTerm={searchTerm}
        onSearchChange={(event) => setSearchTerm(event.target.value)}
        onRestoreMeals={handleRestoreMeals}
      />

      {pageMeals.length === 0 && debouncedTerm ? (
        <div className={classes.noResults}>
          <p>No meals match your search.</p>

          <button type="button" onClick={handleClearSearch}>
            Clear search
          </button>
        </div>
      ) : (
        <MealsGrid meals={pageMeals} currentUser={currentUser} />
      )}

      <MealsPagination currentPage={currentPage} totalPages={totalPages} />
    </section>
  );
}
