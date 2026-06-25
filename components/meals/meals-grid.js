"use client";

import MealItem from "./meal-item";
import classes from "./meals-grid.module.css";

export default function MealsGrid({ meals, currentUser, isGuest }) {
  return (
    <ul className={classes.meals}>
      {meals.map((meal) => (
        <li key={meal.id}>
          <MealItem {...meal} currentUser={currentUser} isGuest={isGuest} />
        </li>
      ))}
    </ul>
  );
}
