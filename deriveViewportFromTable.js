export default function deriveViewportFromTable(
  /** @type {number} */ table,
  /** @type {Deadspace} */ deadspaces
) {
  if (typeof deadspaces === "number") {
    return table + deadspaces;
  }

  if (typeof deadspaces !== "object") {
    throw new Error("Deadspace must be an object or a number!");
  }

  /** @type {number} */
  let breakpointDeadspace;
  for (const [breakpoint, deadspace] of Object.entries(deadspaces)) {
    if (breakpoint === "_") {
      breakpointDeadspace = deadspace;
      break;
    }

    if (table < Number(breakpoint) - deadspace) {
      breakpointDeadspace = deadspace;
      break;
    }

    breakpointDeadspace = deadspace;
  }

  return table + breakpointDeadspace;
}
