# HTML Responsive Table

[**LIVE**](https://tomashubelbauer.github.io/html-responsive-table/)

This repository contains an HTML responsive table component, which responds
to viewport changes by hiding its columns in priority order so that the
information density of the table adjusts based on the screen dimensions.

This is in contrast to a regular HTML table, which will proceed to truncate
content of its cells, but will not hide or restructure content to fit the
available viewport in any other way.

An alternative to this approach is to restructure the table layout to turn
it into a list on mobile and keep it as a table on desktop (either using
CSS or JS, both is possible), but this solution has an added benefit of
adjusting the information density by selectively hiding content rather than
just restructuring it.

A differentiating factor for this component is that it lacks runtime logic
to implement its featureset. Instead, it offloads the work to the layout
engine and benefits from its faster execution. This is achieved using media
queries which are dynamically generated at mount time and stay constant from
that point on.

## Running

`npx serve .` then access http://localhost:5000.

## Examples

The tests contain comments which showcase both how the initial breakpoint
estimation is calculated (the fit table size and the derived fit viewport
size) and the breakpoint calculation.

### Static Deadspace

See [`test/staticDeadspace.js`](test/staticDeadspace.js) comments.

### Dynamic Deadspace

See [`test/dynamicDeadspace.js`](test/dynamicDeadspace.js) comments.

## Limitations

The algorithm is able to accept definitions of dead spaces as they surround the
table which is used to correctly translate the viewport changes to the table
changes including the effect of static or known-dynamic margins and maximal
width of the table.

This is sufficient for many scenarios, but scenarios where the table's placement
within the page or size is derived in a more complex way and it is not possible
to capture the dead spaces correctly, the calculation will accrue a degree of error.

This is the result of the influence of rulesets on the tables ancestors in its
path on the visual document tree and it is impractical to determine programatically,
most likely.

That's why we opt to support only the cases where the dead spaces are constant-enough
that they can be captured and provided as an input to the algorithm.

## To-Do

Fix the bug with the part width table where the code currently throws an
error in the new version.

Finalize the currently buggy new version which only reports visibility
changes and get rid of the old version which for each breakpoint reports
the visibility of all columns.

Be smarted about the weights, in the demo table, third should be removed, not
second, because removing third (which fits but has lower weight) will make
enough room to fit second again. So we need to do an extra / a better pass to
include this check.

See if there is a way to instead of iterating all the possible viewport sizes
derive the exact breakpoint values numerically. Some sort of a dynamic
programming exercise or something. We don't need the exact values because the
layout engine will round them up to an integer anyway, but we should still
pursue this, because it will allow us to get rid of the iteration and only
enumerate the actual change points.

Finalize documenting the expected values in the dynamic deadspace test.

Advance `renderCanvas` to find `limit` from the columns and iterate all the
possible breakpoint values within that limit and then all the possible values
of that breakpoint within that limit and report the first breakpoint-value pair
for each unique path from all columns to one or no columns. Extend this further
to be able to sweep the range with two breakpoints (and the full possible extent
of their values) or more. Take into the account that with multiple breakpoints,
ordering logic will result in the subsequent breakpoints' ranges being reduced
compared to the previous. Ultimately something like `deriveDeadspacesFromColumns`
should be the result of this work and the results of that function should
yield exemplary unit test values.

Play around with swapping the order of breakpoint and value in `renderCanvas`
and see if the picture comes out rotated. Also play around with going from
limit to zero not zero to limit and see what that does.

Add an example of of a dead space simulating a pane which changes when on
hover (this means the definition of dead spaces changes after the initial
calculation). Add both a UI demo (with the actual hover hook) and a test.
This will be implemented by recalculating the `style` element on both hover
and leave of the pane with the updated `deadspace` definition reflecting
the pane's visibility status.

Add a demo of column resizing with two modes:

- Resize to change the distribution of the table size between the columns
  surrounding the divider (other columns stay constant and these two change
  their ratios to follow the divider as it moves)
- Resize to shrink or stretch the table size (column sizes remain constant
  but their limits and possibly ratios change so that the resulting table
  size grows by the same amount the divider did)

## New Algo

In order to avoid having to iterate all the viewport values, I'm working on
a new algorithm.

Basically, breakpoints happen only when the number of visible columns changes.
This number starts at the number of columns and decreases by 1 (more?) until
there are no columns left.

The number should never decrease again I don't think, the fact that it
currently does it a result of a bug where the current algorithm gives up
"too soon" without realizing a column with more weight would fit after
removing one with less and it results in a column disappearing and appearing
again.

To determine the breakpoints, start with all the columns and calculate the
table fit size for them, then the viewport fit size from that. Then remove
1 to get the breakpoint size and determine which column didn't make it.

Then go with just the columns that are left, determine the table size, the
viewport size from that, remove 1 and determine which column didn't make it
next.

Keep repeating until no columns are left.

```js
const columns = [
  { key: 1, ratio: 0.1, limit: 50, weight: 0 },
  { key: 2, ratio: 0.2, limit: 50, weight: 3 },
  { key: 3, ratio: 0.4, limit: 75, weight: 2 },
  { key: 4, ratio: 0.3, limit: 100, weight: 1 }
];

do {
  const ratioSumTotal = columns.reduce((a, c) => a + c.ratio, 0);
  const tableFitSize = Math.max(...columns.map(c => (ratioSumTotal / c.ratio) * c.limit));
  const columnSizes = columns.map(c => (c.ratio / ratioSumTotal) * tableFitSize);
  const columnToRemove = columns
    // Find the columns which fit exactly so they will go when the viewport decreases by one
    .filter((c, i) => c.limit === columnsSizes[i])
    // Find the one with the smallest weight of those to know which of them will be the one to go
    .sort((a, b) => b.weight - a.weight);
  columns.splice(columns.indexOf(columnToRemove), 1);
  yield {
    breakpoint: tableFitSize - 1,
    columnToRemove
  };
} while (columns.length > 0);

/*
NO DEAD SPACE
1st round:
  columns
    [ #1, #2, #3, #4 ]
  ratioSumTotal
    .1 + .2 + .4 + .3 = 1
  tableFitSize
    max([ (1 / .1) * 50, (1 / .2) * 50, (1 / .4) * 75, (1 / .3) * 100 ])
    max([ 10 * 50, 5 * 50, 2.5 * 75, 3.33 * 100 ])
    max([ 500, 250, 187.5, 333.33 ])
    500
  columnSizes
    [ (.1 / 1) * 500, (.2 / 1) * 500, (.4 / 1) * 500, (.3 / 1) * 500 ]
    [ .1 * 500, .2 * 500, .4 * 500, .3 * 500 ]
    [ 50, 100, 200, 150 ]
  columnToRemove
    filter
      [ #1 ]
    sort
      [ #1 ]
    #1
  columns.splice
    [ #2, #3, #4 ]
  yield
    { breakpoint: 500 - 1, columnToRemove: #1 }

2nd round:
  columns
    [ #2, #3, #4 ]
  ratioSumTotal
    .2 + .4 + .3 = .9
  tableFitSize
    max([ (.9 / .2) * 50, (.9 / .4) * 75, (.9 / .3) * 100 ])
    max([ 4.5 * 50, 2.25 * 75, 3 * 100 ])
    max([ 225, 168.75, 300 ])
    300
  columnSizes
    [ (.2 / .9) * 300, (.4 / .9) * 300, (.3 / .9) * 300 ]
    [ .22 * 300, .44 * 300, .33 * 300 ]
    [ 66.66, 133.33, 100 ]
  columnToRemove
    filter
      [ #4 ]
    sort
      [ #4 ]
    #4
  columns.splice
    [ #2, #3 ]
  yield
    { breakpoint: 300, columnToRemove: #4 }

3rd round:
  columns
    [ #2, #3 ]
  ratioSumTotal
    .2 + .4 = .6
  tableFitSize
    max([ (.6 / .2) * 50, (.6 / .4) * 75 ])
    max([ 150, 150 ])
    150
  columnSizes
    [ (.2 / .6) * 150, (.4 / .6) * 150 ]
    [ .33 * 150, .66 * 150 ]
    [ 50, 100 ]
  columnToRemove
    filter
      [ #2 ]
    sort
      [ #2 ]
    #2
  columns.splice
    [ #3 ]
  yield
    { breakpoint: 150, columnToRemove: #3 }

4th round:
  columns
    [ #2 ]
  ratioSumTotal
    .2
  tableFitSize
    max([ (.2 / .2) * 50 ])
    max([ 50 ])
    50
  columnSizes
    [ (.2 / .2) * 50 ]
    [ 50 ]
  columnToRemove
    filter
      [ #2 ]
    sort
      [ #2 ]
    #2
  columns.splice
    []
  yield
    { breakpoint: 50, columnToRemove: #4 }

STATIC DEAD SPACE
TODO

DYNAMIC DEAD SPACE
TODO
*/
```
