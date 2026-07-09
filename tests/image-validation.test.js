import { describe, expect, it } from "vitest";

import { hasUploadedImage, validateMealImage } from "../lib/image-validation";

function createFile(bytes, name, type = "") {
  return new File([new Uint8Array(bytes)], name, {
    type,
  });
}

const JPEG_BYTES = [
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
];

const PNG_BYTES = [
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
];

describe("hasUploadedImage", () => {
  it("returns true for a file with content", () => {
    const file = createFile(JPEG_BYTES, "meal.jpg", "image/jpeg");

    expect(hasUploadedImage(file)).toBe(true);
  });

  it("returns false for an empty file", () => {
    const file = createFile([], "empty.jpg", "image/jpeg");

    expect(hasUploadedImage(file)).toBe(false);
  });

  it("returns false for nullish values", () => {
    expect(hasUploadedImage(null)).toBe(false);
    expect(hasUploadedImage(undefined)).toBe(false);
  });
});

describe("validateMealImage", () => {
  it("accepts a genuine JPEG image", async () => {
    const file = createFile(JPEG_BYTES, "meal.jpg", "image/jpeg");

    const result = await validateMealImage(file);

    expect(result).toEqual({
      valid: true,
      extension: "jpg",
      contentType: "image/jpeg",
    });
  });

  it("accepts a genuine PNG image", async () => {
    const file = createFile(PNG_BYTES, "meal.png", "image/png");

    const result = await validateMealImage(file);

    expect(result).toEqual({
      valid: true,
      extension: "png",
      contentType: "image/png",
    });
  });

  it("rejects empty files", async () => {
    const file = createFile([], "empty.png", "image/png");

    const result = await validateMealImage(file);

    expect(result.valid).toBe(false);
    expect(result.message).toBe("Please choose an image.");
  });

  it("rejects files larger than 5MB", async () => {
    const largeFile = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      "large.jpg",
      {
        type: "image/jpeg",
      },
    );

    const result = await validateMealImage(largeFile);

    expect(result.valid).toBe(false);
    expect(result.message).toBe("The image must be smaller than 5MB.");
  });

  it("uses browser MIME fallback when binary detection is inconclusive", async () => {
    const file = createFile([1, 2, 3, 4], "unknown-image", "image/webp");

    const result = await validateMealImage(file);

    expect(result).toEqual({
      valid: true,
      extension: "webp",
      contentType: "image/webp",
    });
  });

  it("uses filename fallback for allowed image extensions", async () => {
    const file = createFile([1, 2, 3, 4], "fallback.avif", "");

    const result = await validateMealImage(file);

    expect(result).toEqual({
      valid: true,
      extension: "avif",
      contentType: "image/avif",
    });
  });

  it("rejects unsupported files", async () => {
    const file = createFile([1, 2, 3, 4], "notes.txt", "text/plain");

    const result = await validateMealImage(file);

    expect(result.valid).toBe(false);
    expect(result.message).toBe(
      "Please upload a JPEG, PNG, WebP, or AVIF image.",
    );
  });
});
