window.addEventListener("load", () => {
  const headings = [
    { title: "#", value: i => i.id, weight: 0, limit: 50, key: "id" },
    {
      title: "First name",
      value: i => i.firstName,
      weight: 1,
      limit: 220,
      key: "firstName"
    },
    {
      title: "Last name",
      value: i => i.lastName,
      weight: 0,
      limit: 250,
      key: "lastName"
    },
    {
      title: "Email address",
      value: i => i.email,
      weight: 2,
      limit: 200,
      key: "email"
    }
  ];
  const data = [
    {
      id: 0,
      firstName: "Tom",
      lastName: "Hubelbauer",
      email: "tomas@hubelbauer.net"
    },
    { id: 1, firstName: "John", lastName: "Doe", email: "john@doe.net" },
    { id: 2, firstName: "Jane", lastName: "Doe", email: "jane@doe.net" },
    { id: 3, firstName: "Foo", lastName: "Bar", email: "foo@bar.net" },
    { id: 4, firstName: "Baz", lastName: "Quix", email: "baz@quix.net" }
  ];

  renderTable(
    document.getElementById("fullWidthTable"),
    "fullWidth",
    data,
    headings
  );

  // This one is broken ATM, see the readme
  false &&
    renderTable(
      document.getElementById("halfWidthTable"),
      "halfWidth",
      data,
      headings
    );
});

function renderTable(parentElement, key, data, headings) {
  const tableDiv = document.createElement("div");
  tableDiv.className = "table " + key;

  const headerDiv = document.createElement("div");
  headerDiv.className = "header";
  for (const heading of headings) {
    const headingDiv = document.createElement("div");
    headingDiv.className = heading.key;
    headingDiv.textContent = heading.title;
    headerDiv.append(headingDiv);
  }

  tableDiv.append(headerDiv);

  for (const item of data) {
    const rowDiv = document.createElement("div");
    for (const heading of headings) {
      const cellDiv = document.createElement("div");
      cellDiv.className = heading.key;
      cellDiv.textContent = heading.value(item);
      rowDiv.append(cellDiv);
    }

    tableDiv.append(rowDiv);
  }

  parentElement.append(tableDiv);

  let index = 0;
  for (const heading of headings) {
    heading.ratio =
      headerDiv.children[index++].clientWidth / tableDiv.clientWidth;
  }

  const breakpointStyle = document.createElement("style");
  for (const {
    breakpoint: resizedTableWidth,
    hiddenColumns
  } of calculateBreakpoints(tableDiv.clientWidth, headings)) {
    const breakpoint =
      (resizedTableWidth / tableDiv.clientWidth) * window.innerWidth;
    let mediaQuery = `/* Hide the columns ${hiddenColumns.map(
      c => c.key
    )} when the table shrinks to ${resizedTableWidth}px */\n`;
    mediaQuery += `@media (max-width: ${breakpoint}px) {\n`;
    for (const hiddenColumn of hiddenColumns) {
      mediaQuery += `  .table.${key} > div > div.${hiddenColumn.key} { display: none; } \n`;
    }

    mediaQuery += "}\n";
    breakpointStyle.textContent += mediaQuery;
  }

  parentElement.append(breakpointStyle);
}

function* calculateBreakpoints(tableWidth, tableColumns) {
  let breakpoint;
  for (
    let resizedTableWidth = tableWidth;
    resizedTableWidth > 0;
    resizedTableWidth--
  ) {
    const columns = [...tableColumns];
    let columnToRemove;
    let columnToRemoveIndex;
    do {
      // Reset these values in case the same round repeats
      columnToRemove = undefined;
      columnToRemoveIndex = undefined;

      const adjustedColumnRatioSum = columns.reduce((a, c) => a + c.ratio, 0);

      // Avoid relooping with `indexOf` by keeping track of the index in parallel with the `for`-`of` loop
      let index = 0;
      for (const column of columns) {
        const adjustedColumnRatio = column.ratio / adjustedColumnRatioSum;
        const effectiveColumnWidth = adjustedColumnRatio * resizedTableWidth;
        if (
          effectiveColumnWidth < column.limit &&
          (!columnToRemove || columnToRemove.weight > column.weight)
        ) {
          columnToRemove = column;
          columnToRemoveIndex = index;
        }

        index++;
      }

      if (columnToRemove) {
        columns.splice(columnToRemoveIndex, 1);
      }
    } while (columns.length > 0 && columnToRemove);

    const visibleColumns = columns.map(c => c.key).join();
    if (breakpoint !== visibleColumns) {
      if (columns.length < tableColumns.length) {
        yield {
          breakpoint: resizedTableWidth,
          hiddenColumns: tableColumns.filter(c => !columns.includes(c))
        };
      }

      breakpoint = visibleColumns;
    }
  }
}
