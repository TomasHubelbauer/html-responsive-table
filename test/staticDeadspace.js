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
    // .2 + .4 + .3 = .9 the column sizes are:
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
    // .2 + .4 + .3 = .9 the column sizes are:
    // (.2 / .9) * 300 = 66.66...
    // (.4 / .9) * 300 = 133.33...
    // (.3 / .9) * 300 = 100 (99.99... due to rounding errors)
    // so the column 4 doesn't reach its limit (99.99... vs 100) and gets removed
    // At 300 with columns 1 and 4 removed and the remaining column ratio sum total of
    // .2 + .4 = .6 the column sizes are:
    // (.2 / .6) * 300 = 100
    // (.4 / .6) * 300 = 200
    // so all remaining columns reach their limits and these are the final expected column sizes.
    { viewport: 316, table: 300, columns: { 2: 100, 3: 200 } },

    // At 149 the column sizes with the column ratio sum total of .1 + .2 + .4 + .3 = 1 are:
    // (.1 / 1) * 149 = 14.9, (.2 / 1) * 149 = 29.8, (.4 / 1) * 149 = 59.6, (.3 / 1) * 149 = 44.7
    // so none of the columns fit: 1 (14.9 vs 50), 2 (29.8 vs 50), 3 (59.6 vs 75) and 4 (44.7 vs 100)
    // of those 1 has the lowest weight (0) so it gets removed
    // At 149 with 1 removed and the remaining column ratio sum total of .2 + .4 + .3 = .9 the column sizes are:
    // (.2 / .9) * 149 = 33.11...
    // (.4 / .9) * 149 = 66.22...
    // (.3 / .9) * 149 = 49.66...
    // so some of the columns don't fit: 2 (33.11... vs 50), 4 (49.66... vs 100)
    // of those 4 has the lowest weight (1) so it gets removed
    // At 149 with 1 and 4 removed and the remaining column ratio sum total of .2 + .4 = .6 the column sizes are:
    // (.2 / .6) * 149 = 49.66...
    // (.4 / .6) * 149 = 99.33...
    // so none of the columns fit: 2 (49.66... vs 50) and 3 (99.33... vs 75)
    // of those 3 has a lower weight, but second also didn't fit so it gets removed
    // This is something to get fixed because after removing 3, 2 fits again so 3 should be removed instead
    // At 149 with 1, 2 and 4 removed, 3 stretches the whole size
    { viewport: 165, table: 149, columns: { 3: 149 } },

    // At 112 the column sizes with the column ratio sum total of .1 + .2 + .4 + .3 = 1 are:
    // (.1 / 1) * 112 = 11.2, (.2 / 1) * 112 = 22.4, (.4 / 1) * 112 = 44.8, (.3 / 1) * 112 = 33.6
    // so none of the columns fit
    // of those 1 has the lowest weight (0) so it gets removed
    // At 112 with 1 removed and the remaining column ratio sum total of .2 + .4 + .3 = .9 the column sizes are:
    // (.2 / .9) * 112 = 24.88...
    // (.4 / .9) * 112 = 49.77...
    // (.3 / .9) * 112 = 37.33...
    // so none of the columns fit
    // of those 4 has the lowest weight (1) so it gets removed
    // At 112 with 1 and 4 removed and the remaining column ratio sum total of .2 + .4 = .6 the column sizes are:
    // (.2 / .6) * 112 = 37.33...
    // (.4 / .6) * 112 = 74.66...
    // so none of the columns fit
    // of those 3 has the lower weight (2) so it gets removed
    // At 112 with 1, 3 and 4 removed, 2 stretches the whole size
    { viewport: 128, table: 112, columns: { 2: 112 } },

    // At 49 none of the columns can fit, because the lowest limit is 50, so all columns get removed
    { viewport: 65, table: 49, columns: {} }
  ]
};
