const columns = [
  { key: 1, ratio: 1, limit: 50, weight: 0 },
  { key: 2, ratio: 2, limit: 50, weight: 3 },
  { key: 3, ratio: 4, limit: 75, weight: 2 },
  { key: 4, ratio: 3, limit: 100, weight: 1 }
];

/*
columns = [ #1, #2, #3, #4 ]
columnsRatio = 1 + 2 + 4 + 3 = 10
columnsTableSizes = [ (10 / 1) * 50, (10 / 2) * 50, (10 / 4) * 75, (10 / 3) * 100 ] = [ 500, 250, 187.5, 333.33 ]
tableSize = Max([ 500, 250, 187.5, 333.33 ]) = 500
// columnSizes = [ (1 / 10) * 500, (2 / 10) * 500, (4 / 10) * 500, (3 / 10) * 500 ] = [ 50, 100, 200, 150 ]
columnToRemove = [ #1, #2, #3, #4 ] filter limit === tableSize = #1
#1 is the least important (0) of [ #1 (0), #2 (3), #3 (2), #4 (1) ] so it gets removed
at 500, #1 gets removed leaving #2, #3 and #4

columns = [ #2, #3, #4 ]
columnsRatio = 2 + 4 + 3 = 9
columnsTableSizes = [ (9 / 2) * 50, (9 / 4) * 75, (9 / 3) * 100 ] = [ 225, 168.75, 300 ]
tableSize = Max([ 225, 168.75, 300 ]) = 300
// columnSizes = [ (2 / 9) * 300, (4 / 9) * 300, (3 / 9) * 300 ] = [ 66.66, 133.33, 100 ]
columnToRemove = [ #2, #3, #4 ] filter limit === tableSize = #4
#4 is the least important (1) of [ #2 (3), #3 (2), #4 (1) ] so it gets removed
at 300, #4 gets removed leaving #2 and #3

columns = [ #2, #3 ]
columnsRatio = 2 + 4 = 6
columnsTableSizes = [ (6 / 2) * 50, (6 / 4) * 75 ] = [ 150, 112.5 ]
tableSize = Max([ 150, 112.5 ]) = 150
// columnSizes = [ (2 / 6) * 150, (4 / 6) * 150 ] = [ 50, 100 ]
columnToRemove = [ #2, #3 ] filter limit === tableSize = #2
#2 is not the least important (3) of [ #2 (3), #3 (2) ] so it doesn't get removed
#3 is the least important (2) of [ #2 (3), #3 (2) ] so it gets removed
at 150, #3 gets removed leaving #2



So theoretically the columns should always get removed in the order of priority unless removing all
lower priority columns still doesn't make room for a higher priority one which then has to go.
And 
*/

const deadspace = tableSize => 0;

export default function* calculateBreakpoints(columns, deadspace) {
  // Replace the columns array with a clone we can mutate without affecting the caller
  columns = [...columns];

  do {
    // Calculate the sum of the remaining columns' ratios to fit the table for them only
    const columnsRatio = columns.reduce((a, c) => a + c.ratio, 0);

    // Calculate the table size fitting each column at its ratio for the remaining columns
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
      debugger;
      columns.splice(columns.indexOf(columnToRemove), 1);
    }

    // Calculate the viewport size resulting in the above table size including dead space
    const viewportSize = deadspace(tableSize);

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

for (const item of calculateBreakpoints(columns, deadspace)) {
  console.log(item);
}
