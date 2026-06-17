"use client";

import Link from "next/link";
import { useContext, useMemo, useState } from "react";

import { DeletedMealsContext } from "@/store/deleted-meals-context";
import MealSearchBar from "./meal-search-bar";
import MealsGrid from "./meals-grid";
import classes from "./meals-browser.module.css";

export default function MealsBrowser({ meals }) {
  const { hiddenMealIds, isLoaded } = useContext(DeletedMealsContext);
  const [searchTerm, setSearchTerm] = useState("");

  const visibleMeals = useMemo(
    () => meals.filter((meal) => !hiddenMealIds.includes(String(meal.id))),
    [hiddenMealIds, meals],
  );

  const filteredMeals = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return visibleMeals;
    }

    return visibleMeals.filter((meal) => {
      const searchableText = [meal.title, meal.summary, meal.creator]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearchTerm);
    });
  }, [searchTerm, visibleMeals]);

  if (!isLoaded) {
    return <div className={classes.emptyState}>Loading meals...</div>;
  }

  if (visibleMeals.length === 0) {
    return (
      <div className={classes.emptyState}>
        <p>No meals available yet. Please add yours.</p>
        <Link href="/meals/share">+ Add Meal</Link>
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
          <Link href="/meals/share" className={classes.shareButton}>
            Share Your Favourite Recipe
          </Link>
        </div>
      </div>

      {filteredMeals.length === 0 ? (
        <div className={classes.noResults}>
          <p>No meals match your search.</p>
          <button type="button" onClick={() => setSearchTerm("") }>
            Clear search
          </button>
        </div>
      ) : (
        <MealsGrid meals={filteredMeals} />
      )}
    </section>
  );
}