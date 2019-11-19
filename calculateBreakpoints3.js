import deriveViewportFromTable from "./deriveViewportFromTable.js";

export default function* calculateBreakpoints(
  /** @type {Column[]} */
  tableColumns,
  /** @type {Deadspace} */
  deadspace
) {
  // Clone the array to be able to remove from it without affecting the caller
  const columns = [...tableColumns];

  // Sort the columns by weight to make sure they get removed in weight order
  columns.sort((a, b) => a.weight - b.weight);

  do {
    // Calculate the sum total of the remaining columns' ratios
    const columnsRatio = columns.reduce((a, c) => a + c.ratio, 0);

    // Calculate the table size which fits the column at its ratio for each column
    const columnsTableSizes = columns.map(
      c => (columnsRatio / c.ratio) * c.limit
    );

    // Calculate the size of the table which fits all the columns at their ratios
    const tableSize = Math.max(...columnsTableSizes);

    // Find all columns which require final table with to fit meaning they would
    // get removed if the table was any smaller - they are removal candidates -
    // and select the first one - the one with the lowest weight in the sorted array
    const columnToRemove = columns.filter(
      (_, i) => columnsTableSizes[i] === tableSize
    )[0];

    // Remove the identified column which has the lowest weight of those at their limits
    if (columnToRemove === columns[0]) {
      columns.shift();
    } else {
      // TODO: Add a config value `preference` which switches between:
      // - Removing a column as soon as it doesn't fit even if other fitting columns have lower weight
      // - Removing a column even if it fits if it means keeping another column with higher weight
      // TODO: Actually default to saving the higher weight item by the lower weight one
      debugger;
      columns.splice(columns.indexOf(columnToRemove), 1);
    }

    // Calculate the viewport size resulting in the above table size including dead space
    const viewportSize = deriveViewportFromTable(tableSize, deadspace);

    // Report the table breakpoint, viewport breakpoint and the key of the removed column
    // Note that `~~` truncates the decimal part of the number as the viewport size is integral
    yield {
      version: 3,
      tableBreakpoint: ~~tableSize,
      viewportBreakpoint: ~~viewportSize,
      columnKey: columnToRemove.key
    };
  } while (columns.length > 0);
}

void function test() {
  // TODO
};

/*
tableColumns [
  { key: 1, ratio: .1, limit: 50, weight: 0 },
  { key: 2, ratio: .2, limit: 50, weight: 3 },
  { key: 3, ratio: .4, limit: 75, weight: 2 },
  { key: 4, ratio: .3, limit: 100, weight: 1 }
]

deadspace 0
  columns [#1, #2, #3, #4]
  columns sort [#1, #4, #3, #2]
  do
    columns [ #1, #4, #3, #2 ]
    columnsRatio .1 + .3 + .4 + .2 = 1
    columnsTableSizes [ (1 / .1) * 50, (1 / .3) * 100, (1 / .4) * 75, (1 / .2) * 50 ] = [ 500, 333.33, 187.5, 250 ]
    tableSize 500
    columnToRemove filter [ #1 ]
    columnToRemove #1
    columns splice [ #4, #3, #2 ]
    viewportSize 500
    yield { viewportBreakpoint: 500, tableBreakpoint: 500, hideColumnKey: 1 }
  do
    columns [ #4, #3, #2 ]
    columnsRatio .3 + .4 + .2 = .9
    columnsTableSizes [ (.9 / .3) * 100, (.9 / .4) * 75, (.9 / .2) * 50 ] = [ 300, 168.75, 225 ]
    tableSize 300
    columnToRemove filter [ #4 ]
    columnToRemove #4
    columns splice [ #3, #2 ]
    yield { viewportBreakpoint: 300, tableBreakpoint: 300, hideColumnKey: 4 }
  do
    columns [ #3, #2 ]
    columnsRatio .4 + .2 = .6
    columnsTableSizes [ (.6 / .4) * 75, (.6 / .2) * 50 ] = [ 112.5, 150 ]
    tableSize 150
    columnToRemove filter [ #2 ]
    columnToRemove #2
    columns splice [ #3 ]
    yield { viewportBreakpoint: 150, tableBreakpoint: 150, hideColumnKey: 2 }
  do
    columns [ #2 ]
    columnsRatio .2 = .2
    columnsTableSizes [ (.2 / .2) * 50 ] = [ 50 ]
    tableSize 50
    columnToRemove filter [ #2 ]
    columnToRemove #2
    yield { viewportBreakpoint: 50, tableBreakpoint: 50, hideColumnKey: 3 }
*/
