export const INPUT_LIMITS = {
  displayName: 60,
  email: 254,
  passwordMin: 6,
  passwordMax: 64,

  mealTitle: 100,
  mealSummary: 300,
  mealInstructions: 10000,

  postTitle: 120,
  cuisine: 60,
  postBody: 5000,
};

export function normalizeText(value) {
  return String(value ?? "").trim();
}

function createValidResult(value) {
  return {
    valid: true,
    value,
    message: null,
  };
}

function createInvalidResult(value, message) {
  return {
    valid: false,
    value,
    message,
  };
}

export function validateRequiredText(value, { label, maxLength }) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return createInvalidResult("", `${label} is required.`);
  }

  if (normalizedValue.length > maxLength) {
    return createInvalidResult(
      normalizedValue,
      `${label} must be ${maxLength} characters or fewer.`,
    );
  }

  return createValidResult(normalizedValue);
}

export function validateEmail(value) {
  const normalizedEmail = normalizeText(value).toLowerCase();

  if (!normalizedEmail) {
    return createInvalidResult("", "Email is required.");
  }

  if (normalizedEmail.length > INPUT_LIMITS.email) {
    return createInvalidResult(
      normalizedEmail,
      `Email must be ${INPUT_LIMITS.email} characters or fewer.`,
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return createInvalidResult(
      normalizedEmail,
      "Please provide a valid email address.",
    );
  }

  return createValidResult(normalizedEmail);
}

export function validatePassword(value, { requireMinimumLength = true } = {}) {
  const password = String(value ?? "");

  if (!password) {
    return createInvalidResult("", "Password is required.");
  }

  if (requireMinimumLength && password.length < INPUT_LIMITS.passwordMin) {
    return createInvalidResult(
      password,
      `Password must be at least ${INPUT_LIMITS.passwordMin} characters.`,
    );
  }

  if (password.length > INPUT_LIMITS.passwordMax) {
    return createInvalidResult(
      password,
      `Password must be ${INPUT_LIMITS.passwordMax} characters or fewer.`,
    );
  }

  return createValidResult(password);
}

export function validatePositiveInteger(value, label = "ID") {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return createInvalidResult(null, `Invalid ${label.toLowerCase()}.`);
  }

  return createValidResult(numberValue);
}
