export default function calculateFit(/** @type {Column[]} */ columns) {
  const ratioSumTotal = columns.reduce((a, c) => a + c.ratio || 1, 0);
  return Math.max(
    ...columns.map(c => (ratioSumTotal / (c.ratio || 1)) * (c.limit || 0))
  );
}
