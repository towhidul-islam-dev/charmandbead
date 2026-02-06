import crypto from "crypto";

/**
 * Generates a 64-character secure hex string for legacy/fallback links
 */
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Generates a 6-digit numeric code for 2FA/Password Reset
 * This is the function the build is looking for!
 */
export const generateOTP = () => {
  // Generates a cryptographically strong random number between 100000 and 999999
  return crypto.randomInt(100000, 999999).toString();
};