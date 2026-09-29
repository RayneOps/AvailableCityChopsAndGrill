/**
 * Text cleaning for anything a customer types. The result ends up in a
 * WhatsApp message, so we strip control/invisible characters, normalise
 * whitespace and cap length. React escapes output for the page itself.
 */

// C0/C1 control chars (except \n and \t), zero-width & bidi override characters.
const UNSAFE = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤﻿]/g;

/** Single-line field: collapses all whitespace to single spaces. */
export function cleanLine(value: string, maxLength = 120): string {
  return value.replace(UNSAFE, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

/** Multi-line field: keeps line breaks but no more than one blank line in a row. */
export function cleanMultiline(value: string, maxLength = 600): string {
  return value
    .replace(UNSAFE, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}
