"use client";

import classes from "./meal-search-bar.module.css";

export default function MealSearchBar({ value, onChange }) {
  return (
    <div className={classes.searchBar}>
      <label htmlFor="meal-search">Search meals</label>
      <input
        id="meal-search"
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Search by title, summary, or creator"
      />
    </div>
  );
}
