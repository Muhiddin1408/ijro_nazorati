/**
 * The only entry point to the spreadsheet library (~880 KB). It loads once, on
 * the first export, and never enters the initial bundle.
 */
export type XlsxModule = typeof import("xlsx-js-style");

let loading: Promise<XlsxModule> | null = null;

export function loadXlsx(): Promise<XlsxModule> {
  loading ??= import("xlsx-js-style").catch((error) => {
    loading = null;
    throw error;
  });
  return loading;
}
