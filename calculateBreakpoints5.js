function* getBreakpoints(columns, deadspaces) {
  const combos = [];

  function addCombo(columns) {
    const ratio = columns.reduce((a, c) => a + c.ratio, 0);
    const sizes = columns.map(c => (ratio / c.ratio) * c.limit);
    const table = Math.max(...sizes);
    const deadspace = deadspaces(table);
    const viewport = table + deadspace;
    combos.push({ columns, viewport, table, deadspace });
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

  function reportBreakpoint(combo, candidate) {
    const ratio = combo.columns.reduce((a, c) => a + c.ratio, 0);
    const sizes = combo.columns.map(c => (c.ratio / ratio) * combo.table);
    const columns = combo.columns.map((c, i) => {
      const state = c !== candidate;
      return { ...c, size: sizes[i], state };
    });

    // TODO: Calculate and report the state changes
    return { ...combo, columns, candidate };
  }

  for (const combo of combos) {
    const ratio = combo.columns.reduce((a, c) => a + c.ratio, 0);
    const sizes = combo.columns.map(c => (ratio / c.ratio) * c.limit);
    const table = Math.max(...sizes);

    // Find the columns which are at their limit making them candidates for removal
    let candidates = combo.columns.filter((_, i) => sizes[i] === table);

    if (candidates.length === 0) {
      throw new Error("There must be candidates at a breakpoint.");
    }

    // Strip columns which are at their limit except those with the lowest priority
    else if (candidates.length > 0) {
      const baseline = Math.min(...candidates.map(c => c.priority));
      candidates = candidates.filter(c => c.priority === baseline);
    }

    const baseline = Math.min(...combo.columns.map(c => c.priority));
    if (candidates.length === 1) {
      const [candidate] = candidates;

      // See if we can remove TODO
      const alternatives = candidates
        .filter(c => c.priority <= candidate.priority && c !== candidate)
        .sort((a, b) => a.priority - b.priority);
      let foundAlternative = false;
      for (const alternative of alternatives) {
        debugger;
      }

      if (!foundAlternative) {
      }

      if (candidate.priority === baseline) {
        yield reportBreakpoint(combo, candidate);
      } else {
        // TODO: Scan the non-candidate lower priority columns in ascending priority
        // order and see if removing any one makes room for this higher priority
        // candidate to stay and if found drop that one instead
        debugger;
        throw new Error(
          "Saving higher priority columns is not implemented yet."
        );
      }
    } else {
      const [candidate] = candidates;

      if (!candidates.every(c => c.priority === candidate.priority)) {
        throw new Error("All candidates must have the same priority.");
      }

      debugger;
      if (candidate.priority === baseline) {
        yield reportBreakpoint(combo, candidate, sizes);
      } else {
        // TODO: Scan the non-candidate lower priority columns in ascending priority
        // order and see if removing any one makes room for these higher priority
        // candidates to stay and if found drop that one instead
        throw new Error(
          "Saving higher priority columns is not implemented yet."
        );
      }
    }
  }
}

for (const { columns, viewport, table, deadspace, candidate } of getBreakpoints(
  [
    { key: 1, ratio: 1, limit: 100, priority: 4 },
    { key: 2, ratio: 1, limit: 120, priority: 2 },
    { key: 3, ratio: 1, limit: 110, priority: 3 },
    { key: 4, ratio: 1, limit: 90, priority: 1 }
  ],
  size => {
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
  }
)) {
  console.log(
    "viewport",
    viewport,
    "table",
    table,
    "deadspace",
    deadspace,
    "columns",
    columns
      .map(c => {
        const state = c.state ? "show" : "hide";
        const size = c.size ? `${c.size}px/${c.limit}px` : `${c.limit}px`;
        return `${c.key} (${state}, ${c.priority}*, ${size})`;
      })
      .join(", "),
    candidate
  );
}
