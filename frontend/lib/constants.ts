// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE     = 50;

// Upload
export const MAX_UPLOAD_SIZE_MB = 5;
export const MAX_UPLOAD_BYTES   = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/gif':  'gif',
  'image/webp': 'webp',
};

// Session
export const SESSION_DURATION_DAYS = 7;
export const SESSION_DURATION_MS   = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

// Content limits (must match Prisma schema / Zod schemas)
export const MAX_POST_LENGTH    = 2000;
export const MAX_COMMENT_LENGTH = 1000;
