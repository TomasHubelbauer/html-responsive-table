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

### Static Deadspace

See [`test/staticDeadspace.js`](test/staticDeadspace.js) comments.

### Dynamic Deadspace

See [`test/dynamicDeadspace.js`](test/dynamicDeadspace.js) comments.

## Limitations

The algorithm is able to accept definitions of dead spaces as they surround the
table which is used to correctly translate the viewport changes to the table
changes including the effect of static or known-dynamic margins and maximal
width of the table. This is sufficient for many scenarios, but scenarios where
the table's placement within the page or size is derived in a more complex way
and it is not possible to capture the dead spaces correctly, the calculation will
accrue a degree of error. This is the result of the influence of rulesets on the
tables ancestors in its path on the visual document tree and it is impractical to
determine programatically, most likely. That's why we opt to support only the
cases where the dead spaces are constant-enough that they can be captured and
provided as an input to the algorithm.

## Techniques

When enumerating the breakpoints to find all that will affect the table columns,
we need to define a range from where to where should we go. The lower bound is
easy, zero, but the upper bound is tricky.

We cannot just start with the column limits and sum them up, because the column
ratios times that sum total might work out less that the individual columns'
limits:

| Title | Ratio | Limit |
| ----- | ----- | ----- |
| 1st   | .1    | 50    |
| 2nd   | .2    | 50    |
| 3rd   | .4    | 75    |
| 4th   | .3    | 100   |

The sum total here is 50 + 50 + 75 + 100 = 275 and the rationed sizes of the
columns are: .1 times 275 = 27.5, .2 times 275 = 55, .4 times 275 = 110 and
.3 times 275 = 82.5.

The first and fourth columns do not reach their limits in this scenario, so
that's not where we can start, we need to start at a higher value at which
all columns fit including their ratios.

We can calculate the minimal size according to each columns ratio and limit:

- 1st = 1 / .1 times 50 = 500
- 2nd = 1 / .2 times 50 = 250
- 3rd = 1 / .4 times 75 = 187.5
- 4th = 1 / .3 times 100 = 333.3

The highest value is 500 and that's where we need to start.

This is further complicated by tables with dynamic deadspaces where we on
top of the table width to start at need to also find a viewport width that
is able to accomodate the fit table and start from that viewport width
working down, calculating the table width according to the changing dead
space breakpoint.

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
