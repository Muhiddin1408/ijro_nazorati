/** Pure windowing math for useVirtualList (no React, unit-tested). */
export type VirtualRange = { start: number; end: number; padTop: number; padBottom: number };

export type VirtualRangeInput = {
  count: number;
  /** Height of one row (or one grid row of `columns` items), in px. */
  rowHeight: number;
  /** Scroll offset of the viewport relative to the list start (may be negative). */
  viewportTop: number;
  viewportHeight: number;
  overscan: number;
  /** Items per visual row (grids); 1 for lists and tables. */
  columns?: number;
  /** Item that must stay rendered (e.g. it holds keyboard focus). */
  pinnedIndex?: number | null;
  /** Upper bound on rendered items when extending the range to the pinned item. */
  maxRendered?: number;
};

export function computeVirtualRange({
  count,
  rowHeight,
  viewportTop,
  viewportHeight,
  overscan,
  columns = 1,
  pinnedIndex = null,
  maxRendered = 400,
}: VirtualRangeInput): VirtualRange {
  const cols = Math.max(1, Math.floor(columns));
  const rows = Math.ceil(count / cols);
  const height = Math.max(1, rowHeight);
  if (!count) return { start: 0, end: 0, padTop: 0, padBottom: 0 };
  let firstRow = Math.floor(viewportTop / height) - overscan;
  let lastRow = Math.ceil((viewportTop + Math.max(0, viewportHeight)) / height) + overscan;
  firstRow = Math.min(Math.max(0, firstRow), rows);
  lastRow = Math.min(Math.max(firstRow, lastRow), rows);
  if (pinnedIndex != null && pinnedIndex >= 0 && pinnedIndex < count) {
    const pinnedRow = Math.floor(pinnedIndex / cols);
    const extendedFirst = Math.min(firstRow, pinnedRow);
    const extendedLast = Math.max(lastRow, pinnedRow + 1);
    // Keep focus inside the rendered window unless that would render too much.
    if ((extendedLast - extendedFirst) * cols <= maxRendered) {
      firstRow = extendedFirst;
      lastRow = extendedLast;
    }
  }
  const start = firstRow * cols;
  const end = Math.min(count, lastRow * cols);
  return { start, end, padTop: firstRow * height, padBottom: Math.max(0, rows - lastRow) * height };
}
