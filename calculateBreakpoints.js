export default function* calculateBreakpoints(tableColumns, deadspace) {
  // Keep track of the column which was reported for removal last so we don't report it again
  let lastColumnToRemove;

  // Calculate the size above which there can be no breakpoint because all columns fit and go from there
  const columnRatioSum = tableColumns.reduce((a, c) => a + c.ratio, 0);
  const fitTableWidth = Math.max(
    ...tableColumns.map(c => (columnRatioSum / c.ratio) * c.limit)
  );

  // Walk the viewport size down to zero and determine which columns hide or show
  for (let tableWidth = fitTableWidth; tableWidth > 0; tableWidth--) {
    // Start with all the columns in each viewport dimension and recursively remove the unfitting ones
    const columns = [...tableColumns];

    // Remember which column ultimately got marked for deletion for this viewport size across its iterations
    let lastRoundColumnToRemove;

    // Hoist which column to remove outside of the loop so that we can use it in its condition
    let columnToRemove;
    do {
      // Reset this
      columnToRemove = undefined;

      // Recalculate the sum total of the ratio excluding the removed columns so the ratios add up to 1
      const adjustedColumnRatioSum = columns.reduce((a, c) => a + c.ratio, 0);

      // Walk the remaining columns in this iteration for this viewport size in case of multiple removals
      for (const column of columns) {
        // Recalculate the column ratio to compare it to the ratio sum total of the remaining columns
        const adjustedColumnRatio = column.ratio / adjustedColumnRatioSum;

        // Determine the size occupied by the column with its adjusted ratio among the remaining columns
        const effectiveColumnWidth = adjustedColumnRatio * tableWidth;

        if (
          // Mark this column for deletion if it doesn't reach its limit
          effectiveColumnWidth < column.limit &&
          // Replace the currently marked column for deletion only if this one has lower weight
          (!columnToRemove || column.weight < columnToRemove.weight)
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
        // Let the caller know what size the table needs to shrink to for this column to stop fitting
        tableBreakpoint: tableWidth,

        // Let the caller know what is the corresponding viewport size including dead spaces for the media query
        viewportBreakpoint: deadspace.left + tableWidth + deadspace.right,

        // Let the caller know which is the latest column to be removed
        hideColumnKey: lastRoundColumnToRemove.key,

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
