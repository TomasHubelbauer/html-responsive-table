# HTML Responsive Table

For current status, scroll all the way below!

[**LIVE**](https://tomashubelbauer.github.io/html-responsive-table/)

## Running

`npx serve .` then access http://localhost:5000.

---

This is a prototype of an HTML component whose behavior is that of a table,
but it has differences in how it handles responsive behavior.

A normal HTML table element scales the size of its columns down and truncates
their content as the available parent element size decreases. This results in
smaller cells being able to show less content.

This presents a conundrum in how to present tabular content on mobile and tablet
devices. A designer may choose to present less content to begin with to ensure
that even small factor devices are able to fit most or all of it on the screen
at the same time, but this strips the users of laptops and desktop, even more so
ones with wide screens, of data they could be seeing instead of the huge islands
of blank space.

Ideally, there should be a component able to display large slices of dense
datasets on big screens and smaller slices on small screens. In particular, the
solution I'm looking at is going to be about hiding particular columns in a
weighted order in order to allow other columns more space to expand into as the
entire area of the screen available for the screen decreases (in case of resizing
a window on the desktop) or starts off already small (on mobile devices).

This is entirely possible already and most likely there are components which
allow this, but they rely on messy and slow dimension change hooks and scroll
handlers. Would it be possible to offload this logic to the layout renderer
completely?

This experiment aims to answer that. Upon mounting, the table(-like) component
will be measure to determine its dimensions and the relative dimensions of its
columns as compared to the size of the table.

The columns also each hand a value associated with them which stands for their
weight which is correlated with how long will they stay on the screen as other
columns disappear with the viewport's shrinkage.

Based on these values, I aim to calculate a set of media queries which will be
used by the layour engine to selectively turn off the visibility of the cells
comprising a particular column in order to make room for more columns as the
viewport space grows scarce.

A practical example follows:

We have a table whose width is 500 which is exactly a half of the total width
of the viewport, a 1000. The table has four columns, one 50, another 100,
third 200 and the last 150 units wide, distributing the width of the table,
the 500.

We also know the columns have the following weights: 0, 3, 2, 1.
This means the first column will disappear first, the last second, then the
second to last and the second one will remain the only one visible in case the
viewport cannot support any more than that.

This table will shrink as the viewport does, but we need more information than
this in order to be able to make the call to the effect of when to start hiding
which columns in order to make room for the rest, even if we already know in
which order. As of now, the best design to me seems to be to associate a minimal
width with each column.

Let's imagine the minimal widths are as follows: 50, 50, 75 and 100. This
means the first column will actually never shrink, it will immediately disappear
as it is forbidden to shrink past its minimal width. The other columns can shrink
and will do so until reaching their individual minimal widths.

Should a column lack a minimal width requirement, it will render no matter the
size of the viewport.

| Column | Size | Ratio | Weight | Limit |
| ------ | ---- | ----- | ------ | ----- |
| 1st    | 50   | .1    | 0      | 50    |
| 2nd    | 100  | .2    | 3      | 50    |
| 3rd    | 200  | .4    | 2      | 75    |
| 4th    | 150  | .3    | 1      | 100   |

Should we resize our viewport to 750 from the original 1000, our table's width
will become 375. The sizes of the columns will change to .1, .2, .4 and .3 times
the new width: 37.5, 75, 150 and 112.5. This is not possible since the first
column cannot go past 50, so at this point, it is gone, leaving us with columns
with ratios of .2, .4 and .3 of the original width of the all four columns or
.22, .44 and .33 all continued. This works out to column sizes of 82.5, 165 and
123.75. These widths are all above the size limits of the remaining columns, so
they all remain visible.

We can calculate this logic on the fly, but want to avoid it, because it would
require us to assing a size change listener hook to the viewport so instead, if
we could find the values at which columns appear and disappear, we could identify
breakpoints for which to create media queries whose rules would hide or show
those given columns.

A crude way to do this would be to walk backwards from the full width of the
viewport to zero, noting which columns are visible and which hidden based on the
algorithm above and then remove duplicate results, leaving us only with the
breakpoint values. However, these values will not be accurate, so this is not
the complete solution, just a crude approximation.

Let's imagine how that would go. Working from the example above, the generic
version is as follows:

For the original viewport size `w`, the original table size `t` and the
resized table size `t_r` (we don't care about the resized viewport size as it
directly correlates with the table size), we can determine if each column of the
table is visible recursively, by evaluating the effective sizes of all columns
with the resized table width, `cx_r`, where `x` stands for the column number,
filtering out columns whose effective size is less than their limit size,
removing those and reevaluating with the remaining columns whose ratios are
adjusted since the removed columns left space which they split up relative to
their ratios, so their effective size with the removed columns works out to a
different number in the following runs. We continue until there are no columns
whose effective size is less than their limit size or until there are no columns
left. When removing columns, in each round, we only remove the one with the
lowest weight, not all columns which are under their limit, as removing the
least significant column can result in the other columns reaching or surpassing
their limit again. In that case, we retry the run for that resized table width
again.

```js
const originalViewportWidth = 1000;
const originalTableWidth = 500;
const allColumns = [
  { ratio: 0.1, limit: 50, weight: 0, title: "1st" },
  { ratio: 0.2, limit: 50, weight: 3, title: "2nd" },
  { ratio: 0.4, limit: 75, weight: 2, title: "3rd" },
  { ratio: 0.3, limit: 100, weight: 1, title: "4th" }
];
for (
  let resizedTableWidth = originalTableWidth;
  resizedTableWidth > 0;
  resizedTableWidth--
) {
  const columns = [...allColumns];
  let columnToRemove;
  do {
    const adjustedColumnRatioSum = columns.reduce((a, c) => a + c.ratio, 0);
    for (const column of columns) {
      const adjustedColumnRatio = column.ratio / adjustedColumnRatioSum;
      const effectiveColumnWidth = adjustedColumnRatio * resizedTableWidth;
      if (
        effectiveColumnWidth < column.limit &&
        (!columnToRemove || columnToRemove.weight > column.weight)
      ) {
        columnToRemove = column;
      }
    }

    if (columnToRemove) {
      columns.remove(columnToRemove);
    }
  } while (columns.length > 0 && columnToRemove);
}
```

For this particular scenario, the results are as follows:

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

I've implemented the above and calculating the breakpoints within the table works
okay and is acceptable. However, the problem is that the target element exists
within some path on the visual DOM tree which confines it to its maximum dimensions
and there is no guarantee that the element will scale linearly with the viewport.
In fact, it most likely won't.

This wouldn't be a problem in simple cases, like the element having only some
margins, which can be substracted from the viewport size, so that changing the
viewport by the amount of the margins leaves the table alone and only when the
margins have been reduced enough that shrinking the browser down further actually
squeezes the table, the breakpoints kick in.

These edge values are most likely not possible to determine programatically in a
reliable way, because there is a function which is result of the layout of the
element and the ones in its visual tree path and this function determines between
what endpoints of the viewport size is the table element affected and also how
(because it might not be only linearly).

It might be possible to allow the user to determined these points themselves based
on the other CSS they author and let them set these values so that this method
works, but at that point there is a likely disconnect waiting to happen when these
values are depending on the other CSS but it is impossible to notice when having
forgotten to change these values after making changes to the CSS. This is a high
maintenance situation and is likely not worth it for anyone.

This limitation prohibits this solution from working generically and limits it to
being useful only in the most basic situations.

- See if the media query styles could be made scoped
- Finalize the solution with passing dead space to `renderTable`

The solution I am going with (passing in at what breakpoints there is how much)
dead space around (or should it be to the left?) of the table should work out
such that for the first, full-width table, the viewport changes directly,
immediately and linearly affect the table dimensions.

For the second table which has conditional pane, there are regions where the
linearity has a coefficient which is dependent on the pane dimensions which
themselves are a subject to the viewport size.

Starting with a simple situation, let's imagine there is a single pane to the
left of the table which otherwise stretches to the end of the page. This means
that the table will start scaling with the viewport change immediately, however,
the left pane's width needs to be taken into an account while scaling.

Should the pane be 200 wide, the table 600 and the viewport itself 800 (we are
ignoring margins in this example), shrinking the viewport to 700 would cause the
table to shrink to 500, giving us 200+500=700. The left pane doesn't affect the
linearity with which the translation occurs, but does it's speed, or slope.

I just realized, that the original table width is completely inconsequential to
the algorithm, the only thing we need to determine is the ratio of the columns
to one another (and there is a case to be made for accepting that through the
props as opposed to deriving it from the column widths on mount, which would
allow the ratios to be dynamic).

Actually let's restart: the table is full width and the margin is 10px each
way. The viewport is 1000 which gives table width of 980. The headings have
ratios of .2 to .4 to .3 to .1. The columns widths then are 196, 392, 294 ans 98.

The table change to breakpoint value calculation should _not_ be that the
relative change in the viewport size corresponds to a relative change to the
table size. This would incorrectly include the margins. Instead, we should be
aware that the margins exist (they are equivalent to the dead space we will
have with the responsive pane) and count with them.

This means the relative change to the original viewport width - 20 to the new
viewport width - 20 is the relative change to the table size. Considering an
original viewport size of 1000 and a table with two columns, both 50 % of its
width, both with a limit of 300. This means the breakpoint will happen when
the table reaches the width of 600, which will happen when the viewport width
becomes 620. So this is possible to derive from the sum of column limits.

| Title | Weight | Limit | Ratio |
| ----- | ------ | ----- | ----- |
| 1st   | 4      | 100   | 1     |
| 2nd   | 3      | 200   | 2     |
| 3rd   | 2      | 300   | 3     |
| 4th   | 1      | 400   | 4     |

| Table breakpoint | Viewport breakpoint  | Hidden columns |
| ---------------- | -------------------- | -------------- |
| 999              | 10 + 999 + 10 = 1019 | 4th            |
| 599              | 10 + 599 + 10 = 619  | 4th, 3rd       |
| 299              | 10 + 299 + 10 = 319  | 4th, 3rd, 2nd  |

- See if we need to repeat the previously hidden columns or if the mq will
  hide them cascadingly
