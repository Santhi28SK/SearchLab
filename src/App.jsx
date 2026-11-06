
import { useState } from "react";
import "./App.css";

const nodes = [
  { id: "A", x: 80, y: 210 },
  { id: "B", x: 230, y: 85 },
  { id: "C", x: 230, y: 335 },
  { id: "D", x: 420, y: 185 },
  { id: "E", x: 620, y: 85 },
  { id: "F", x: 420, y: 365 },
  { id: "G", x: 620, y: 300 },
  { id: "H", x: 810, y: 190 },
];

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
  ["G", "H", 1],
];

function createInitialState(start) {
  return {
    queue: [{ node: start, cost: 0, path: [start] }],
    costs: { [start]: 0 },
    parents: {},
    expanded: [],
    current: null,
    path: [],
    status: "running",
    message: `Search started from node ${start}. The priority queue contains the starting node with cost 0.`,
    step: 0,
  };
}

function executeOneStep(state, goal) {
  if (state.status !== "running") return state;

  const queue = [...state.queue].sort((a, b) => a.cost - b.cost);
  const expanded = [...state.expanded];

  while (queue.length > 0) {
    const current = queue.shift();

    // Ignore outdated or already-expanded entries.
    if (current.cost !== state.costs[current.node]) continue;
    if (expanded.includes(current.node)) continue;

    expanded.push(current.node);

    if (current.node === goal) {
      return {
        ...state,
        queue,
        expanded,
        current: current.node,
        path: current.path,
        status: "found",
        step: state.step + 1,
        message: `Goal ${goal} reached! Its minimum path cost is ${current.cost}.`,
      };
    }

    const costs = { ...state.costs };
    const parents = { ...state.parents };

    for (const [a, b, weight] of edges) {
      let neighbor = null;

      if (a === current.node) neighbor = b;
      if (b === current.node) neighbor = a;

      if (!neighbor || expanded.includes(neighbor)) continue;

      const newCost = current.cost + weight;

      if (costs[neighbor] === undefined || newCost < costs[neighbor]) {
        costs[neighbor] = newCost;
        parents[neighbor] = current.node;

        queue.push({
          node: neighbor,
          cost: newCost,
          path: [...current.path, neighbor],
        });
      }
    }

    queue.sort((a, b) => a.cost - b.cost);

    return {
      ...state,
      queue,
      costs,
      parents,
      expanded,
      current: current.node,
      path: [],
      step: state.step + 1,
      message: `Expanded ${current.node} at cumulative cost ${current.cost}. Its neighbours have been checked and the priority queue has been updated.`,
    };
  }

  return {
    ...state,
    queue: [],
    expanded,
    current: null,
    status: "failed",
    step: state.step + 1,
    message: "The priority queue is empty. No path to the goal exists.",
  };
}

function App() {
  const [start, setStart] = useState("A");
  const [goal, setGoal] = useState("D");
  const [search, setSearch] = useState(() => createInitialState("A"));

  const resetSearch = (newStart = start, newGoal = goal) => {
    setStart(newStart);
    setGoal(newGoal);
    setSearch(createInitialState(newStart));
  };

  const nextStep = () => {
    setSearch((previous) => executeOneStep(previous, goal));
  };

  const runAll = () => {
    setSearch((previous) => {
      let result = previous;
      let safety = 0;

      while (result.status === "running" && safety < 30) {
        result = executeOneStep(result, goal);
        safety++;
      }

      return result;
    });
  };

  const pathSet = new Set(search.path);
  const expandedSet = new Set(search.expanded);

  return (
    <div className="app">
      <header className="top-header">
        <div>
          <p className="eyebrow">SEARCHLAB / LEVEL 03</p>
          <h1>Interactive UCS</h1>
          <p className="subtitle">
            Learn how Uniform Cost Search explores a weighted graph.
          </p>
        </div>
        <div className="level-label">Level 3 · Step-by-step</div>
      </header>

      <section className="control-bar">
        <div className="select-group">
          <label>
            Start node
            <select
              value={start}
              onChange={(e) => resetSearch(e.target.value, goal)}
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.id}
                </option>
              ))}
            </select>
          </label>

          <label>
            Goal node
            <select
              value={goal}
              onChange={(e) => resetSearch(start, e.target.value)}
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.id}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="action-buttons">
          <button
            className="primary-button"
            onClick={nextStep}
            disabled={search.status !== "running"}
          >
            Next Step →
          </button>
          <button
            className="secondary-button"
            onClick={runAll}
            disabled={search.status !== "running"}
          >
            Run All
          </button>
          <button
            className="reset-button"
            onClick={() => resetSearch()}
          >
            Reset
          </button>
        </div>
      </section>

      <main className="workspace">
        <section className="graph-panel">
          <div className="panel-heading">
            <div>
              <h2>Weighted Graph</h2>
              <p>Watch nodes change as UCS progresses.</p>
            </div>
            <span className="step-counter">Step {search.step}</span>
          </div>

          <div className="graph-container">
            <svg viewBox="0 0 900 440" className="graph-svg">
              {edges.map(([a, b, weight]) => {
                const first = nodes.find((n) => n.id === a);
                const second = nodes.find((n) => n.id === b);
                const isPath =
                  pathSet.has(a) &&
                  pathSet.has(b) &&
                  search.path.indexOf(b) === search.path.indexOf(a) + 1 ||
                  pathSet.has(a) &&
                  pathSet.has(b) &&
                  search.path.indexOf(a) === search.path.indexOf(b) + 1;

                return (
                  <g key={`${a}-${b}`}>
                    <line
                      x1={first.x}
                      y1={first.y}
                      x2={second.x}
                      y2={second.y}
                      className={isPath ? "edge path-edge" : "edge"}
                    />
                    <rect
                      x={(first.x + second.x) / 2 - 13}
                      y={(first.y + second.y) / 2 - 12}
                      width="26"
                      height="23"
                      rx="6"
                      className="weight-box"
                    />
                    <text
                      x={(first.x + second.x) / 2}
                      y={(first.y + second.y) / 2 + 4}
                      textAnchor="middle"
                      className="weight-text"
                    >
                      {weight}
                    </text>
                  </g>
                );
              })}

              {nodes.map((node) => {
                const isStart = node.id === start;
                const isGoal = node.id === goal;
                const isCurrent = search.current === node.id;
                const isExpanded = expandedSet.has(node.id);

                let className = "graph-node";
                if (isExpanded) className += " expanded-node";
                if (isCurrent) className += " current-node";
                if (isStart) className += " start-node";
                if (isGoal) className += " goal-node";
                if (pathSet.has(node.id)) className += " path-node";

                return (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="24"
                      className={className}
                    />
                    <text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor="middle"
                      className="node-text"
                    >
                      {node.id}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 43}
                      textAnchor="middle"
                      className="node-cost"
                    >
                      {search.costs[node.id] !== undefined
                        ? `Cost: ${search.costs[node.id]}`
                        : "Not reached"}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="legend">
            <span><i className="legend-dot start-dot" /> Start</span>
            <span><i className="legend-dot expanded-dot" /> Expanded</span>
            <span><i className="legend-dot current-dot" /> Current</span>
            <span><i className="legend-dot goal-dot" /> Goal</span>
          </div>
        </section>

        <aside className="side-panel">
          <section className="info-card">
            <h2>Priority Queue</h2>
            <p className="card-description">
              Nodes waiting to be explored, ordered by lowest cost.
            </p>

            {search.queue.length === 0 ? (
              <p className="empty-message">Queue is empty.</p>
            ) : (
              <div className="queue-list">
                {[...search.queue]
                  .sort((a, b) => a.cost - b.cost)
                  .map((item, index) => (
                    <div className="queue-item" key={`${item.node}-${index}`}>
                      <span className="queue-position">{index + 1}</span>
                      <strong>{item.node}</strong>
                      <span className="queue-cost">Cost: {item.cost}</span>
                    </div>
                  ))}
              </div>
            )}
          </section>

          <section className="info-card">
            <h2>Expansion Order</h2>
            <p className="card-description">
              Nodes already removed from the queue.
            </p>
            <div className="expanded-list">
              {search.expanded.length === 0 ? (
                <span className="empty-message">No nodes expanded yet.</span>
              ) : (
                search.expanded.map((node, index) => (
                  <span className="expanded-chip" key={`${node}-${index}`}>
                    {node}
                  </span>
                ))
              )}
            </div>
          </section>

          <section className="info-card">
            <h2>Current Step</h2>
            <div className="current-node-display">
              {search.current || "—"}
            </div>
            <p className="card-description">
              {search.current
                ? `Current node: ${search.current}`
                : "Press Next Step to begin exploring."}
            </p>
          </section>
        </aside>
      </main>

      <section className="bottom-section">
        <div className="explanation-card">
          <h2>What's happening?</h2>
          <p>{search.message}</p>
        </div>

        {search.status === "found" && (
          <div className="result-card">
            <h2>Optimal Path Found!</h2>
            <p className="final-path">{search.path.join(" → ")}</p>
            <p>
              Total Cost:{" "}
              <strong>{search.costs[goal]}</strong>
            </p>
          </div>
        )}

        {search.status === "failed" && (
          <div className="result-card">
            <h2>No path found</h2>
            <p>Try selecting another start or goal node.</p>
          </div>
        )}
      </section>

      <footer className="footer">
        SEARCHLAB · Learn by exploring, experimenting and understanding.
      </footer>
    </div>
  );
}

export default App;
