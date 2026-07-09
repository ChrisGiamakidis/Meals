import { describe, expect, it } from "vitest";

import {
  INPUT_LIMITS,
  normalizeText,
  validateEmail,
  validatePassword,
  validatePositiveInteger,
  validateRequiredText,
} from "../lib/validation";

describe("normalizeText", () => {
  it("trims text values", () => {
    expect(normalizeText("  hello  ")).toBe("hello");
  });

  it("converts nullish values to empty strings", () => {
    expect(normalizeText(null)).toBe("");
    expect(normalizeText(undefined)).toBe("");
  });
});

describe("validateRequiredText", () => {
  it("accepts valid text and returns the normalized value", () => {
    const result = validateRequiredText("  My title  ", {
      label: "Title",
      maxLength: INPUT_LIMITS.mealTitle,
    });

    expect(result).toEqual({
      valid: true,
      value: "My title",
      message: null,
    });
  });

  it("rejects empty text", () => {
    const result = validateRequiredText("   ", {
      label: "Title",
      maxLength: INPUT_LIMITS.mealTitle,
    });

    expect(result.valid).toBe(false);
    expect(result.message).toBe("Title is required.");
  });

  it("rejects text over the max length", () => {
    const result = validateRequiredText("a".repeat(101), {
      label: "Title",
      maxLength: 100,
    });

    expect(result.valid).toBe(false);
    expect(result.message).toBe("Title must be 100 characters or fewer.");
  });
});

describe("validateEmail", () => {
  it("accepts valid emails and normalizes them", () => {
    const result = validateEmail("  TEST@Example.COM  ");

    expect(result).toEqual({
      valid: true,
      value: "test@example.com",
      message: null,
    });
  });

  it("rejects invalid emails", () => {
    const result = validateEmail("not-an-email");

    expect(result.valid).toBe(false);
    expect(result.message).toBe("Please provide a valid email address.");
  });

  it("rejects emails over the max length", () => {
    const result = validateEmail(`${"a".repeat(INPUT_LIMITS.email)}@x.com`);

    expect(result.valid).toBe(false);
  });
});

describe("validatePassword", () => {
  it("accepts valid passwords", () => {
    const result = validatePassword("demo1234");

    expect(result.valid).toBe(true);
    expect(result.value).toBe("demo1234");
  });

  it("rejects short passwords by default", () => {
    const result = validatePassword("123");

    expect(result.valid).toBe(false);
    expect(result.message).toBe(
      `Password must be at least ${INPUT_LIMITS.passwordMin} characters.`,
    );
  });

  it("can skip minimum length checks for login", () => {
    const result = validatePassword("123", {
      requireMinimumLength: false,
    });

    expect(result.valid).toBe(true);
  });

  it("rejects passwords over the max length", () => {
    const result = validatePassword("a".repeat(INPUT_LIMITS.passwordMax + 1));

    expect(result.valid).toBe(false);
  });
});

describe("validatePositiveInteger", () => {
  it("accepts positive integers", () => {
    const result = validatePositiveInteger("42", "Post");

    expect(result).toEqual({
      valid: true,
      value: 42,
      message: null,
    });
  });

  it("rejects invalid ids", () => {
    const result = validatePositiveInteger("abc", "Post");

    expect(result.valid).toBe(false);
    expect(result.message).toBe("Invalid post.");
  });

  it("rejects zero and negative ids", () => {
    expect(validatePositiveInteger("0", "Post").valid).toBe(false);
    expect(validatePositiveInteger("-1", "Post").valid).toBe(false);
  });
});
