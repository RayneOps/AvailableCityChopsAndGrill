/**
 * Staggered gallery rotation.
 *
 * Every tile changes once per ROTATE_MS (60 s), but the tiles take turns:
 * with N tiles, one tile changes every ROTATE_MS / N. So with 6 tiles, tile 1
 * changes at 10 s, tile 2 at 20 s, … tile 6 at 60 s, then tile 1 again at 70 s.
 * Two tiles never change at the same moment.
 */

export const ROTATE_MS = 60_000;

/** Time between consecutive tile changes. */
export const stepMs = (tiles: number) => ROTATE_MS / Math.max(1, tiles);

/** Which tile changes on the given tick (ticks start at 1). */
export const tileForTick = (tick: number, tiles: number) => (tick - 1) % tiles;

/** When (ms from start) the given tile changes for the n-th time (n starts at 1). */
export const changeTimeMs = (tile: number, n: number, tiles: number) => (tile + 1) * stepMs(tiles) + (n - 1) * ROTATE_MS;

/** Initial images: tile i shows image i. */
export const initialTiles = (tiles: number) => Array.from({ length: tiles }, (_, i) => i);

/**
 * Choose the next image for a tile: continue through the collection from
 * `cursor`, skipping any image that is already visible on another tile.
 * Returns the chosen image index and the new cursor.
 */
export function pickNextImage(visible: number[], cursor: number, total: number): { image: number; cursor: number } {
  for (let step = 0; step < total; step++) {
    const candidate = (cursor + step) % total;
    if (!visible.includes(candidate)) return { image: candidate, cursor: (candidate + 1) % total };
  }
  return { image: visible[0] ?? 0, cursor };
}

/** Rotation only makes sense when there are more photos than tiles. */
export const canRotate = (images: number, tiles: number) => images > tiles;
