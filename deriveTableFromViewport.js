export default function deriveTableFromViewport(viewport, deadspaces) {
  if (typeof deadspaces === "number") {
    return viewport - deadspaces;
  }

  if (typeof deadspaces !== "object") {
    throw new Error("Deadspace must be an object or a number!");
  }

  let tableWidth;
  for (const [breakpoint, deadspace] of Object.entries(deadspaces)) {
    if (breakpoint === "_") {
      return viewport - deadspace;
    }

    if (viewport < Number(breakpoint)) {
      break;
    }

    tableWidth = viewport - deadspace;
  }

  return tableWidth;
}
