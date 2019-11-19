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

## Column Resizing

Column resizing is not supported out of the box with this component, but
should be implementable using its APIs.

There are two possible ways to implement column resizing:

1. Dragging the divider between two columns preserves the combined size of
   the two columns and adjusts their ratios between each other resulting in
   changing column sizes of the two columns surrounding the divider, but not
   the table itself
2. Dragging the divider between two columns preserves the size of the
   columns in the direction of the drag and increases the size of the column
   neighboring the divider in the opposite direction of the drag, resulting
   in table size increase equal to the column size increase

The first solution should be implementable by translating the positive and
negative offsets on each size of the divider to changes in the `ratio` fields
of each column definition and regenerating the media queries `style` element
content to reflect the new `flex` attribute values.

Say the table has the size of 500 and the columns are defined as:

| Key | Ratio | Limit |
| --- | ----- | ----- |
| 1   | 1     | 50    |
| 2   | 2     | 50    |
| 3   | 4     | 75    |
| 4   | 3     | 100   |

At table size 500, the column sizes are 50, 100, 200, 150.

Say I drag the divider between the first two columns by 10 to the right.
The resulting column sizes should be: 60, 90, 200, 150.
The ratios that will need to be updated are those of the first two columns:
1 and 3. Their total should not change, so presumably adjusting them in
accordance with the adjusted sizes should yield the desired result:

50 vs 100 is 1 vs 2 total 3

60 vs 90 is 2 vs 3 total 5 adjusted to three is 2/5 vs 3/5 is 1.2 vs 1.8,
total still three.

(1.2 / 10) times 500 = 60
(1.8 / 10) times 500 = 90

It works!

The second solution should be implementable by realizing that dragging the
divider by some amount will result in the table size increase by the same
amount. Dragging from 500 to 600 without changing any ratios will add the
extra 100 distributed to all columns according to their ratios. To prevent
this and only extend the single column, the ratios of all other columns
need to be decreased just enough to negate the would-be addition, resulting
in the entire addition being admitted to the single column being resized.

| Key | Ratio | Limit |
| --- | ----- | ----- |
| 1   | 1     | 50    |
| 2   | 2     | 50    |
| 3   | 4     | 75    |
| 4   | 3     | 100   |

Ratio total: 10.

At 500, the sizes are:

- 1/10 \* 500 = 50
- 2/10 \* 500 = 100
- 4/10 \* 500 = 200
- 3/10 \* 500 = 150

At 600, the sizes are:

- 1/10 \* 600 = 60 (extra 10)
- 2/10 \* 600 = 120 (extra 20)
- 4/10 \* 600 = 240 (extra 40)
- 3/10 \* 600 = 180 (extra 30)

We're dragging the first column, which means we need to negate the gains for
the second (20), third (40) and fourth (30) resulting in an additional 90 being
added to 90 in addition to its ten totalling a 100 by which we dragged the divider.

We need to land at these ratios:

- ? \* 600 = 150 = .25

- ? \* 600 = 100 = .16
- ? \* 600 = 200 = .33
- ? \* 600 = 150 = .25

That totals one so scaled to 10 it gives 2.5, 1.6, 3.3 and 2.5.

## Algorithm

The algorithm is based on deriving the table size from the viewport size,
finding points at which the table size reaches values which cause the columns
that can be displayed for the value to change and generating CSS media queries
which are based on the viewport size and hiding or showing columns in the table
in order to make the disappearing and appearing of columns happen.

The input is a set of columns which each define their minimum size, priority and
flex among one another.

## Problems

There are a few problems with this algorithm as implemented.
There are multiple versions, but no version solves them all.

1. I have no figured out how to completely avoid iterating the viewport size down
   I have implemented versions, which figure out break-points of the table size by
   calculating the sizes at which columns no longer fit and thus that's where the
   next breakpoint must be, but this doesn't take into an account dynamic deadspaces,
   which might make new room which wasn't there before or remove room which was
   there in the middle of two points derived from just the column values.
2. The columns do not get removed in the right order: sometimes a higher priority
   column will get removed before a lower priority one because the higher priority
   one reaches its limit faster than the lower priority one.
3. I want to avoid the clunky table-from-viewport viewport-from-table deadspaces-as
   -object API we have currently, but I can't make it a function, because then I
   couldn't derive the optimal break points taking into an account the deadspaces
   (see #1) and even with it being an object I have not solved that.
