import renderTable from "./renderTable.js";
import calculateBreakpoints from "./calculateBreakpoints.js";

window.addEventListener("load", () => {
  renderTable(
    document.getElementById("debugTable"),
    "debugTable",
    [],
    [
      { title: "1st", key: "first", weight: 0, ratio: 0.1, limit: 50 },
      { title: "2nd", key: "second", weight: 3, ratio: 0.2, limit: 50 },
      { title: "3rd", key: "third", weight: 2, ratio: 0.4, limit: 75 },
      { title: "4th", key: "fourth", weight: 1, ratio: 0.3, limit: 100 }
    ],
    { left: 8 /* Body left margin */, right: 8 /* Body right margin */ }
  );

  const headings = [
    {
      title: "#",
      value: i => i.id,
      weight: 0,
      limit: 50,
      key: "id",
      ratio: 0.25
    },
    {
      title: "First name",
      value: i => i.firstName,
      weight: 1,
      limit: 220,
      key: "firstName",
      ratio: 1
    },
    {
      title: "Last name",
      value: i => i.lastName,
      weight: 0,
      limit: 250,
      key: "lastName",
      ratio: 0.5
    },
    {
      title: "Email address",
      value: i => i.email,
      weight: 2,
      limit: 200,
      key: "email",
      ratio: 1
    }
  ];
  const data = [
    { id: 0, firstName: "John", lastName: "Doe", email: "john@doe.net" },
    { id: 1, firstName: "Jane", lastName: "Doe", email: "jane@doe.net" }
  ];

  renderTable(
    document.getElementById("fullWidthTable"),
    "fullWidth",
    data,
    headings,
    { left: 8 /* Body left margin */, right: 8 /* Body right margin */ }
  );

  renderTable(
    document.getElementById("partWidthTable"),
    "partWidthTable",
    data,
    headings,
    {
      left: 600 + 8, // TODO
      right: 8 // Body right margin
    }
  );
});

// for (const breakpoint of calculateBreakpoints(
//   [
//     { title: "1st", key: "1st", weight: 4, limit: 100, ratio: 1 },
//     { title: "2nd", key: "2nd", weight: 3, limit: 200, ratio: 2 },
//     { title: "3rd", key: "3rd", weight: 2, limit: 300, ratio: 3 },
//     { title: "4th", key: "4th", weight: 1, limit: 400, ratio: 4 }
//   ],
//   { left: 610, right: 10 }
// )) {
//   console.log(breakpoint);
// }
