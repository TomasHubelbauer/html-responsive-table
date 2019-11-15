export default {
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
  // TODO: Document in the same way as the static deadspace one
  breakpoints: [
    { viewport: 1015, table: 999, columns: { 1: 111, 2: 222, 3: 444, 4: 332 } },
    { viewport: 765, table: 749, columns: { 3: 428, 4: 321 } },
    { viewport: 515, table: 499, columns: { 3: 499 } }
  ]
};
