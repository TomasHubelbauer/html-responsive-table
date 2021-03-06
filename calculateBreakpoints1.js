import calculateFit from "./calculateFit.js";
import deriveViewportFromTable from "./deriveViewportFromTable.js";
import deriveTableFromViewport from "./deriveTableFromViewport.js";

// TODO: Finalize this version which correctly reports only show/hide changes and not all columns
export default function* calculateBreakpoints(
  /** @type {Column[]} */
  tableColumns,
  /** @ype {number | {}} */
  deadspace
) {
  // Keep track of the column which was reported for removal last so we don't report it again
  /** @type {Column?} */
  let lastColumnToRemove;

  // Calculate the size above which there can be no breakpoint because all columns fit and go from there
  const fitTableWidth = calculateFit(tableColumns);

  // Calculate a viewport size which fits the fit table size to start from
  const fitViewportWidth = deriveViewportFromTable(fitTableWidth, deadspace);

  // Walk the viewport size down to zero and determine which columns hide or show
  for (
    let viewportWidth = fitViewportWidth;
    viewportWidth > 0;
    viewportWidth--
  ) {
    let tableWidth = deriveTableFromViewport(viewportWidth, deadspace);

    // Start with all the columns in each viewport dimension and recursively remove the unfitting ones
    const columns = [...tableColumns];

    // Remember which column ultimately got marked for deletion for this viewport size across its iterations
    /** @type {Column?} */
    let lastRoundColumnToRemove;

    // Hoist which column to remove outside of the loop so that we can use it in its condition
    /** @type {Column?} */
    let columnToRemove;
    do {
      // Reset this so that we avoid a false positive in the `while` condition if this is set from last iteration
      columnToRemove = undefined;

      // Recalculate the sum total of the ratio excluding the removed columns so the ratios add up to 1
      const adjustedColumnRatioSum = columns.reduce(
        (a, c) => a + (c.ratio || 1),
        0
      );

      // Walk the remaining columns in this iteration for this viewport size in case of multiple removals
      for (const column of columns) {
        // Recalculate the column ratio to compare it to the ratio sum total of the remaining columns
        const adjustedColumnRatio =
          (column.ratio || 1) / adjustedColumnRatioSum;

        // Determine the size occupied by the column with its adjusted ratio among the remaining columns
        const effectiveColumnWidth = adjustedColumnRatio * tableWidth;

        if (
          // Mark this column for deletion if it doesn't reach its limit
          effectiveColumnWidth < (column.limit || 0) &&
          // Replace the currently marked column for deletion only if this one has lower weight
          (!columnToRemove ||
            (column.weight || 0) < (columnToRemove.weight || 0))
        ) {
          columnToRemove = column;
        }
      }

      // Remove the non-fitting column with the lowest weight if any
      if (columnToRemove) {
        columns.splice(columns.indexOf(columnToRemove), 1);

        // Remember which column got removed for this viewport size across all its iterations
        lastRoundColumnToRemove = columnToRemove;
      }

      // Continue if we find a non-fitting column if any to recalculate the remaining columns' fit
    } while (columnToRemove);

    // Notify the caller to remove a column if the candidate for removal has changed since last time
    if (lastColumnToRemove !== lastRoundColumnToRemove) {
      yield {
        version: 1,

        // Let the caller know what size the table needs to shrink to for this column to stop fitting
        tableBreakpoint: tableWidth,

        // Let the caller know what is the corresponding viewport size including dead spaces for the media query
        viewportBreakpoint: viewportWidth,

        // TODO: Restore this optimized solution
        // Let the caller know which is the latest column to be removed
        hideColumnKey: lastRoundColumnToRemove.key,

        // TODO: Restore this optimized solution
        // Let the called know to restore a previously deleted column if there is room for it again
        showColumnKey: columns.includes(lastColumnToRemove)
          ? lastColumnToRemove.key
          : undefined
      };

      // Update the marker of the last removed column to prevent reporting the superseded one again
      lastColumnToRemove = lastRoundColumnToRemove;
    }
  }
}
