"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { computeVirtualRange, type VirtualRange } from "./virtual-range";

export type VirtualListOptions = {
  count: number;
  /** Initial row height guess; the real average is measured from rendered rows. */
  estimateRowHeight: number;
  overscan?: number;
  /** Lists shorter than this render fully (no spacers, no listeners). */
  threshold?: number;
  /** Items per visual row for CSS grids; "auto" reads grid-template-columns. */
  columns?: number | "auto";
  /** Element with its own vertical scroll; omit when the list scrolls with the page. */
  scrollRef?: React.RefObject<HTMLElement | null>;
};

export type VirtualList = VirtualRange & {
  enabled: boolean;
  columns: number;
  /** Attach to the element that directly contains the rendered items (tbody, list, grid). */
  attach: (element: HTMLElement | null) => void;
};

const INDEX_ATTRIBUTE = "data-virtual-index";

/** Props for each rendered item so focus tracking can find it. */
export function virtualItemProps(index: number) {
  return { [INDEX_ATTRIBUTE]: index } as Record<string, number>;
}

function gridColumns(element: HTMLElement) {
  const template = getComputedStyle(element).gridTemplateColumns;
  if (!template || template === "none") return 1;
  return Math.max(1, template.split(" ").filter(Boolean).length);
}

/**
 * Windowed rendering without dependencies. Renders only items near the
 * viewport plus `overscan`, with spacer heights above and below. The item that
 * holds keyboard focus is always kept rendered.
 */
export function useVirtualList({
  count,
  estimateRowHeight,
  overscan = 8,
  threshold = 80,
  columns = 1,
  scrollRef,
}: VirtualListOptions): VirtualList {
  const enabled = count > threshold;
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [rowHeight, setRowHeight] = useState(estimateRowHeight);
  const [cols, setCols] = useState(typeof columns === "number" ? columns : 1);
  const [viewport, setViewport] = useState({ top: 0, height: 900 });
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const frame = useRef(0);

  const attach = useCallback((next: HTMLElement | null) => setElement(next), []);

  // All DOM reads happen in one animation frame; state only changes when a
  // value actually differs, so re-renders cannot loop.
  const measure = useCallback(() => {
    frame.current = 0;
    if (!element) return;
    const listTop = element.getBoundingClientRect().top;
    const container = scrollRef?.current;
    let next: { top: number; height: number };
    if (container === element) {
      // The list is its own scroll container: items start at its scrollTop 0.
      next = { top: element.scrollTop, height: element.clientHeight };
    } else if (container) {
      const rect = container.getBoundingClientRect();
      next = { top: rect.top - listTop, height: container.clientHeight };
    } else {
      next = { top: -listTop, height: window.innerHeight };
    }
    setViewport((current) => (current.top === next.top && current.height === next.height ? current : next));
    const nextCols = columns === "auto" ? gridColumns(element) : columns;
    setCols((current) => (current === nextCols ? current : nextCols));
    // Real average row height from the rendered items.
    const items = element.querySelectorAll<HTMLElement>(`[${INDEX_ATTRIBUTE}]`);
    if (items.length) {
      const first = items[0].getBoundingClientRect();
      const last = items[items.length - 1].getBoundingClientRect();
      const measured = (last.bottom - first.top) / Math.max(1, Math.ceil(items.length / nextCols));
      if (measured > 0) setRowHeight((current) => (Math.abs(measured - current) > 1 ? measured : current));
    }
  }, [columns, element, scrollRef]);

  const requestMeasure = useCallback(() => {
    if (!frame.current) frame.current = window.requestAnimationFrame(measure);
  }, [measure]);

  useEffect(() => {
    if (!enabled || !element) return;
    requestMeasure();
    const target: HTMLElement | Window = scrollRef?.current ?? window;
    target.addEventListener("scroll", requestMeasure, { passive: true });
    window.addEventListener("resize", requestMeasure, { passive: true });
    if (target !== window) window.addEventListener("scroll", requestMeasure, { passive: true });
    return () => {
      target.removeEventListener("scroll", requestMeasure);
      window.removeEventListener("resize", requestMeasure);
      if (target !== window) window.removeEventListener("scroll", requestMeasure);
      if (frame.current) window.cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [element, enabled, requestMeasure, scrollRef]);

  // Keep the focused item rendered while it is scrolled out of the window.
  useEffect(() => {
    if (!enabled || !element) return;
    const onFocusIn = (event: FocusEvent) => {
      const item = (event.target as HTMLElement | null)?.closest?.(`[${INDEX_ATTRIBUTE}]`);
      const index = item ? Number(item.getAttribute(INDEX_ATTRIBUTE)) : NaN;
      if (Number.isInteger(index)) setPinnedIndex(index);
    };
    const onFocusOut = (event: FocusEvent) => {
      if (!element.contains(event.relatedTarget as Node | null)) setPinnedIndex(null);
    };
    element.addEventListener("focusin", onFocusIn);
    element.addEventListener("focusout", onFocusOut);
    return () => {
      element.removeEventListener("focusin", onFocusIn);
      element.removeEventListener("focusout", onFocusOut);
    };
  }, [element, enabled]);

  const range = enabled
    ? computeVirtualRange({
        count,
        rowHeight,
        viewportTop: viewport.top,
        viewportHeight: viewport.height,
        overscan,
        columns: cols,
        pinnedIndex,
      })
    : { start: 0, end: count, padTop: 0, padBottom: 0 };

  // Re-measure after the rendered window changes (row heights may differ).
  useEffect(() => {
    if (enabled && element) requestMeasure();
  }, [element, enabled, range.end, range.start, requestMeasure]);

  return { ...range, enabled, columns: cols, attach };
}
