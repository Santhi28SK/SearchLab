
import { useState } from "react";
import "./App.css";

const nodes = ["A", "B", "C", "D", "E", "F", "G", "H"];

const positions = {
  A: [80, 220],
  B: [240, 100],
  C: [240, 340],
  D: [420, 180],
  E: [600, 100],
  F: [420, 390],
  G: [620, 300],
  H: [800, 200]
};

const edges = [
  ["A", "B", 2],
  ["A", "C", 4],
  ["B", "D", 3],
  ["B", "E", 7],
  ["C", "D", 1],
  ["C", "F", 5],
  ["D", "E", 2],
  ["D", "G", 6],
  ["D", "F", 4],
  ["E", "H", 3],
  ["F", "G", 2],
  ["G", "H", 1]
];

function findPath(start, goal) {
  const graph = Object.fromEntries(
    nodes.map(node => [node, []])
  );

  edges.forEach(([a, b, cost]) => {
    graph[a].push({ node: b, cost });
    graph[b].push({ node: a, cost });
  });

  const queue = [{ node: start, cost: 0 }];
  const bestCost = { [start]: 0 };
  const parent = {};
  const visited = [];

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);

    const current = queue.shift();

    if (current.cost !== bestCost[current.node]) continue;

    if (visited.includes(current.node)) continue;
    visited.push(current.node);

    if (current.node === goal) {
      const path = [];
      let node = goal;

      while (node !== undefined) {
        path.unshift(node);
        node = parent[node];
      }

      return {
        path,
        cost: current.cost,
        visited
      };
    }

    graph[current.node].forEach(edge => {
      const newCost = current.cost + edge.cost;

      if (
        bestCost[edge.node] === undefined ||
        newCost < bestCost[edge.node]
      ) {
        bestCost[edge.node] = newCost;
        parent[edge.node] = current.node;

        queue.push({
          node: edge.node,
          cost: newCost
        });
      }
    });
  }

  return null;
}

export default function App() {
  const [start, setStart] = useState("A");
  const [goal, setGoal] = useState("H");
  const [result, setResult] = useState(null);

  function runSearch() {
    setResult(findPath(start, goal));
  }

  function isPathEdge(a, b) {
    if (!result) return false;

    return result.path.some(
      (node, index) =>
        index < result.path.length - 1 &&
        node === a &&
        result.path[index + 1] === b
    ) || result.path.some(
      (node, index) =>
        index < result.path.length - 1 &&
        node === b &&
        result.path[index + 1] === a
    );
  }

  return (
    <main className="app">
      <header>
        <h1>SearchLab</h1>
        <p>Learn Uniform Cost Search through experimentation</p>
      </header>

      <section className="intro">
        <h2>Uniform Cost Search</h2>
        <p>
          Find the least-cost path from a starting node to a
          goal node. UCS always expands the available path
          with the lowest total cost.
        </p>
      </section>

      <section className="workspace">
        <div className="graph-panel">
          <h2>Weighted Graph</h2>

          <svg
            viewBox="0 0 880 480"
            className="graph"
          >
            {edges.map(([a, b, cost]) => {
              const [x1, y1] = positions[a];
              const [x2, y2] = positions[b];
              const active = isPathEdge(a, b);

              return (
                <g key={`${a}-${b}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={active ? "#16a34a" : "#64748b"}
                    strokeWidth={active ? 4 : 2}
                  />

                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 10}
                    className="weight"
                  >
                    {cost}
                  </text>
                </g>
              );
            })}

            {nodes.map(node => {
              const [x, y] = positions[node];

              const fill =
                node === start
                  ? "#2563eb"
                  : node === goal
                  ? "#16a34a"
                  : "#475569";

              return (
                <g key={node}>
                  <circle
                    cx={x}
                    cy={y}
                    r="25"
                    fill={fill}
                  />
                  <text
                    x={x}
                    y={y + 5}
                    className="node-label"
                  >
                    {node}
                  </text>
                </g>
              );
            })}
          </svg>

          <p className="hint">
            Blue: Start node | Green: Goal node
          </p>

          <p className="hint">
            Total nodes: 8 | Total edges: 12
          </p>
        </div>

        <div className="controls">
          <h2>Search Controls</h2>

          <label>Starting Node</label>
          <select
            value={start}
            onChange={e => {
              setStart(e.target.value);
              setResult(null);
            }}
          >
            {nodes.map(node => (
              <option key={node} value={node}>
                {node}
              </option>
            ))}
          </select>

          <label>Goal Node</label>
          <select
            value={goal}
            onChange={e => {
              setGoal(e.target.value);
              setResult(null);
            }}
          >
            {nodes.map(node => (
              <option key={node} value={node}>
                {node}
              </option>
            ))}
          </select>

          <button onClick={runSearch}>
            Run UCS
          </button>

          <button
            className="reset"
            onClick={() => setResult(null)}
          >
            Reset
          </button>

          {result && (
            <div className="result">
              <h3>Search Result</h3>
              <p>Path: {result.path.join(" → ")}</p>
              <p>Total Cost: {result.cost}</p>
              <p>Expanded nodes: {result.visited.join(", ")}</p>
            </div>
          )}

          {!result && (
            <p className="hint">
              Choose your start and goal nodes and run UCS.
            </p>
          )}
        </div>
      </section>

      <footer>
        SearchLab | Foundations of Artificial Intelligence
      </footer>
    </main>
  );
}
