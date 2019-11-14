import renderTable from "./renderTable.js";

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
    16 // Body margin
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
    16 // Body margin
  );

  renderTable(
    document.getElementById("partWidthTable"),
    "partWidthTable",
    data,
    headings,
    {
      600: 16, // No pane, just body margin
      800: 16 + 250, // Narrow pane and body margin
      1000: 16 + 400, // Middle pane and body margin
      _: 16 + 600 // Wide pane and body margin
    }
  );
});
