import calculateBreakpoints from "./calculateBreakpoints.js";

export default function renderTable(
  parentElement,
  key,
  data,
  headings,
  deadspace,
  overrideViewport
) {
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

  parentElement.replaceWith(tableDiv);

  // TODO: Accept these in props?
  let index = 0;
  for (const heading of headings) {
    heading.ratio =
      headerDiv.children[index++].clientWidth / tableDiv.clientWidth;
  }

  const breakpointStyle = document.createElement("style");
  for (const {
    tableBreakpoint,
    viewportBreakpoint,
    hideColumnKey,
    showColumnKey
  } of calculateBreakpoints(headings, deadspace, overrideViewport)) {
    let comment = `Hide ${hideColumnKey} at viewport ${viewportBreakpoint}px, table ${tableBreakpoint}px`;
    if (showColumnKey) {
      comment += ` and show ${showColumnKey} again`;
    }

    let breakpoint = `/* ${comment} */\n`;
    breakpoint += `@media (max-width: ${viewportBreakpoint}px) {\n`;
    breakpoint += `  .table.${key} > div > div.${hideColumnKey} { display: none; }\n`;
    if (showColumnKey) {
      breakpoint += `  .table.${key} > div > div.${hideColumnKey} { display: initial; }\n`;
    }

    breakpoint += "}";
    breakpointStyle.textContent += breakpoint;

    const breakpointP = document.createElement("p");
    breakpointP.textContent = comment;
    tableDiv.insertAdjacentElement("beforebegin", breakpointP);
  }

  tableDiv.insertAdjacentElement("beforebegin", breakpointStyle);
}
