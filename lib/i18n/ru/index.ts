// Russian UI dictionary: key = the Uzbek Latin source string exactly as passed to t().
// Each area keeps its own file; missing keys fall back to the Latin original.
import { admin } from "./admin";
import { chat } from "./chat";
import { common } from "./common";
import { data } from "./data";
import { shell } from "./shell";

export const ru: Readonly<Record<string, string>> = {
  ...common,
  ...shell,
  ...admin,
  ...data,
  ...chat,
};
