import calculateBreakpoints from "./calculateBreakpoints.js";

export default function renderTable(
  parentElement,
  key,
  data,
  headings,
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
    tableBreakpoint,
    viewportBreakpoint,
    hideColumnKey,
    showColumnKey
  } of calculateBreakpoints(headings, deadspace)) {
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
  }

  tableDiv.insertAdjacentElement("beforebegin", breakpointStyle);
}
