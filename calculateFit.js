export default function calculateFit(columns) {
  const ratioSumTotal = columns.reduce((a, c) => a + c.ratio, 0);
  return Math.max(...columns.map(c => (ratioSumTotal / c.ratio) * c.limit));
}
