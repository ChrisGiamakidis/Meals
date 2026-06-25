"use client";

import { createContext, useEffect, useState } from "react";

const DELETED_MEALS_STORAGE_KEY = "deleted-meals";

export const DeletedMealsContext = createContext({
  hiddenMealIds: [],
  isLoaded: false,
  hideMeal: () => {},
});

function readHiddenMealIds() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(DELETED_MEALS_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : [];
  } catch {
    return [];
  }
}

function writeHiddenMealIds(hiddenMealIds) {
  window.localStorage.setItem(
    DELETED_MEALS_STORAGE_KEY,
    JSON.stringify(hiddenMealIds),
  );
}

export function DeletedMealsProvider({ children }) {
  const [hiddenMealIds, setHiddenMealIds] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedHiddenMealIds = readHiddenMealIds();
    setHiddenMealIds(storedHiddenMealIds);
    setIsLoaded(true);
  }, []);

  function hideMeal(mealId) {
    const mealIdString = String(mealId);

    setHiddenMealIds((currentHiddenMealIds) => {
      if (currentHiddenMealIds.includes(mealIdString)) {
        return currentHiddenMealIds;
      }

      const updatedHiddenMealIds = [...currentHiddenMealIds, mealIdString];
      writeHiddenMealIds(updatedHiddenMealIds);
      return updatedHiddenMealIds;
    });
  }

  const deletedMealsContext = { hiddenMealIds, isLoaded, hideMeal };

  return (
    <DeletedMealsContext.Provider value={deletedMealsContext}>
      {children}
    </DeletedMealsContext.Provider>
  );
}
