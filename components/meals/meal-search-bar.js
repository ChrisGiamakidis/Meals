"use client";

import classes from "./meal-search-bar.module.css";

export default function MealSearchBar({ value, onChange }) {
  return (
    <input
      id="meal-search"
      type="search"
      value={value}
      onChange={onChange}
      placeholder="Search meals..."
      className={classes.searchInput}
      aria-label="Search meals"
    />
  );
}
