export default {
  title: "Static deadspace",
  columns: [
    { key: 1, ratio: 0.1, limit: 50, weight: 0 },
    { key: 2, ratio: 0.2, limit: 50, weight: 3 },
    { key: 3, ratio: 0.4, limit: 75, weight: 2 },
    { key: 4, ratio: 0.3, limit: 100, weight: 1 }
  ],
  deadspace: 16,
  // Start at 516 because column limit sum total is 50 + 50 + 75 + 100 = 275,
  // but at that size column sizes distributed by their ratios would be
  // .1 * 275 = 27.5, .2 * 275 = 55, .4 * 275 = 110, .3 * 275 = 82.5
  // and some columns don't reach their limit: 1 (27.5 vs 50), 4 (82.5 vs 100)
  // so we need to scale the table size so that all of the columns ratios and
  // the total of their ratios multiply their respective limits:
  // .1 + .2 + .3 + .4 = 1
  // 1 / .1 = 10 and 10 * 50 = 500
  // 1 / .2 = 5 and 5 * 50 = 250
  // 1 / .4 = 2.5 and 2.5 * 75 = 187.5
  // 1 / .3 = 3.33... and 3.33... * 100 = 333.33...
  // From this we see that the minimal table size to fit all columns is 500.
  // The corresponding deadspace breakpoint for the table size of 500 is 16.
  // The corresponding viewport size for the table size of 500 is 500 + 16 = 516.
  breakpoints: [
    // At 499 the column sizes with the column ratio sum total of .1 + .2 + .4 + .3 = 1 are:
    // (.1 / 1) * 499 = 49.9, (.2 / 1) * 499 = 99.8, (.4 / 1) * 499 = 199.6, (.3 / 1) * 499 = 149.7
    // so some columns don't reach their limit: 1 (49.9 vs 50)
    // the single non-fitting column gets removed
    // At 499 with the column 1 removed and the remaining column ratio sum total of
    // .2 + .3 + .4 = .9 the column sizes are:
    // (.2 / .9) * 499 = 110.88...
    // (.4 / .9) * 499 = 221.77...
    // (.3 / .9) * 499 = 166.33...
    // so all columns reach their limit and these are the final expected column sizes.
    { viewport: 515, table: 499, columns: { 2: 110, 3: 221, 4: 166 } },

    // At 300 the column sizes with the column ratio sum total of .1 + .2 + .4 + .3 = 1 are:
    // (.1 / 1) * 300 = 30, (.2 / 1) * 300 = 60, (.4 / 1) * 300 = 120, (.3 / 1) * 300 = 33.33...
    // so some columns don't reach their limit: 1 (30 vs 50) and 4 (33.33... vs 100)
    // and of those 1 has a lower weight so it gets removed
    // At 300 with the column 1 removed and the remaining column ratio sum total of
    // .2 + .3 + .4 = .9 the column sizes are:
    // (.2 / .9) * 300 = 66.66...
    // (.4 / .9) * 300 = 133.33...
    // (.3 / .9) * 300 = 100
    // TODO: Find out why 4 gets removed if it works out to exactly a hundred
    // TODO: Work throuh the last round of 300 with 4 removed
    { viewport: 316, table: 300, columns: { 2: 100, 3: 200 } },

    // TODO: Work out the expected valiues as per the above
    { viewport: 165, table: 149, columns: { 3: 149 } },

    // TODO: Work out the expected values as per the above
    { viewport: 128, table: 112, columns: { 2: 112 } },

    // TODO: Work out the expected values as per the above
    { viewport: 65, table: 49, columns: {} }
  ]
};
