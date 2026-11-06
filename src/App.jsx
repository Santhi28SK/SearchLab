
import { useMemo, useState } from "react";
import "./App.css";

const initialNodes = [
  { id: "A", x: 80, y: 210 },
  { id: "B", x: 230, y: 85 },
  { id: "C", x: 230, y: 335 },
  { id: "D", x: 420, y: 185 },
  { id: "E", x: 620, y: 85 },
  { id: "F", x: 420, y: 365 },
  { id: "G", x: 620, y: 300 },
  { id: "H", x: 810, y: 190 },
];

const initialEdges = [
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
  ["G", "H", 1],
];

function getAllPaths(start, goal) {
  const graph = {};

  initialNodes.forEach((node) => {
    graph[node.id] = [];
  });

  initialEdges.forEach(([from, to, weight]) => {
    graph[from].push({ node: to, weight });
    graph[to].push({ node: from, weight });
  });

  const results = [];

  function dfs(current, visited, path, cost) {
    if (current === goal) {
      results.push({ path, cost });
      return;
    }

    graph[current].forEach((neighbor) => {
      if (!visited.has(neighbor.node)) {
        const nextVisited = new Set(visited);
        nextVisited.add(neighbor.node);

        dfs(
          neighbor.node,
          nextVisited,
          [...path, neighbor.node],
          cost + neighbor.weight
        );
      }
    });
  }

  dfs(start, new Set([start]), [start], 0);

  return results.sort(
    (a, b) => a.cost - b.cost || a.path.length - b.path.length
  );
}

function runUCS(start, goal) {
  const graph = {};

  initialNodes.forEach((node) => {
    graph[node.id] = [];
  });

  initialEdges.forEach(([from, to, weight]) => {
    graph[from].push({ node: to, weight });
    graph[to].push({ node: from, weight });
  });

  const queue = [{ node: start, cost: 0, path: [start] }];
  const bestCost = { [start]: 0 };
  const expanded = [];

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift();

    if (current.cost > bestCost[current.node]) continue;

    expanded.push(current.node);

    if (current.node === goal) {
      return {
        path: current.path,
        cost: current.cost,
        expanded,
      };
    }

    graph[current.node].forEach(({ node, weight }) => {
      const newCost = current.cost + weight;

      if (bestCost[node] === undefined || newCost < bestCost[node]) {
        bestCost[node] = newCost;

        queue.push({
          node,
          cost: newCost,
          path: [...current.path, node],
        });
      }
    });
  }

  return null;
}

function App() {
  const [start, setStart] = useState("A");
  const [goal, setGoal] = useState("D");
  const [selectedPath, setSelectedPath] = useState(0);
  const [ucsResult, setUcsResult] = useState(null);

  const paths = useMemo(
    () => getAllPaths(start, goal),
    [start, goal]
  );

  const optimalCost = paths.length > 0 ? paths[0].cost : null;

  const optimalPaths = paths.filter(
    (path) => path.cost === optimalCost
  );

  const activePath = paths[selectedPath] || null;

  function changeStart(value) {
    setStart(value);
    setSelectedPath(0);
    setUcsResult(null);
  }

  function changeGoal(value) {
    setGoal(value);
    setSelectedPath(0);
    setUcsResult(null);
  }

  function resetExplorer() {
    setStart("A");
    setGoal("D");
    setSelectedPath(0);
    setUcsResult(null);
  }

  const highlightedNodes = activePath?.path || [];
  const highlightedEdges = [];

  for (let i = 0; i < highlightedNodes.length - 1; i++) {
    highlightedEdges.push([
      highlightedNodes[i],
      highlightedNodes[i + 1],
    ]);
  }

  const ucsNodes = ucsResult?.path || [];

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">SEARCHLAB </p>
          <h1>Path Explorer</h1>
          <p className="subtitle">
            Explore routes, compare costs, and discover how
            Uniform Cost Search finds the cheapest path.
          </p>
        </div>
        <div className="level-tag">LEVEL 02</div>
      </header>

      <main>
        <section className="controls panel">
          <div>
            <label htmlFor="start">Starting node</label>
            <select
              id="start"
              value={start}
              onChange={(e) => changeStart(e.target.value)}
            >
              {initialNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  Node {node.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="goal">Destination node</label>
            <select
              id="goal"
              value={goal}
              onChange={(e) => changeGoal(e.target.value)}
            >
              {initialNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  Node {node.id}
                </option>
              ))}
            </select>
          </div>

          <button className="primary-button" onClick={() => {
            setUcsResult(runUCS(start, goal));
          }}>
            Run UCS
          </button>

          <button className="reset-button" onClick={resetExplorer}>
            Reset
          </button>
        </section>

        <section className="graph-section panel">
          <div className="section-heading">
            <div>
              <h2>Weighted graph</h2>
              <p>Select a route below to highlight it on the graph.</p>
            </div>
            <span className="graph-count">8 Nodes · 12 Edges</span>
          </div>

          <div className="graph-scroll">
            <svg
              className="graph"
              viewBox="0 0 900 440"
              role="img"
              aria-label="Weighted graph with nodes A through H"
            >
              {initialEdges.map(([from, to, weight]) => {
                const a = initialNodes.find((n) => n.id === from);
                const b = initialNodes.find((n) => n.id === to);

                const isHighlighted = highlightedEdges.some(
                  ([x, y]) =>
                    (x === from && y === to) ||
                    (x === to && y === from)
                );

                const isUcsEdge = ucsNodes.some(
                  (node, i) =>
                    i < ucsNodes.length - 1 &&
                    ((node === from && ucsNodes[i + 1] === to) ||
                     (node === to && ucsNodes[i + 1] === from))
                );

                return (
                  <g key={`${from}-${to}`}>
                    <line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      className={
                        isUcsEdge
                          ? "edge ucs-edge"
                          : isHighlighted
                          ? "edge active-edge"
                          : "edge"
                      }
                    />
                    <rect
                      x={(a.x + b.x) / 2 - 16}
                      y={(a.y + b.y) / 2 - 12}
                      width="32"
                      height="24"
                      rx="6"
                      className="weight-bg"
                    />
                    <text
                      x={(a.x + b.x) / 2}
                      y={(a.y + b.y) / 2 + 5}
                      textAnchor="middle"
                      className="weight-label"
                    >
                      {weight}
                    </text>
                  </g>
                );
              })}

              {initialNodes.map((node) => {
                const isActive = highlightedNodes.includes(node.id);
                const isUcs = ucsNodes.includes(node.id);

                return (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="24"
                      className={
                        isUcs
                          ? "node-circle ucs-node"
                          : isActive
                          ? "node-circle active-node"
                          : node.id === start
                          ? "node-circle start-node"
                          : node.id === goal
                          ? "node-circle goal-node"
                          : "node-circle"
                      }
                    />
                    <text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor="middle"
                      className="node-label"
                    >
                      {node.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="legend">
            <span><i className="legend-start" /> Start</span>
            <span><i className="legend-goal" /> Goal</span>
            <span><i className="legend-active" /> Selected path</span>
            <span><i className="legend-ucs" /> UCS result</span>
          </div>
        </section>

        <section className="results-grid">
          <div className="panel paths-panel">
            <div className="section-heading">
              <div>
                <h2>Possible paths</h2>
                <p>
                  {start} to {goal} · Simple paths without repeated nodes
                </p>
              </div>
              <span className="count-badge">{paths.length}</span>
            </div>

            {paths.length === 0 ? (
              <div className="empty-state">
                No path exists between these nodes.
              </div>
            ) : (
              <div className="path-list">
                {paths.map((item, index) => {
                  const isOptimal = item.cost === optimalCost;

                  return (
                    <button
                      key={`${item.path.join("-")}-${index}`}
                      className={`path-item ${
                        selectedPath === index ? "selected-path" : ""
                      }`}
                      onClick={() => setSelectedPath(index)}
                    >
                      <div className="path-main">
                        <span className="path-number">
                          Path {index + 1}
                        </span>
                        <span className="path-nodes">
                          {item.path.join(" → ")}
                        </span>
                      </div>

                      <div className="path-right">
                        {isOptimal && (
                          <span className="optimal-label">Optimal</span>
                        )}
                        <strong>Cost: {item.cost}</strong>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="panel detail-panel">
            <h2>Path details</h2>

            {activePath ? (
              <>
                <p className="detail-caption">Selected route</p>
                <div className="large-route">
                  {activePath.path.join(" → ")}
                </div>

                <div className="cost-card">
                  <span>Total path cost</span>
                  <strong>{activePath.cost}</strong>
                </div>

                <div className="detail-info">
                  <p>
                    <strong>Number of edges:</strong>{" "}
                    {activePath.path.length - 1}
                  </p>
                  <p>
                    <strong>Optimal route:</strong>{" "}
                    {activePath.cost === optimalCost ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Optimal paths found:</strong>{" "}
                    {optimalPaths.length}
                  </p>
                </div>

                <p className="explanation">
                  {activePath.cost === optimalCost
                    ? "This route has the lowest total cost among all possible simple paths."
                    : `This route costs ${activePath.cost - optimalCost} more than the cheapest route.`}
                </p>
              </>
            ) : (
              <p className="empty-state">Select a valid route to see its details.</p>
            )}
          </div>
        </section>

        <section className="panel ucs-panel">
          <div className="section-heading">
            <div>
              <h2>Uniform Cost Search</h2>
              <p>
                Run UCS to find an optimal route using cumulative path costs.
              </p>
            </div>
            <span className="ucs-tag">Algorithm</span>
          </div>

          {!ucsResult ? (
            <div className="ucs-placeholder">
              <p>
                Ready to explore? Press <strong>Run UCS</strong> to calculate
                the optimal path from {start} to {goal}.
              </p>
            </div>
          ) : (
            <div className="ucs-result">
              <div>
                <p className="detail-caption">UCS optimal path</p>
                <div className="large-route">
                  {ucsResult.path.join(" → ")}
                </div>
              </div>
              <div className="cost-card">
                <span>Minimum cost</span>
                <strong>{ucsResult.cost}</strong>
              </div>
              <div className="detail-info">
                <p>
                  <strong>Expansion order:</strong>{" "}
                  {ucsResult.expanded.join(" → ")}
                </p>
                <p>
                  <strong>Optimal paths:</strong> {optimalPaths.length}
                </p>
              </div>
            </div>
          )}

          <div className="learning-note">
            <strong>Remember:</strong> The Path Explorer lists all simple
            paths for comparison. UCS does not need to enumerate every path.
            It expands the lowest cumulative-cost node first.
          </div>
        </section>
      </main>

      <footer>
        SEARCHLAB · LEARN BY EXPLORING
      </footer>
    </div>
  );
}

export default App;
