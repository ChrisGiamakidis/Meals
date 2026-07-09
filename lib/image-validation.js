import { fileTypeFromBlob } from "file-type";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export const ACCEPTED_IMAGE_TYPES = Array.from(ALLOWED_IMAGE_TYPES.keys()).join(
  ",",
);

const EXTENSION_FORMATS = {
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

function isFileLike(file) {
  return Boolean(
    file &&
    typeof file === "object" &&
    typeof file.size === "number" &&
    typeof file.arrayBuffer === "function",
  );
}

function getExtensionFromName(fileName = "") {
  const extension = fileName.split(".").pop()?.trim().toLowerCase();

  return EXTENSION_FORMATS[extension] ?? null;
}

function getAllowedFormatFromMimeType(mimeType) {
  const extension = ALLOWED_IMAGE_TYPES.get(mimeType);

  if (!extension) {
    return null;
  }

  return {
    extension,
    contentType: mimeType,
  };
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

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      message: "The image must be smaller than 5MB.",
    };
  }

  try {
    const detectedType = await fileTypeFromBlob(file);

    if (detectedType) {
      const detectedFormat = getAllowedFormatFromMimeType(detectedType.mime);

      if (detectedFormat) {
        return {
          valid: true,
          ...detectedFormat,
        };
      }
    }

    const browserMimeFormat = getAllowedFormatFromMimeType(file.type);

    if (browserMimeFormat) {
      return {
        valid: true,
        ...browserMimeFormat,
      };
    }

    const filenameFormat = getExtensionFromName(file.name);

    if (filenameFormat) {
      return {
        valid: true,
        ...filenameFormat,
      };
    }

    return {
      valid: false,
      message: "Please upload a JPEG, PNG, WebP, or AVIF image.",
    };
  } catch (error) {
    console.error("Image inspection failed:", error);

    const browserMimeFormat = getAllowedFormatFromMimeType(file.type);

    if (browserMimeFormat) {
      return {
        valid: true,
        ...browserMimeFormat,
      };
    }

    const filenameFormat = getExtensionFromName(file.name);

    if (filenameFormat) {
      return {
        valid: true,
        ...filenameFormat,
      };
    }

    return {
      valid: false,
      message:
        "The selected image could not be verified. Please choose another image.",
    };
  }
}
