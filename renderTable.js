import calculateBreakpoints from "./calculateBreakpoints.js";

export default function renderTable(
  /** @type {HTMLElement} */
  parentElement,
  /** @type {string} */
  key,
  /** @type {any[]} */
  data,
  /** @type {Column[]} */
  headings,
  /** @type {Deadspace} */
  deadspace
) {
  const tableDiv = document.createElement("div");
  tableDiv.className = "table " + key;

  const headerDiv = document.createElement("div");
  headerDiv.className = "header";
  for (const heading of headings) {
    const headingDiv = document.createElement("div");
    headingDiv.className = heading.key;
    headingDiv.innerHTML = `${heading.title}<br/>${heading.limit}px<br/>${heading.weight}`;
    headingDiv.style.flex = heading.ratio;
    headerDiv.append(headingDiv);
  }

  tableDiv.append(headerDiv);

  for (const item of data) {
    const rowDiv = document.createElement("div");
    for (const heading of headings) {
      const cellDiv = document.createElement("div");
      cellDiv.className = heading.key;
      cellDiv.textContent = heading.value(item);
      cellDiv.style.flex = heading.ratio;
      rowDiv.append(cellDiv);
    }

    tableDiv.append(rowDiv);
  }

  parentElement.replaceWith(tableDiv);

  const breakpointStyle = document.createElement("style");
  for (const breakpoint of calculateBreakpoints(headings, deadspace)) {
    switch (breakpoint.version) {
      case 0: {
        const comment = `viewport ${breakpoint.viewportBreakpoint} | table ${
          breakpoint.tableBreakpoint
        } | ${breakpoint.columns.map(c => c.key + " " + c.status).join(" | ")}`;
        let mediaQuery = `/* ${comment} */\n`;
        mediaQuery += `@media (max-width: ${breakpoint.viewportBreakpoint}px) {\n`;
        for (const column of breakpoint.columns) {
          mediaQuery += `  .table.${key} > div > div.${column.key} { display: ${
            column.status === "visible" ? "initial" : "none"
          }; }\n`;
        }

        breakpointStyle.textContent += mediaQuery;

        const breakpointP = document.createElement("p");
        breakpointP.textContent = comment;
        tableDiv.insertAdjacentElement("beforebegin", breakpointP);
        break;
      }
      case 1: {
        let comment = `Hide ${breakpoint.hideColumnKey} at viewport ${breakpoint.viewportBreakpoint}px, table ${breakpoint.tableBreakpoint}px`;
        if (breakpoint.showColumnKey) {
          comment += ` and show ${breakpoint.showColumnKey} again`;
        }

        let mediaQuery = `/* ${comment} */\n`;
        mediaQuery += `@media (max-width: ${breakpoint.viewportBreakpoint}px) {\n`;
        mediaQuery += `  .table.${key} > div > div.${breakpoint.hideColumnKey} { display: none; }\n`;
        if (breakpoint.showColumnKey) {
          mediaQuery += `  .table.${key} > div > div.${breakpoint.showColumnKey} { display: initial; }\n`;
        }

        mediaQuery += "}";
        breakpointStyle.textContent += mediaQuery;

        const breakpointP = document.createElement("p");
        breakpointP.textContent = comment;
        tableDiv.insertAdjacentElement("beforebegin", breakpointP);
        break;
      }
      case 2: {
        let comment = `Hide ${breakpoint.hideColumnKey} at viewport ${breakpoint.viewportBreakpoint}px, table ${breakpoint.tableBreakpoint}px`;
        if (breakpoint.showColumnKey) {
          comment += ` and show ${breakpoint.showColumnKey} again`;
        }

        let mediaQuery = `/* ${comment} */\n`;
        mediaQuery += `@media (max-width: ${breakpoint.viewportBreakpoint}px) {\n`;
        mediaQuery += `  .table.${key} > div > div.${breakpoint.hideColumnKey} { display: none; }\n`;
        if (breakpoint.showColumnKey) {
          mediaQuery += `  .table.${key} > div > div.${breakpoint.showColumnKey} { display: initial; }\n`;
        }

        mediaQuery += "}";
        breakpointStyle.textContent += mediaQuery;

        const breakpointP = document.createElement("p");
        breakpointP.textContent = comment;
        tableDiv.insertAdjacentElement("beforebegin", breakpointP);
        break;
      }
      case 3: {
        const comment = `Hide ${breakpoint.columnKey} at viewport ${breakpoint.viewportBreakpoint}px, table ${breakpoint.tableBreakpoint}px`;
        breakpointStyle.textContent += `
/* ${comment} */
@media (max-width: ${breakpoint.viewportBreakpoint}px) {
  .table.${key} > div > div.${breakpoint.columnKey} { display: none; }
}
`;

        const breakpointP = document.createElement("p");
        breakpointP.textContent = comment;
        tableDiv.insertAdjacentElement("beforebegin", breakpointP);
        break;
      }
    }
  }

  tableDiv.insertAdjacentElement("beforebegin", breakpointStyle);
}
