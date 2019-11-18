import deriveViewportFromTable from "./deriveViewportFromTable.js";

// TODO: Validate this against the prior version
// TODO: Add a subroutine which attempts to "save" higher weight candidates by
//       removing ones which fit with room to spare but have lower weights in
//       order of their weights and seeing if that makes room for the higher
//       weight one (this might reintroduce reappearing columns)
export default function* calculateBreakpoints(
  /** @type {Column[]} */
  tableColumns,
  /** @type {Deadspace} */
  deadspace
) {
  // Clone the array to be able to remove from it without affecting the caller
  const columns = [...tableColumns];
  do {
    // Calculate the total of the remaining columns' ratios
    const columnsRatio = columns.reduce((a, c) => a + c.ratio, 0);

    // Calculate the size of the table where it fits all the columns at their ratios
    const tableSize = Math.max(
      ...columns.map(c => (columnsRatio / c.ratio) * c.limit)
    );

    // Calculate the viewport size resulting in the above table size including dead space
    const viewportSize = deriveViewportFromTable(tableSize, deadspace);

    // Calculate the column sizes at the table size above according to their ratios
    const columnSizes = columns.map(c => (c.ratio / columnsRatio) * tableSize);

    // Account for the arithmetic artifacts that result in some epsilon over perfect zero
    const roundingArtifact = Math.min(
      ...columns.map((c, i) => columnSizes[i] - c.limit)
    );

    // Find the column which fits and is at its limit with the lowest weight (the one to go)
    const columnToRemove = columns
      // Find all columns whose size is equal to their limit accoundint for the artifact
      .filter((c, i) => c.limit === columnSizes[i] - roundingArtifact)

      // Order the columns which are at their limits on this breakpoint by their weights
      // Select the one with the lowest weight for removal (the first one)
      .sort((a, b) => b.weight - a.weight)[0];

    // Remove the identified column which has the lowest weight of those at their limits
    columns.splice(columns.indexOf(columnToRemove), 1);

    // Report the table breakpoint, viewport breakpoint and the key of the removed column
    // Note that `~~` truncates the decimal part of the number as the viewport size is integral
    yield {
      useNewVersion: true,
      tableBreakpoint: ~~tableSize,
      viewportBreakpoint: ~~viewportSize,
      hideColumnKey: columnToRemove.key
    };
  } while (columns.length > 0);
}
