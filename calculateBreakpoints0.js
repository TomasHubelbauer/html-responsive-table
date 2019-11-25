import calculateFit from "./calculateFit.js";
import deriveViewportFromTable from "./deriveViewportFromTable.js";
import deriveTableFromViewport from "./deriveTableFromViewport.js";

// Maybe the other way around, start with an empty set and keep adding columns in the order of
// priority as long as they fit?

export default function* calculateBreakpoints(
  /** @type {Column[]} */
  tableColumns,
  /** @ype {number | {}} */
  deadspace
) {
  // Start off with all columns visible because that's the default visibility of an element
  let breakpoint = [...tableColumns]
    .sort((a, b) => a.weight - b.weight)
    .map(c => c.key)
    .join();

  // Calculate the size above which there can be no breakpoint because all columns fit and go from there
  const fitTableWidth = calculateFit(tableColumns);

  // Calculate a viewport size which fits the fit table size to start from
  const fitViewportWidth = deriveViewportFromTable(fitTableWidth, deadspace);

  // Walk the viewport size down to zero and determine which columns hide or show
  for (
    let viewportWidth = 165; // fitViewportWidth;
    viewportWidth > 164; // 0;
    viewportWidth--
  ) {
    let tableWidth = deriveTableFromViewport(viewportWidth, deadspace);

    // Start with all the columns in each viewport dimension and recursively remove the unfitting ones
    const columns = [...tableColumns].sort((a, b) => a.weight - b.weight);

    // Hoist which column to remove outside of the loop so that we can use it in its condition
    /** @type {Column?} */
    let columnToRemove;
    do {
      console.group(viewportWidth, tableWidth);

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

        console.log(
          column.key,
          column.weight,
          effectiveColumnWidth,
          column.limit,
          effectiveColumnWidth < column.limit ? "no fit" : ""
        );

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
        console.log("ditch", columnToRemove.key, columnToRemove.weight);
      }

      console.groupEnd();

      // Continue if we find a non-fitting column if any to recalculate the remaining columns' fit
    } while (columnToRemove);

    const visibleColumns = columns.map(c => c.key).join();
    if (breakpoint !== visibleColumns) {
      console.log(visibleColumns);
      yield {
        version: 0,
        tableBreakpoint: tableWidth,
        viewportBreakpoint: viewportWidth,
        columns: tableColumns.map(c => ({
          key: c.key,
          status: columns.includes(c) ? "visible" : "hidden"
        }))
      };

      breakpoint = visibleColumns;
    }
  }
}
