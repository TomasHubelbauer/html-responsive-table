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
  for (const {
    useNewVersion,
    columns,
    tableBreakpoint,
    viewportBreakpoint,
    hideColumnKey,
    showColumnKey
  } of calculateBreakpoints(headings, deadspace)) {
    if (useNewVersion) {
      let comment = `Hide ${hideColumnKey} at viewport ${viewportBreakpoint}px, table ${tableBreakpoint}px`;
      if (showColumnKey) {
        comment += ` and show ${showColumnKey} again`;
      }

      let breakpoint = `/* ${comment} */\n`;
      breakpoint += `@media (max-width: ${viewportBreakpoint}px) {\n`;
      breakpoint += `  .table.${key} > div > div.${hideColumnKey} { display: none; }\n`;
      if (showColumnKey) {
        breakpoint += `  .table.${key} > div > div.${showColumnKey} { display: initial; }\n`;
      }

      breakpoint += "}";
      breakpointStyle.textContent += breakpoint;

      const breakpointP = document.createElement("p");
      breakpointP.textContent = comment;
      tableDiv.insertAdjacentElement("beforebegin", breakpointP);
    } else {
      const comment = `viewport ${viewportBreakpoint} | table ${tableBreakpoint} | ${columns
        .map(c => c.key + " " + c.status)
        .join(" | ")}`;
      let breakpoint = `/* ${comment} */\n`;
      breakpoint += `@media (max-width: ${viewportBreakpoint}px) {\n`;
      for (const column of columns) {
        breakpoint += `  .table.${key} > div > div.${column.key} { display: ${
          column.status === "visible" ? "initial" : "none"
        }; }\n`;
      }

      breakpointStyle.textContent += breakpoint;

      const breakpointP = document.createElement("p");
      breakpointP.textContent = comment;
      tableDiv.insertAdjacentElement("beforebegin", breakpointP);
    }
  }

  tableDiv.insertAdjacentElement("beforebegin", breakpointStyle);
}
