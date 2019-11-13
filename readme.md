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

| Title | Ratio | Weight | Limit |
| ----- | ----- | ------ | ----- |
| 1st   | .1    | 0      | 50    |
| 2nd   | .2    | 3      | 50    |
| 3rd   | .4    | 2      | 75    |
| 4th   | .3    | 1      | 100   |

The viewport width is 500 and shrinking to zero. There is no spacing surrounding
the table and the viewport edges.

- At the breakpoint 500, all columns are visible
- From 499 to 301, the first column is not visible anymore
  - It does not meet its limit of 50 anymore
- From 300 to 150, only the second and third columns are visible
  - The 1st column fails immediately as per the above
  - Even without the 1st column, the 4th column works out to less than its limit - 100
- From 149 to 113, only the third column is visible
  - Initially no columns reach their limit
  - With 1st gone, the remaining 3 still do not reach their limit
  - With 4th gone, the 2nd works out to less than its limit so its gone
- From 112 to 50, only the second column is visible
  - Initially again no columns reach their limit
  - With 1st gone, no columns still reach their limit
  - With 4th gone, neither of 2nd and 3rd reach their limit
  - With 3rd gone, 2nd remains
- From 49 to zero, no columns fit the resized table dimensions
  - Since the lowest limit across the columns is 50, no columns make it

| Breakpoint | Hide | Show | Hidden             | Visible            |
| ---------- | ---- | ---- | ------------------ | ------------------ |
| 500+       |      |      |                    | 1st, 2nd, 3rd, 4th |
| 499-       | 1st  |      | 1st                | 2nd, 3rd, 4th      |
| 300-       | 4th  |      | 1st, 4th           | 2nd, 3rd           |
| 149-       | 2nd  |      | 1st, 2nd, 4th      | 3rd                |
| 112-       | 3rd  | 2nd  | 1st, 3rd, 4th      | 2nd                |
| 49-        | 2nd  |      | 1st, 2nd, 3rd, 4th |                    |

---

| Title | Weight | Limit | Ratio |
| ----- | ------ | ----- | ----- |
| 1st   | 4      | 100   | 1     |
| 2nd   | 3      | 200   | 2     |
| 3rd   | 2      | 300   | 3     |
| 4th   | 1      | 400   | 4     |

The viewport goes from a thousand to a zero.

| Table breakpoint | Viewport breakpoint  | Hidden columns |
| ---------------- | -------------------- | -------------- |
| 999              | 10 + 999 + 10 = 1019 | 4th            |
| 599              | 10 + 599 + 10 = 619  | 4th, 3rd       |
| 299              | 10 + 299 + 10 = 319  | 4th, 3rd, 2nd  |

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

## To-Do

Debug the problem with the half width table where the numbers that are supposed
to accomodate for the border are off.

Make the dead spaces object capture the changing border.
