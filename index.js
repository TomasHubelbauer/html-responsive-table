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
    { left: 8 /* Body left margin */, right: 8 /* Body right margin */ },
    500
  );

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
    headings,
    { left: 8 /* Body left margin */, right: 8 /* Body right margin */ }
  );

  renderTable(
    document.getElementById("partWidthTable"),
    "partWidthTable",
    data,
    headings,
    {
      left: 0, // TODO
      right: 8 // Body right margin
    }
  );
});
