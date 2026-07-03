import { fileTypeFromBlob } from "file-type";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

function isFileLike(file) {
  return (
    file &&
    typeof file === "object" &&
    typeof file.size === "number" &&
    typeof file.arrayBuffer === "function"
  );
}

function getExtensionFromName(fileName = "") {
  const extension = fileName.split(".").pop()?.trim().toLowerCase();

  const extensionMap = {
    jpg: {
      extension: "jpg",
      contentType: "image/jpeg",
    },
    jpeg: {
      extension: "jpg",
      contentType: "image/jpeg",
    },
    png: {
      extension: "png",
      contentType: "image/png",
    },
    webp: {
      extension: "webp",
      contentType: "image/webp",
    },
    avif: {
      extension: "avif",
      contentType: "image/avif",
    },
  };

  return extensionMap[extension] ?? null;
}

export function hasUploadedImage(file) {
  return isFileLike(file) && file.size > 0;
}

export async function validateMealImage(file) {
  if (!isFileLike(file) || file.size === 0) {
    return {
      valid: false,
      message: "Please choose an image.",
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      message: "The image must be smaller than 5MB.",
    };
  }

  try {
    const detectedType = await fileTypeFromBlob(file);

    if (detectedType && ALLOWED_IMAGE_TYPES.has(detectedType.mime)) {
      return {
        valid: true,
        extension: ALLOWED_IMAGE_TYPES.get(detectedType.mime),
        contentType: detectedType.mime,
      };
    }

    if (ALLOWED_IMAGE_TYPES.has(file.type)) {
      return {
        valid: true,
        extension: ALLOWED_IMAGE_TYPES.get(file.type),
        contentType: file.type,
      };
    }

    const nameFormat = getExtensionFromName(file.name);

    if (nameFormat) {
      return {
        valid: true,
        extension: nameFormat.extension,
        contentType: nameFormat.contentType,
      };
    }

    return {
      valid: false,
      message: "Please upload a JPEG, PNG, WebP, or AVIF image.",
    };
  } catch (error) {
    console.error("Image inspection failed:", error);

    if (ALLOWED_IMAGE_TYPES.has(file.type)) {
      return {
        valid: true,
        extension: ALLOWED_IMAGE_TYPES.get(file.type),
        contentType: file.type,
      };
    }

    const nameFormat = getExtensionFromName(file.name);

    if (nameFormat) {
      return {
        valid: true,
        extension: nameFormat.extension,
        contentType: nameFormat.contentType,
      };
    }

    return {
      valid: false,
      message:
        "The selected image could not be verified. Please choose another image.",
    };
  }
}
