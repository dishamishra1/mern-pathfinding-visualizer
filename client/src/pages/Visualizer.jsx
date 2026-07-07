import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const ROWS = 18;
const COLS = 28;
const initialStart = { row: 4, col: 4 };
const initialTarget = { row: 13, col: 22 };

function makeGrid() {
  return Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => ({
      row, col, isWall: false, visited: false, distance: Infinity, previous: null, state: ""
    }))
  );
}

function Visualizer() {
  const { user, logout } = useAuth();
  const [grid, setGrid] = useState(makeGrid);
  const [start, setStart] = useState(initialStart);
  const [target, setTarget] = useState(initialTarget);
  const [mode, setMode] = useState("wall");
  const [algorithm, setAlgorithm] = useState("maze");
  const [speed, setSpeed] = useState(35);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({ visited: 0, pathLength: 0, time: 0 });
  const [mazes, setMazes] = useState([]);
  const [history, setHistory] = useState([]);
  const [mazeName, setMazeName] = useState("");

  const descriptions = {
    maze: "Rat in a Maze uses backtracking to explore paths and backtracks when blocked.",
    bfs: "BFS explores level by level and finds the shortest path in an unweighted grid.",
    dfs: "DFS explores deeply first and may not return the shortest path.",
    dijkstra: "Dijkstra finds shortest path using distance relaxation."
  };

  useEffect(() => {
    loadMazes();
    loadHistory();
  }, []);

  const loadMazes = async () => {
    try {
      const res = await api.get("/mazes");
      setMazes(res.data);
    } catch {}
  };

  const loadHistory = async () => {
    try {
      const res = await api.get("/history");
      setHistory(res.data);
    } catch {}
  };

  const cloneGrid = (g = grid) => g.map(row => row.map(cell => ({ ...cell })));

  const clearPath = () => {
    const next = cloneGrid();
    next.forEach(row => row.forEach(cell => {
      cell.state = "";
      cell.visited = false;
      cell.distance = Infinity;
      cell.previous = null;
    }));
    setGrid(next);
    setStats({ visited: 0, pathLength: 0, time: 0 });
  };

  const resetGrid = () => {
    setStart(initialStart);
    setTarget(initialTarget);
    setGrid(makeGrid());
    setStats({ visited: 0, pathLength: 0, time: 0 });
  };

  const handleCellClick = (row, col) => {
    if (isRunning) return;
    if (mode === "start") {
      if (row === target.row && col === target.col) return;
      setStart({ row, col });
      return;
    }
    if (mode === "target") {
      if (row === start.row && col === start.col) return;
      setTarget({ row, col });
      return;
    }
    if ((row === start.row && col === start.col) || (row === target.row && col === target.col)) return;
    const next = cloneGrid();
    next[row][col].isWall = !next[row][col].isWall;
    setGrid(next);
  };

  const getNeighbors = (node, workGrid) => {
    const dirs = [[1,0], [0,1], [-1,0], [0,-1]];
    return dirs
      .map(([dr, dc]) => ({ row: node.row + dr, col: node.col + dc }))
      .filter(p => p.row >= 0 && p.row < ROWS && p.col >= 0 && p.col < COLS && !workGrid[p.row][p.col].isWall)
      .map(p => workGrid[p.row][p.col]);
  };

  const resetWorkGrid = () => {
    const work = cloneGrid();
    work.forEach(row => row.forEach(cell => {
      cell.state = "";
      cell.visited = false;
      cell.distance = Infinity;
      cell.previous = null;
    }));
    return work;
  };

  const reconstructPath = (endNode) => {
    const path = [];
    let current = endNode;
    while (current) {
      path.unshift(current);
      current = current.previous;
    }
    return path.length && path[0].row === start.row && path[0].col === start.col ? path : [];
  };

  const runBfs = () => {
    const work = resetWorkGrid();
    const order = [];
    const queue = [work[start.row][start.col]];
    queue[0].visited = true;
    while (queue.length) {
      const node = queue.shift();
      order.push(node);
      if (node.row === target.row && node.col === target.col) break;
      getNeighbors(node, work).forEach(n => {
        if (!n.visited) {
          n.visited = true;
          n.previous = node;
          queue.push(n);
        }
      });
    }
    return { workGrid: work, visitedOrder: order, path: reconstructPath(work[target.row][target.col]) };
  };

  const runDfs = () => {
    const work = resetWorkGrid();
    const order = [];
    const stack = [work[start.row][start.col]];
    stack[0].visited = true;
    while (stack.length) {
      const node = stack.pop();
      order.push(node);
      if (node.row === target.row && node.col === target.col) break;
      getNeighbors(node, work).forEach(n => {
        if (!n.visited) {
          n.visited = true;
          n.previous = node;
          stack.push(n);
        }
      });
    }
    return { workGrid: work, visitedOrder: order, path: reconstructPath(work[target.row][target.col]) };
  };

  const runDijkstra = () => {
    const work = resetWorkGrid();
    const order = [];
    const unvisited = work.flat();
    work[start.row][start.col].distance = 0;
    while (unvisited.length) {
      unvisited.sort((a, b) => a.distance - b.distance);
      const closest = unvisited.shift();
      if (closest.isWall) continue;
      if (closest.distance === Infinity) break;
      closest.visited = true;
      order.push(closest);
      if (closest.row === target.row && closest.col === target.col) break;
      getNeighbors(closest, work).forEach(n => {
        if (!n.visited && closest.distance + 1 < n.distance) {
          n.distance = closest.distance + 1;
          n.previous = closest;
        }
      });
    }
    return { workGrid: work, visitedOrder: order, path: reconstructPath(work[target.row][target.col]) };
  };

  const runMaze = () => {
    const work = resetWorkGrid();
    const order = [];
    const path = [];
    const seen = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    function solve(row, col) {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS || work[row][col].isWall || seen[row][col]) return false;
      const node = work[row][col];
      seen[row][col] = true;
      order.push(node);
      path.push(node);
      if (row === target.row && col === target.col) return true;
      for (const [dr, dc] of [[1,0],[0,1],[-1,0],[0,-1]]) {
        if (solve(row + dr, col + dc)) return true;
      }
      path.pop();
      return false;
    }
    solve(start.row, start.col);
    return { workGrid: work, visitedOrder: order, path: [...path] };
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const visualize = async () => {
    if (isRunning) return;
    setIsRunning(true);
    clearPath();
    const startTime = performance.now();
    const result = algorithm === "bfs" ? runBfs() : algorithm === "dfs" ? runDfs() : algorithm === "dijkstra" ? runDijkstra() : runMaze();
    const anim = cloneGrid(result.workGrid);

    for (let i = 0; i < result.visitedOrder.length; i++) {
      const node = result.visitedOrder[i];
      if (!(node.row === start.row && node.col === start.col) && !(node.row === target.row && node.col === target.col)) {
        anim[node.row][node.col].state = "visited";
        setGrid(anim.map(row => row.map(cell => ({ ...cell }))));
      }
      setStats(prev => ({ ...prev, visited: i + 1 }));
      await sleep(Number(speed));
    }

    for (const node of result.path) {
      if (!(node.row === start.row && node.col === start.col) && !(node.row === target.row && node.col === target.col)) {
        anim[node.row][node.col].state = "path";
        setGrid(anim.map(row => row.map(cell => ({ ...cell }))));
      }
      await sleep(Number(speed) + 10);
    }

    const taken = Math.round(performance.now() - startTime);
    const newStats = { visited: result.visitedOrder.length, pathLength: result.path.length, time: taken };
    setStats(newStats);
    try {
      await api.post("/history", { algorithm, visitedNodes: newStats.visited, pathLength: newStats.pathLength, timeTaken: newStats.time });
      loadHistory();
    } catch {}
    setIsRunning(false);
  };

  const randomWalls = () => {
    if (isRunning) return;
    const next = cloneGrid();
    next.forEach(row => row.forEach(cell => {
      cell.state = "";
      if ((cell.row === start.row && cell.col === start.col) || (cell.row === target.row && cell.col === target.col)) {
        cell.isWall = false;
      } else {
        cell.isWall = Math.random() < 0.24;
      }
    }));
    setGrid(next);
  };

  const saveMaze = async () => {
    if (!mazeName.trim()) return alert("Enter maze name");
    const walls = [];
    grid.forEach(row => row.forEach(cell => {
      if (cell.isWall) walls.push([cell.row, cell.col]);
    }));
    await api.post("/mazes", { name: mazeName, rows: ROWS, cols: COLS, start, target, walls });
    setMazeName("");
    loadMazes();
    alert("Maze saved");
  };

  const loadMaze = (maze) => {
    const next = makeGrid();
    const wallSet = new Set(maze.walls.map(w => `${w[0]}-${w[1]}`));
    next.forEach(row => row.forEach(cell => cell.isWall = wallSet.has(`${cell.row}-${cell.col}`)));
    setStart(maze.start);
    setTarget(maze.target);
    setGrid(next);
    setStats({ visited: 0, pathLength: 0, time: 0 });
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">PV</div>
          <div>
            <h1>Path Visualizer</h1>
            <p>MERN DSA Project</p>
          </div>
        </div>

        <div className="user-card">
          <div className="avatar">{user?.avatarText}</div>
          <div><b>{user?.name}</b><span>{user?.email}</span></div>
        </div>

        <div className="control-card">
          <label>Algorithm</label>
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
            <option value="maze">Rat in a Maze</option>
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
            <option value="dijkstra">Dijkstra</option>
          </select>
          <label>Speed</label>
          <select value={speed} onChange={(e) => setSpeed(e.target.value)}>
            <option value="80">Slow</option>
            <option value="35">Normal</option>
            <option value="10">Fast</option>
          </select>
          <button className="primary-btn" onClick={visualize}>Visualize</button>
          <button onClick={randomWalls}>Random Walls</button>
          <button onClick={clearPath}>Clear Path</button>
          <button onClick={resetGrid}>Reset Grid</button>
        </div>

        <div className="control-card">
          <h2>Mode</h2>
          <div className="mode-grid">
            <button className={mode === "wall" ? "active" : ""} onClick={() => setMode("wall")}>Wall</button>
            <button className={mode === "start" ? "active" : ""} onClick={() => setMode("start")}>Start</button>
            <button className={mode === "target" ? "active" : ""} onClick={() => setMode("target")}>Target</button>
          </div>
        </div>

        <div className="control-card">
          <h2>Save Maze</h2>
          <input className="sidebar-input" placeholder="Maze name" value={mazeName} onChange={(e) => setMazeName(e.target.value)} />
          <button className="primary-btn" onClick={saveMaze}>Save Maze</button>
        </div>

        <button className="logout" onClick={logout}>Logout</button>
      </aside>

      <main className="main">
        <section className="hero">
          <div><h2>Pathfinding Algorithm Visualizer</h2><p>{descriptions[algorithm]}</p></div>
          <div className="badge">BFS • DFS • Dijkstra • Backtracking</div>
        </section>

        <section className="stats-grid">
          <div className="stat-card"><span>Visited Nodes</span><b>{stats.visited}</b></div>
          <div className="stat-card"><span>Path Length</span><b>{stats.pathLength}</b></div>
          <div className="stat-card"><span>Time Taken</span><b>{stats.time} ms</b></div>
          <div className="stat-card"><span>Saved Mazes</span><b>{mazes.length}</b></div>
        </section>

        <section className="grid-card">
          <div className="grid">
            {grid.map(row => row.map(cell => {
              let className = "cell";
              if (cell.row === start.row && cell.col === start.col) className += " start";
              else if (cell.row === target.row && cell.col === target.col) className += " target";
              else if (cell.isWall) className += " wall";
              else if (cell.state) className += ` ${cell.state}`;
              return <div key={`${cell.row}-${cell.col}`} className={className} onClick={() => handleCellClick(cell.row, cell.col)} />;
            }))}
          </div>
        </section>

        <section className="two-col">
          <div className="panel">
            <h2>Saved Mazes</h2>
            {mazes.length === 0 ? <p>No saved mazes yet.</p> : <div className="list">{mazes.map(m => <button key={m._id} onClick={() => loadMaze(m)}>{m.name}</button>)}</div>}
          </div>
          <div className="panel">
            <h2>Visualization History</h2>
            {history.length === 0 ? <p>No history yet.</p> : (
              <table><thead><tr><th>Algorithm</th><th>Visited</th><th>Path</th><th>Time</th></tr></thead>
              <tbody>{history.map(h => <tr key={h._id}><td>{h.algorithm}</td><td>{h.visitedNodes}</td><td>{h.pathLength}</td><td>{h.timeTaken} ms</td></tr>)}</tbody></table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Visualizer;
