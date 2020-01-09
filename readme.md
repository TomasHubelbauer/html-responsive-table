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
4. I still don't know if it is possible for a column to resurrect. I was not able to
   come up with an edge case where just the column values would cause a column to
   disappear and then reappear when removing some other column made new room for it.
   This is most likely possible to happen, but maybe only when deadspaces come into
   play?

## Test Cases

### Reappaer

Columns:

1. limit 50, ratio 1, weight 1
2. limit 100, ratio 2, weight 3
3. limit 50, ratio 3, weight 2

Deadspace:

- 700+: 300
- 600+: 200
- 500+: 100
- 400+: 0
- 300+: 100
- 200+: 200
- 100+: 300
- 0+: 400

Table fit:

- Ratio total: 1 + 2 + 3 = 6
- Column table sizes: (6 / 1) \* 50, (6 / 3) \* 100, (6 / 2) \* 50 = 350, 200, 150
- Table fit: 350
- Viewport fit: 350 + 100 (300+) = 450

## To-Do

| Key | Limit | Ratio | Priority |
| --- | ----- | ----- | -------- |
| 1   | 100   | 1     | 4        |
| 2   | 100   | 1     | 2        |
| 3   | 100   | 1     | 3        |
| 4   | 100   | 1     | 1        |

Deadspace = 0

Fit table size = 400
At 399 none of the columns fit
#4 goes
#1, #2, #3 stay
Fit table size without #4 = 300
At 299 none of the columns fit
#2 goes
#1 and #3 stay
Fit table size without #4 and #2 = 200
At 199 none of the columns fit
#3 goes
#1 stays
Fit table size without #2, #3 and #4 = 100
At 99 #1 no longer fits and #1 goes

---

| Key | Limit | Ratio | Priority |
| --- | ----- | ----- | -------- |
| 1   | 100   | 1     | 4        |
| 2   | 100   | 1     | 2        |
| 3   | 100   | 1     | 3        |
| 4   | 100   | 1     | 1        |

| Breakpoint   | Deadspace |
| ------------ | --------- |
| 0 - 200 inc. | 100       |
| +200         | 0         |

Fit table size = 400
At 399 none of the columns fit
#4 goes and leaves #1, #2 and #3
Fit table size now = 300
At 299 none of the columns fit

---

Things I need:

- Defining deadspace as an object not a function to be able to determine the breakpoints
-

## New Idea

Have a set of columns: 1, 2, 3, 4

Calculate all possible column combinations:

```js
const columns = [{ key: 1 }, { key: 2 }, { key: 3 }, { key: 4 }];

const combos = [columns];
for (let length = columns.length - 1; length > 0; length--) {
  for (let offset = 0; offset < columns.length; offset++) {
    const combo = [];
    for (let index = 0; index < length; index++) {
      combo.push(columns[(index + offset) % columns.length]);
    }

    combos.push(combo);
  }
}
```

Calculate the fit table sizes for those combinations:

```js
const columns = [
  { key: 1, ratio: 1, limit: 100 },
  { key: 2, ratio: 1, limit: 100 },
  { key: 3, ratio: 1, limit: 100 },
  { key: 4, ratio: 1, limit: 100 }
];

const combos = [];

function addCombo(columns) {
  const ratio = columns.reduce((a, c) => a + c.ratio, 0);
  const sizes = columns.map(c => (ratio / c.ratio) * c.limit);
  const table = Math.max(...sizes);
  combos.push({ combo: columns, table });
}

addCombo(columns);
for (let length = columns.length - 1; length > 0; length--) {
  for (let offset = 0; offset < columns.length; offset++) {
    const combo = [];
    for (let index = 0; index < length; index++) {
      const column = columns[(index + offset) % columns.length];
      combo.push(column);
    }

    addCombo(combo);
  }
}

for (const combo of combos) {
  console.log(combo);
}
```

Adjust all of the table sizes to viewport sizes using deadspace:

```js
const columns = [
  { key: 1, ratio: 1, limit: 100 },
  { key: 2, ratio: 1, limit: 100 },
  { key: 3, ratio: 1, limit: 100 },
  { key: 4, ratio: 1, limit: 100 }
];

const deadspace = size => {
  if (size > 300) {
    return 0;
  }

  if (size > 200) {
    return 150;
  }

  if (size > 100) {
    return 50;
  }

  return 100;
};

const combos = [];

function addCombo(columns) {
  const ratio = columns.reduce((a, c) => a + c.ratio, 0);
  const sizes = columns.map(c => (ratio / c.ratio) * c.limit);
  const table = Math.max(...sizes);
  combos.push({ columns, table, viewport: table + deadspace(table) });
}

addCombo(columns);
for (let length = columns.length - 1; length > 0; length--) {
  for (let offset = 0; offset < columns.length; offset++) {
    const combo = [];
    for (let index = 0; index < length; index++) {
      const column = columns[(index + offset) % columns.length];
      combo.push(column);
    }

    addCombo(combo);
  }
}

for (const combo of combos) {
  console.log(
    combo.columns.map(c => c.key),
    combo.table,
    combo.viewport
  );
}
```

Order the candidate breakpoints in descending order:

```js
const columns = [
  { key: 1, ratio: 1, limit: 100 },
  { key: 2, ratio: 1, limit: 100 },
  { key: 3, ratio: 1, limit: 100 },
  { key: 4, ratio: 1, limit: 100 }
];

const deadspace = size => {
  if (size > 300) {
    return 0;
  }

  if (size > 200) {
    return 150;
  }

  if (size > 100) {
    return 50;
  }

  return 100;
};

const combos = [];

function addCombo(columns) {
  const ratio = columns.reduce((a, c) => a + c.ratio, 0);
  const sizes = columns.map(c => (ratio / c.ratio) * c.limit);
  const table = Math.max(...sizes);
  combos.push({ columns, table, viewport: table + deadspace(table) });
}

addCombo(columns);
for (let length = columns.length - 1; length > 0; length--) {
  for (let offset = 0; offset < columns.length; offset++) {
    const combo = [];
    for (let index = 0; index < length; index++) {
      const column = columns[(index + offset) % columns.length];
      combo.push(column);
    }

    addCombo(combo);
  }
}

combos.sort((a, b) => b.viewport - a.viewport);

for (const combo of combos) {
  console.log(
    combo.columns.map(c => c.key),
    combo.table,
    combo.viewport
  );
}
```

Calculate the status of each column at each breakpoint.

Note that this will cause the table to break one pixel too early,
becuase it could fit all the columns at the viewport table size,
but the reason we choose to do this instead of just subtracting one
pixel from the viewport/table size value of the combo and calculating
with that is that the new viewport/table size decreased by one pixel
could already be covered by a different deadspace breakpoint resulting
in the table behaving incorrectly at runtime (deadspace breakpoint
happens but the table one doesn't).

[`calculateBreakpoints5.js`](calculateBreakpoints5.ks)

- Iterate in descending order and check states of each column
- Report columns changes from breakpoint to breakpoint
- Skip false positive breakpoints

TODO: Figure out how to deal with the multiple configs for a single
viewport breakpoint value, need to marry it up somehow with the candidate
found for removal and decide which of each to keep.

## Yet Another New Idea

We're basically racing two values: the priority and the having-reached-
the-limit. We want to be removing columns in the order of priority only,
but sometimes higher-priority columns will reach their limit and even
removing the lower-priority columns (which still fit) won't make enough
room for them so they need to go and those lower-priority columns can
still stay because there is room for them, still.

On top of this, the deadspaces have an effect on the table width which
makes it non-linear with respect to the viewport width. This might
result in breakpoints which are not successive, so there need to be two
passes, one which enumerates the column removal in the order of priority
and then possibly determines after having removed those given columns
which lower priority ones can come back because there is still room for
them and then another one which sorts and diffs these candidate breakpoints
and calculates the changes from one to the next as the viewport sizes
approaches zero.

- Calculate the fit size of the table
- Calculate the fit size of the table removing the first lowest priority column

## Final? Idea

Start with the same as v0 but instead of removing columns successively, start
with an empty set and add them as long as they fit. Add them in a priority
order which should ensure that the problem with v0 where a column which could
be saved isn't (see the static deadspace test).

We still need the breakpoints to be defined using an object and not a function,
because in order to optimize, we need to start a starting point based on the
table width and the breakpoint deadspace for that table width, so we need a
mapping in both ways, from table to viewport (the initial size) and from
viewport to table (the breakpoint size). The reason we need to iterate the
viewport size not the table size is that the viewport size remains linear
whereas the table size might skip back and forth in response to the external
breakpoints. Since we cannot invert the function to get table from viewport
programatically, we would have to either accept two functions which are the
opposite of each other (and would have to maintain them as such) or accept a
single object which can be used to derive the info in both directions, which
sounds preferable.

If this works well, it can be further optimized by thinking about how to determine
the values where a breakpoint is possible and only iterating those explicitly.
There are ideas along this line in other versions as well as in this readme.
I think it should be possible to determine this.

Since this solution iterates viewport size, the final breakpoints should not
need to be sorted before yielding because they should be guaranteed to be
linear, from wider to narrower to zero. Table-based iteration would be jumpy
based on the deadspace so _that_ would have to be sorted.

Also, use `style scoped` and instead of `key`, use `:nth-child` so that the key
doesn't have to be provided and the class name set on the head and body cells.

Maybe this is the final algo:

TODO: Finalize this (v6) and ditch the others.

## To-Do

### Clean the entire document to remove historical bits

### Package the final version as an ESM module and host using GitHub Pages

As to have a URL with the correct MIME. Add installation instructions to the
readme.
