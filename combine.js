// TODO: Brute-force the entire problem space to try and determine possible edge cases
// - Generate columns with various configurations (limit, ratio, weight)
// - Generate deadspaces with various configurations (number of breakpoints an their values)
// - Sweep the viewport from zero to say 2k to give it some sort of a bound

for (let columns = 0; columns < 5; columns++) {
  // TODO: Generate the columns and sweep through their values
  for (let breakpoints = 0; breakpoints < 5; breakpoints++) {
    // TODO: Generate the breakpoints and sweep through their values
    for (let viewport = 0; viewport < 2000; viewport++) {
      // TODO: Sweep through the viewport values
    }
  }
}
