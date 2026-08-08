/**
 * Safe copy to clipboard helper.
 * Uses navigator.clipboard if available, otherwise falls back to document.execCommand.
 */
export function safeCopyText(text) {
  if (!text) return Promise.resolve(false);
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text) {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.warn("Fallback copy failed:", err);
    return false;
  }
}
