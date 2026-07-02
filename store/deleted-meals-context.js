"use client";

import {
  encodeDeletedMealsSnapshot,
  getDeletedMealsCookieName,
  getDeletedMealsStorageKey,
  parseDeletedMealIds,
  stringifyDeletedMealIds,
} from "@/lib/deleted-meals";
import {
  createContext,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";

const DELETED_MEALS_CHANGE_EVENT = "deleted-meals-change";

export const DeletedMealsContext = createContext({
  hiddenMealIds: [],
  isLoaded: false,
  hideMeal: () => {},
  restoreMeals: () => {},
});

function subscribeToHiddenMeals(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(DELETED_MEALS_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(DELETED_MEALS_CHANGE_EVENT, callback);
  };
}

export function DeletedMealsProvider({ children, accountId }) {
  const storageKey = useMemo(
    () => getDeletedMealsStorageKey(accountId),
    [accountId],
  );
  const cookieName = useMemo(
    () => getDeletedMealsCookieName(accountId),
    [accountId],
  );

  const getHiddenMealsSnapshot = useCallback(
    () => window.localStorage.getItem(storageKey) ?? "[]",
    [storageKey],
  );

  const getServerSnapshot = useCallback(() => "[]", []);

  const hiddenMealsSnapshot = useSyncExternalStore(
    subscribeToHiddenMeals,
    getHiddenMealsSnapshot,
    getServerSnapshot,
  );

  const hiddenMealIds = useMemo(
    () => parseDeletedMealIds(hiddenMealsSnapshot),
    [hiddenMealsSnapshot],
  );

  const setHiddenMealsSnapshot = useCallback(
    (nextHiddenMealIds) => {
      const nextSnapshot = stringifyDeletedMealIds(nextHiddenMealIds);

      window.localStorage.setItem(storageKey, nextSnapshot);
      document.cookie = `${cookieName}=${encodeDeletedMealsSnapshot(nextSnapshot)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
      window.dispatchEvent(new Event(DELETED_MEALS_CHANGE_EVENT));
    },
    [cookieName, storageKey],
  );

  useEffect(() => {
    document.cookie = `${cookieName}=${encodeDeletedMealsSnapshot(hiddenMealsSnapshot)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
  }, [cookieName, hiddenMealsSnapshot]);

  const hideMeal = useCallback(
    (mealId) => {
      const mealIdString = String(mealId);

      if (hiddenMealIds.includes(mealIdString)) {
        return;
      }

      const updatedHiddenMealIds = [
        ...hiddenMealIds,
        mealIdString,
      ];

      setHiddenMealsSnapshot(updatedHiddenMealIds);
    },
    [hiddenMealIds, setHiddenMealsSnapshot],
  );

  const restoreMeals = useCallback(() => {
    setHiddenMealsSnapshot([]);
  }, [setHiddenMealsSnapshot]);

  const contextValue = useMemo(
    () => ({
      hiddenMealIds,
      isLoaded: true,
      hideMeal,
      restoreMeals,
    }),
    [hiddenMealIds, hideMeal, restoreMeals],
  );

  return (
    <DeletedMealsContext.Provider value={contextValue}>
      {children}
    </DeletedMealsContext.Provider>
  );
}
