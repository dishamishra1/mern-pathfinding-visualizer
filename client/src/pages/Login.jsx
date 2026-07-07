import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate("/visualizer");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-left">
        <div className="logo">PV</div>
        <span className="badge">MERN DSA Project</span>
        <h1>Pathfinding Algorithm Visualizer</h1>
        <p>Visualize Rat in a Maze, BFS, DFS, and Dijkstra with saved mazes and history.</p>
      </section>
      <section className="auth-right">
        <form className="auth-card" onSubmit={submit}>
          <h2>Login</h2>
          <p>Continue to your visualizer dashboard</p>
          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value.trim() })} />
          <label>Password</label>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="primary-btn">Login</button>
          <p className="switch-text">New user? <Link to="/register">Create account</Link></p>
        </form>
      </section>
    </div>
  );
}

export default Login;
