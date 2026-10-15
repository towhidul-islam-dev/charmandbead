export function sanitizeBDPhone(phone) {
  if (!phone) return "";
  // Remove all non-digit characters except keeping numbers
  let cleaned = phone.replace(/\D/g, "");
  
  // If it starts with 880, strip the country code to get 01XXXXXXXXX
  if (cleaned.startsWith("880") && cleaned.length === 13) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("88") && cleaned.length === 11) {
    cleaned = cleaned.slice(2);
  }
  return cleaned;
}

export function isValidBDPhone(phone) {
  if (!phone) return false;
  // This regex allows optional hyphens or spaces, e.g., 01725-101880 or 01725101880
  const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{2}[-\s]?\d{6}$/;
  return bdPhoneRegex.test(phone.trim());
}