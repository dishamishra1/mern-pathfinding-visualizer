# MERN Pathfinding Algorithm Visualizer

A full-stack MERN project for visualizing pathfinding algorithms with authentication, saved mazes, and visualization history.

## Features
- Login and Signup
- JWT Authentication
- Interactive grid
- Start/target selection
- Add/remove walls
- Rat in a Maze, BFS, DFS, Dijkstra
- Speed control
- Random walls
- Save and load mazes
- Visualization history
- Stats: visited nodes, path length, time

## Tech Stack
React.js, Vite, CSS, Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs

## Run Backend
```bash
cd server
npm install
```

Create `.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pathfinding_visualizer
JWT_SECRET=pathsecret
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

## Run Frontend
```bash
cd client
npm install
npm run dev
```

## Resume Line
Built a MERN-based Pathfinding Algorithm Visualizer with JWT authentication, animated visualization of BFS, DFS, Dijkstra, and Rat in a Maze, plus saved mazes and visualization history using MongoDB.
