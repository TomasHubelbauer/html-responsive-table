const columns = [
  { title: "1st", key: "first", weight: 0, ratio: 0.1, limit: 50 },
  { title: "2nd", key: "second", weight: 3, ratio: 0.2, limit: 50 },
  { title: "3rd", key: "third", weight: 2, ratio: 0.4, limit: 75 },
  { title: "4th", key: "fourth", weight: 1, ratio: 0.3, limit: 100 }
];
const breakpoint = viewport => 0;

// TODO: Derive start viewport from table
for (let viewport = 1000; viewport > 0; viewport--) {
  const columns = [];
  const ratio = columns.reduce((a, c) => a + c.ratio, 0);
  const table = breakpoint(viewport);
  do {} while (true);
}
