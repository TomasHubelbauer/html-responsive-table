import calculateBreakpoints from "./calculateBreakpoints.js";

const columns = [
  { key: 1, ratio: 0.1, limit: 50, weight: 0 },
  { key: 2, ratio: 0.2, limit: 50, weight: 3 },
  { key: 3, ratio: 0.4, limit: 75, weight: 2 },
  { key: 4, ratio: 0.3, limit: 100, weight: 1 }
];

// TODO: Derive from the columns somehow
const limit = 200;

// TODO: Generate an object like this: `{ config: string /* e.g.: 1,2,3|1,2|1| */, ranges: { breakpointStart: number; deadspaceStart: number; breakpointEnd: number; deadspaceEnd: number; }[] }`
const uniques = [];

// Note that this works for the one breakpoint (two dimension) space only as the number of dimension rises with more
const palette = ["red", "blue", "green", "yellow", "pink", "violet"];
const canvas = document.createElement("canvas");
canvas.width = limit;
canvas.height = limit;
const context = canvas.getContext("2d");

document.getElementById("test").addEventListener("click", async () => {
  document.body.replaceChild(canvas, document.getElementById("test"));

  // TODO: Generalize this to be able to play with multiple breakpoints (more dimensions) than just one
  for (let breakpoint = 0; breakpoint < limit; breakpoint++) {
    document.title = ((breakpoint / limit) * 100).toFixed(0) + "%";

    for (let deadspace = 0; deadspace < limit; deadspace++) {
      const breakpoints = [
        ...calculateBreakpoints(columns, { [breakpoint * 5]: deadspace * 5 })
      ];
      const unique = breakpoints
        .map(b =>
          b.columns
            .filter(c => c.status === "visible")
            .map(c => c.key)
            .join()
        )
        .join("|");

      let index = uniques.indexOf(unique);
      if (index === -1) {
        uniques.push(unique);
        index = uniques.length - 1;
        console.log(
          unique,
          breakpoint * 5,
          deadspace * 5,
          ((breakpoint / limit) * 100).toFixed(0) + "%"
        );
      }

      // Use 2x2 to prevent antialiasing artifacts
      // TODO: Do this using the canvas properties instead
      context.fillStyle = palette[index];
      context.fillRect(breakpoint, deadspace, 2, 2);
    }

    // Allow the main thread to redraw the canvas
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  console.log("Done.");
});
