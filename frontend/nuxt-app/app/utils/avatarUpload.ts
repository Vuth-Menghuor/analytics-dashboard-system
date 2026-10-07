export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

const ACCEPTED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const avatarValidationError = (file: Pick<File, "size" | "type">) => {
  if (!ACCEPTED_AVATAR_TYPES.has(file.type) || file.size > AVATAR_MAX_BYTES) {
    return "Choose a JPG, PNG, or WebP image no larger than 2 MB.";
  }

  return null;
};
