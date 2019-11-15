import calculateBreakpoints from "./calculateBreakpoints.js";

const tests = [
  {
    title: "Static deadspace",
    columns: [
      { key: 1, ratio: 0.1, limit: 50, weight: 0 },
      { key: 2, ratio: 0.2, limit: 50, weight: 3 },
      { key: 3, ratio: 0.4, limit: 75, weight: 2 },
      { key: 4, ratio: 0.3, limit: 100, weight: 1 }
    ],
    deadspace: 16,
    breakpoints: [
      { viewport: 515, table: 499, columns: { 2: 110, 3: 221, 4: 166 } },
      { viewport: 316, table: 300, columns: { 2: 100, 3: 200 } },
      { viewport: 165, table: 149, columns: { 3: 149 } },
      { viewport: 128, table: 112, columns: { 2: 112 } },
      { viewport: 65, table: 49, columns: {} }
    ]
  },
  {
    title: "Dynamic deadspace",
    columns: [
      { key: 1, ratio: 0.1, limit: 100, weight: 4 },
      { key: 2, ratio: 0.2, limit: 150, weight: 2 },
      { key: 3, ratio: 0.4, limit: 200, weight: 3 },
      { key: 4, ratio: 0.3, limit: 150, weight: 1 }
    ],
    deadspace: {
      300: 116,
      _: 16
    },
    breakpoints: [
      { viewport: 0, table: 0, columns: {} },
      { viewport: 0, table: 0, columns: {} },
      { viewport: 0, table: 0, columns: {} }
    ]
  }
];

const rounds = 10;
let errors = 0;
for (const test of tests) {
  let testErrors = 0;

  console.group(test.title);
  const breakpoints = [...calculateBreakpoints(test.columns, test.deadspace)];
  if (breakpoints.length !== test.breakpoints.length) {
    console.log(
      `Expected ${test.breakpoints.length} breakpoints, but got ${breakpoints.length}`
    );
    testErrors++;
  }

  for (let index = 0; index < test.breakpoints.length; index++) {
    const breakpoint = breakpoints[index];
    if (!breakpoints) {
      console.log(`Missing expected breakpoint #${index + 1}`);
      testErrors++;
      continue;
    }

    const testBreakpoint = test.breakpoints[index];
    console.group(
      `Testing breakpoint viewport ${testBreakpoint.viewport} & table ${testBreakpoint.table}...`
    );

    if (breakpoint.viewportBreakpoint !== testBreakpoint.viewport) {
      console.log(
        `Expected viewport size of ${
          testBreakpoint.viewport
        }px for breakpoint #${index + 1}, but got ${
          breakpoint.viewportBreakpoint
        }`
      );
      testErrors++;
    }

    if (breakpoint.tableBreakpoint !== testBreakpoint.table) {
      console.log(
        `Expected table size of ${
          testBreakpoint.table
        }px for breakpoint #${index + 1}, but got ${breakpoint.tableBreakpoint}`
      );
      testErrors++;
    }

    const columns = breakpoint.columns.filter(c => c.status === "visible");
    if (columns.length === 0) {
      if (Object.keys(testBreakpoint.columns).length !== 0) {
        console.log(
          `Expected to find ${
            Object.keys(testBreakpoint.columns).length
          } columns, but got zero`
        );
        testErrors++;
      }

      console.groupEnd();
      continue;
    }

    const columnsRatio = columns.reduce((a, c) => {
      const testColumn = test.columns.find(c2 => c2.key === c.key);
      return a + testColumn.ratio;
    }, 0);

    let columnsTotal = 0;
    for (const column of breakpoint.columns) {
      const testColumn = testBreakpoint.columns[column.key];
      if (!testColumn) {
        if (column.status !== "hidden") {
          console.log(
            `Expected column ${column.key} to be hidden, but it is visible`
          );
          testErrors++;
        }

        continue;
      }

      const columnRatio =
        test.columns.find(c => c.key === column.key).ratio / columnsRatio;
      const columnWidth = ~~(columnRatio * breakpoint.tableBreakpoint);
      columnsTotal += columnWidth;

      if (columnWidth !== testColumn) {
        console.log(
          `Expected column to have size ${testColumn}, but got ${columnWidth}`
        );
        testErrors++;
      }
    }

    // Afford a 1px rounding error epsilon per each column
    if (
      Math.abs(columnsTotal !== testBreakpoint.table) >
      Object.keys(testBreakpoint.columns).length
    ) {
      console.log(
        `Expected the column size sum total ${columnsTotal} to add up to the table size ${testBreakpoint.table} but it did not`
      );
      testErrors++;
    }

    // TODO: Consider testing the deadspace as well, probably test whether the deadspace resulting
    // from subtracking the expected viewport size matches the got viewport size or something

    console.groupEnd();
  }

  if (testErrors) {
    console.warn(`Found ${testErrors} test errors.`);
    errors += testErrors;
  } else {
    const durations = [];
    for (let round = 0; round < rounds; round++) {
      const timestamp = performance.now();
      void [...calculateBreakpoints(test.columns, test.deadspace)];
      durations.push(performance.now() - timestamp);
    }

    const averageDuration = (
      durations.reduce((a, c) => a + c, 0) / rounds
    ).toFixed(2);
    const worstDuration = Math.max(...durations).toFixed(2);
    const bestDuration = Math.min(...durations).toFixed(2);
    console.log(
      `Pass in ${averageDuration}ms on average, ranging between ${bestDuration}ms and ${worstDuration}ms in ${rounds} rounds.`
    );
  }

  console.groupEnd();
}

if (errors) {
  console.warn(`Found ${errors} total errors!`);
}
