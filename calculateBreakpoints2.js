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
      version: 2,
      tableBreakpoint: ~~tableSize,
      viewportBreakpoint: ~~viewportSize,
      hideColumnKey: columnToRemove.key
    };
  } while (columns.length > 0);
}

/*
const columns = [
  { key: 1, ratio: 0.1, limit: 50, weight: 0 },
  { key: 2, ratio: 0.2, limit: 50, weight: 3 },
  { key: 3, ratio: 0.4, limit: 75, weight: 2 },
  { key: 4, ratio: 0.3, limit: 100, weight: 1 }
];

NO DEAD SPACE (deadspace = 0)
1st round:
  columns
    [ #1, #2, #3, #4 ]
  ratioSumTotal
    .1 + .2 + .4 + .3 = 1
  tableFitSize
    max([ (1 / .1) * 50, (1 / .2) * 50, (1 / .4) * 75, (1 / .3) * 100 ])
    max([ 10 * 50, 5 * 50, 2.5 * 75, 3.33 * 100 ])
    max([ 500, 250, 187.5, 333.33 ])
    500
  columnSizes
    [ (.1 / 1) * 500, (.2 / 1) * 500, (.4 / 1) * 500, (.3 / 1) * 500 ]
    [ .1 * 500, .2 * 500, .4 * 500, .3 * 500 ]
    [ 50, 100, 200, 150 ]
  columnToRemove
    filter
      [ #1 ]
    sort
      [ #1 ]
    #1
  columns.splice
    [ #2, #3, #4 ]
  yield
    { breakpoint: 500 - 1, columnToRemove: #1 }

2nd round:
  columns
    [ #2, #3, #4 ]
  ratioSumTotal
    .2 + .4 + .3 = .9
  tableFitSize
    max([ (.9 / .2) * 50, (.9 / .4) * 75, (.9 / .3) * 100 ])
    max([ 4.5 * 50, 2.25 * 75, 3 * 100 ])
    max([ 225, 168.75, 300 ])
    300
  columnSizes
    [ (.2 / .9) * 300, (.4 / .9) * 300, (.3 / .9) * 300 ]
    [ .22 * 300, .44 * 300, .33 * 300 ]
    [ 66.66, 133.33, 100 ]
  columnToRemove
    filter
      [ #4 ]
    sort
      [ #4 ]
    #4
  columns.splice
    [ #2, #3 ]
  yield
    { breakpoint: 300, columnToRemove: #4 }

3rd round:
  columns
    [ #2, #3 ]
  ratioSumTotal
    .2 + .4 = .6
  tableFitSize
    max([ (.6 / .2) * 50, (.6 / .4) * 75 ])
    max([ 150, 150 ])
    150
  columnSizes
    [ (.2 / .6) * 150, (.4 / .6) * 150 ]
    [ .33 * 150, .66 * 150 ]
    [ 50, 100 ]
  columnToRemove
    filter
      [ #2 ]
    sort
      [ #2 ]
    #2
  columns.splice
    [ #3 ]
  yield
    { breakpoint: 150, columnToRemove: #3 }

4th round:
  columns
    [ #2 ]
  ratioSumTotal
    .2
  tableFitSize
    max([ (.2 / .2) * 50 ])
    max([ 50 ])
    50
  columnSizes
    [ (.2 / .2) * 50 ]
    [ 50 ]
  columnToRemove
    filter
      [ #2 ]
    sort
      [ #2 ]
    #2
  columns.splice
    []
  yield
    { breakpoint: 50, columnToRemove: #4 }

STATIC DEAD SPACE (deadspace = 16)
1st round:
  columns
    [ #1, #2, #3, #4 ]
  ratioSumTotal
    .1 + .2 + .4 + .3 = 1
  tableFitSize
    max([ (1 / .1) * 50, (1 / .2) * 50, (1 / .4) * 75, (1 / .3) * 100 ])
    max([ 10 * 50, 5 * 50, 2.5 * 75, 3.33 * 100 ])
    max([ 500, 250, 187.5, 333.33 ])
    500
  viewportFitSize
    516
  columnSizes
    [ (.1 / 1) * 500, (.2 / 1) * 500, (.4 / 1) * 500, (.3 / 1) * 500 ]
    [ .1 * 500, .2 * 500, .4 * 500, .3 * 500 ]
    [ 50, 100, 200, 150 ]
  columnToRemove
    filter
      [ #1 ]
    sort
      [ #1 ]
    #1
  columns.splice
    [ #2, #3, #4 ]
  yield
    { tableBreakpoint: 500, viewportBreakpoint: 516 columnToRemove: #1 }

2nd round:
  columns
    [ #2, #3, #4 ]
  ratioSumTotal
    .2 + .4 + .3 = .9
  tableFitSize
    max([ (.9 / .2) * 50, (.9 / .4) * 75, (.9 / .3) * 100 ])
    max([ 4.5 * 50, 2.25 * 75, 3 * 100 ])
    max([ 225, 168.75, 300 ])
    300
  viewportFitSize
    316
  columnSizes
    [ (.2 / .9) * 300, (.4 / .9) * 300, (.3 / .9) * 300 ]
    [ .22 * 300, .44 * 300, .33 * 300 ]
    [ 66.66, 133.33, 100 ]
  columnToRemove
    filter
      [ #4 ]
    sort
      [ #4 ]
    #4
  columns.splice
    [ #2, #3 ]
  yield
    { tableBreakpoint: 300, viewportBreakpoint: 316, columnToRemove: #4 }

3rd round:
  columns
    [ #2, #3 ]
  ratioSumTotal
    .2 + .4 = .6
  tableFitSize
    max([ (.6 / .2) * 50, (.6 / .4) * 75 ])
    max([ 150, 150 ])
    150
  viewportFitSize
    166
  columnSizes
    [ (.2 / .6) * 150, (.4 / .6) * 150 ]
    [ .33 * 150, .66 * 150 ]
    [ 50, 100 ]
  columnToRemove
    filter
      [ #2 ]
    sort
      [ #2 ]
    #2
  columns.splice
    [ #3 ]
  yield
    { tableBreakpoint: 150, viewportBreakpoint: 166, columnToRemove: #3 }

4th round:
  columns
    [ #2 ]
  ratioSumTotal
    .2
  tableFitSize
    max([ (.2 / .2) * 50 ])
    max([ 50 ])
    50
  viewportFitSize
    66
  columnSizes
    [ (.2 / .2) * 50 ]
    [ 50 ]
  columnToRemove
    filter
      [ #2 ]
    sort
      [ #2 ]
    #2
  columns.splice
    []
  yield
    { tableBreakpoint: 50, viewportBreakpoint: 66, columnToRemove: #4 }

DYNAMIC DEAD SPACE (deadspace = { 270: 0, _: 16 })
1st round:
  columns
    [ #1, #2, #3, #4 ]
  ratioSumTotal
    .1 + .2 + .4 + .3 = 1
  tableFitSize
    max([ (1 / .1) * 50, (1 / .2) * 50, (1 / .4) * 75, (1 / .3) * 100 ])
    max([ 10 * 50, 5 * 50, 2.5 * 75, 3.33 * 100 ])
    max([ 500, 250, 187.5, 333.33 ])
    500
  viewportFitSize
    516
  columnSizes
    [ (.1 / 1) * 500, (.2 / 1) * 500, (.4 / 1) * 500, (.3 / 1) * 500 ]
    [ .1 * 500, .2 * 500, .4 * 500, .3 * 500 ]
    [ 50, 100, 200, 150 ]
  columnToRemove
    filter
      [ #1 ]
    sort
      [ #1 ]
    #1
  columns.splice
    [ #2, #3, #4 ]
  yield
    { tableBreakpoint: 500, viewportBreakpoint: 516 columnToRemove: #1 }

2nd round:
  columns
    [ #2, #3, #4 ]
  ratioSumTotal
    .2 + .4 + .3 = .9
  tableFitSize
    max([ (.9 / .2) * 50, (.9 / .4) * 75, (.9 / .3) * 100 ])
    max([ 4.5 * 50, 2.25 * 75, 3 * 100 ])
    max([ 225, 168.75, 300 ])
    300
  viewportFitSize
    316
  columnSizes
    [ (.2 / .9) * 300, (.4 / .9) * 300, (.3 / .9) * 300 ]
    [ .22 * 300, .44 * 300, .33 * 300 ]
    [ 66.66, 133.33, 100 ]
  columnToRemove
    filter
      [ #4 ]
    sort
      [ #4 ]
    #4
  columns.splice
    [ #2, #3 ]
  yield
    { tableBreakpoint: 300, viewportBreakpoint: 316, columnToRemove: #4 }

3rd round:
  columns
    [ #2, #3 ]
  ratioSumTotal
    .2 + .4 = .6
  tableFitSize
    max([ (.6 / .2) * 50, (.6 / .4) * 75 ])
    max([ 150, 150 ])
    150
  viewportFitSize
    150
  columnSizes
    [ (.2 / .6) * 150, (.4 / .6) * 150 ]
    [ .33 * 150, .66 * 150 ]
    [ 50, 100 ]
  columnToRemove
    filter
      [ #2 ]
    sort
      [ #2 ]
    #2
  columns.splice
    [ #3 ]
  yield
    { tableBreakpoint: 150, viewportBreakpoint: 150, columnToRemove: #3 }

4th round:
  columns
    [ #2 ]
  ratioSumTotal
    .2
  tableFitSize
    max([ (.2 / .2) * 50 ])
    max([ 50 ])
    50
  viewportFitSize
    50
  columnSizes
    [ (.2 / .2) * 50 ]
    [ 50 ]
  columnToRemove
    filter
      [ #2 ]
    sort
      [ #2 ]
    #2
  columns.splice
    []
  yield
    { tableBreakpoint: 50, viewportBreakpoint: 50, columnToRemove: #4 }
*/
