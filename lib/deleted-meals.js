const DELETED_MEALS_STORAGE_PREFIX = "deleted-meals";
const DELETED_MEALS_COOKIE_PREFIX = "deleted-meals";
const EMPTY_HIDDEN_MEALS = "[]";

function normalizeAccountId(accountId) {
  return String(accountId ?? "guest");
}

export function getDeletedMealsStorageKey(accountId) {
  return `${DELETED_MEALS_STORAGE_PREFIX}:${normalizeAccountId(accountId)}`;
}

export function getDeletedMealsCookieName(accountId) {
  return `${DELETED_MEALS_COOKIE_PREFIX}-${normalizeAccountId(accountId)}`;
}

export function parseDeletedMealIds(snapshot) {
  try {
    const parsedValue = JSON.parse(snapshot ?? EMPTY_HIDDEN_MEALS);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return [...new Set(parsedValue.map(String))];
  } catch {
    return [];
  }
}

export function stringifyDeletedMealIds(hiddenMealIds) {
  return JSON.stringify([...new Set(hiddenMealIds.map(String))]);
}

export function encodeDeletedMealsSnapshot(snapshot) {
  return encodeURIComponent(snapshot ?? EMPTY_HIDDEN_MEALS);
}

export function decodeDeletedMealsSnapshot(snapshot) {
  if (!snapshot) {
    return EMPTY_HIDDEN_MEALS;
  }

  try {
    return decodeURIComponent(snapshot);
  } catch {
    return snapshot;
  }
}