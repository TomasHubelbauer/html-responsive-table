export default function* calculateBreakpoints(
  tableColumns,
  deadspace,
  overrideViewport
) {
  let lastColumnToRemove;
  for (
    // Start from the screen width to cover breakpoints from fully maximized window to zero
    let tableWidth = overrideViewport || screen.width;
    tableWidth > 0;
    tableWidth--
  ) {
    const columns = [...tableColumns];
    let lastRoundColumnToRemove;
    let columnToRemove;
    let columnToRemoveIndex;
    do {
      // Reset these values in case the same round repeats
      columnToRemove = undefined;
      columnToRemoveIndex = undefined;

      const adjustedColumnRatioSum = columns.reduce((a, c) => a + c.ratio, 0);

      // Avoid relooping with `indexOf` by keeping track of the index in parallel with the `for`-`of` loop
      let index = 0;
      for (const column of columns) {
        const adjustedColumnRatio = column.ratio / adjustedColumnRatioSum;
        const effectiveColumnWidth = adjustedColumnRatio * tableWidth;
        if (
          effectiveColumnWidth < column.limit &&
          (!columnToRemove || columnToRemove.weight > column.weight)
        ) {
          columnToRemove = column;
          columnToRemoveIndex = index;
        }

        index++;
      }

      if (columnToRemove) {
        columns.splice(columnToRemoveIndex, 1);
        lastRoundColumnToRemove = columnToRemove;
      }
    } while (columns.length > 0 && columnToRemove);

    if (lastColumnToRemove !== lastRoundColumnToRemove) {
      yield {
        tableBreakpoint: tableWidth,
        viewportBreakpoint: deadspace.left + tableWidth + deadspace.right,
        hideColumnKey: lastRoundColumnToRemove.key,
        showColumnKey: columns.includes(lastColumnToRemove)
          ? lastColumnToRemove.key
          : undefined
      };

      lastColumnToRemove = lastRoundColumnToRemove;
    }
  }
}
