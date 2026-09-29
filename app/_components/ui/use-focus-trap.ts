"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  "button:not([disabled]),a[href],input:not([disabled]):not([type='hidden']),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";

// Open dialogs, innermost last: only the topmost one handles Tab and Escape.
const openLayers: HTMLElement[] = [];
let scrollLocks = 0;
let savedOverflow = "";

export type FocusTrapOptions = {
  /** Hide the layer's siblings from assistive tech and pointer/keyboard (drawers). */
  inertSiblings?: boolean;
  /** Lock page scrolling while open (default true). */
  lockScroll?: boolean;
};

/**
 * Accessible dialog behaviour: focus moves in on open (to
 * `[data-dialog-initial-focus]`, else the first focusable element, else the
 * layer), Tab/Shift+Tab stay inside, Escape closes, and focus returns to the
 * previously focused element on close.
 */
export function useFocusTrap(
  active: boolean,
  layerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  { inertSiblings = false, lockScroll = true }: FocusTrapOptions = {},
) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!active || !layer) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    openLayers.push(layer);

    if (lockScroll) {
      if (scrollLocks === 0) {
        savedOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }
      scrollLocks += 1;
    }

    const siblings =
      inertSiblings && layer.parentElement
        ? Array.from(layer.parentElement.children).filter(
            (element): element is HTMLElement => element instanceof HTMLElement && element !== layer,
          )
        : [];
    const inertState = siblings.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute("aria-hidden"),
    }));
    for (const sibling of siblings) {
      sibling.inert = true;
      sibling.setAttribute("aria-hidden", "true");
    }

    const focusFirst = window.requestAnimationFrame(() => {
      if (layer.contains(document.activeElement)) return;
      (
        layer.querySelector<HTMLElement>("[data-dialog-initial-focus]") ??
        layer.querySelector<HTMLElement>(FOCUSABLE) ??
        layer
      ).focus();
    });

    const keydown = (event: KeyboardEvent) => {
      if (openLayers.at(-1) !== layer) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(layer.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      );
      if (!focusable.length) {
        event.preventDefault();
        layer.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1)!;
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !layer.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !layer.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keydown);

    return () => {
      window.cancelAnimationFrame(focusFirst);
      document.removeEventListener("keydown", keydown);
      const index = openLayers.lastIndexOf(layer);
      if (index >= 0) openLayers.splice(index, 1);
      for (const state of inertState) {
        state.element.inert = state.inert;
        if (state.ariaHidden == null) state.element.removeAttribute("aria-hidden");
        else state.element.setAttribute("aria-hidden", state.ariaHidden);
      }
      if (lockScroll) {
        scrollLocks = Math.max(0, scrollLocks - 1);
        if (scrollLocks === 0) document.body.style.overflow = savedOverflow;
      }
      if (previousFocus?.isConnected) window.requestAnimationFrame(() => previousFocus.focus());
    };
  }, [active, layerRef, inertSiblings, lockScroll]);
}
