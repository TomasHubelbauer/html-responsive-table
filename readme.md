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

Reword the limitations when dead spaces are made update-able to make it
clear that out of the box this solution requires a stable definition of dead
spaces, but you can plug in your own variable definition of dead spaces if you
choose to listen to resize / scroll changes and update the dead spaces yourself.

Introduce a configration switch to all version which configures whether the
version removes a column as soon as it doesn't fit anymore no matter what or
whether it removes a lower-weight but still fitting version in order to keep
a higher weight column by making it fit.

Fix the bug with the part width table where the code currently throws an
error in version 1.

Finalize documenting the expected values in the dynamic deadspace test.

Add tests for all versions - update the test harness to have checks which
depend on the shape of the return objects (all columns vs changes).

Replace `renderCanvas` with some sort of a combinatorical testing harness
which enumerates all possible viewport sizes (up to the one needed to
accomodate fit table with all columns) and combines dead spaces with zero
to N breakpoints (which are ordered and consecutive - keep that in mind)
and identifies ranges which give the same breakpoints. Do not do this
visually (it is just useful for debugging), but do it.

Add an example of variable dead spaces, for example a pane which has some
breakpoints but also changes its size on hover.

Add support of column resizing with two modes through variable dead spaces:

- Resize to change the distribution of the table size between the columns
  surrounding the divider (other columns stay constant and these two change
  their ratios to follow the divider as it moves)
- Resize to shrink or stretch the table size (column sizes remain constant
  but their limits and possibly ratios change so that the resulting table
  size grows by the same amount the divider did)

Compare all versions when fixed to see if they all yield the same ranges
and select the simplest one, which is probably going to be the version 3.

Test this test case which checks the ordering logic.

| Key | Limit | Ratio | Weight |
| --- | ----- | ----- | ------ |
| #1  | 100   | 1     | 4      |
| #2  | 100   | 1     | 3      |
| #3  | 100   | 1     | 2      |
| #4  | 100   | 1     | 1      |

The first breakpoint should be 400 and should remove #4.
The second 300 and remove #3.
The third 200 and remove #2.
The last 100 and remove #1.
