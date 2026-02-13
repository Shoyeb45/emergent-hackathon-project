/**
 * Wedding page background templates.
 * Selection is stored in localStorage per wedding (key: wedding_theme_{weddingId}).
 * Can be extended later to persist via API (e.g. wedding.themeId).
 */

export const WEDDING_BACKGROUND_TEMPLATES = [
  { id: "champagne", name: "Champagne", description: "Soft neutral background" },
  { id: "dots", name: "Subtle Dots", description: "Light dot pattern" },
  { id: "flowers", name: "Floral", description: "Delicate flowers" },
  { id: "leaves", name: "Leaves & Vine", description: "Botanical accents" },
  { id: "petals", name: "Petals", description: "Scattered petals" },
  { id: "gold-grid", name: "Gold Grid", description: "Elegant grid lines" },
] as const;

export type WeddingBackgroundTemplateId = (typeof WEDDING_BACKGROUND_TEMPLATES)[number]["id"];

const STORAGE_PREFIX = "wedding_theme_";

export function getStoredTheme(weddingId: string): WeddingBackgroundTemplateId {
  if (typeof window === "undefined") return "champagne";
  const stored = localStorage.getItem(STORAGE_PREFIX + weddingId);
  const valid = WEDDING_BACKGROUND_TEMPLATES.some((t) => t.id === stored);
  return valid ? (stored as WeddingBackgroundTemplateId) : "champagne";
}

export function setStoredTheme(weddingId: string, templateId: WeddingBackgroundTemplateId): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_PREFIX + weddingId, templateId);
}
