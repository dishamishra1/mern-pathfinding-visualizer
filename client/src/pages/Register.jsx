import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return alert("Password must be at least 6 characters");
    try {
      const res = await api.post("/auth/register", form);
      login(res.data.token, res.data.user);
      navigate("/visualizer");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-left">
        <div className="logo">PV</div>
        <span className="badge">MERN DSA Project</span>
        <h1>Create Your Visualizer Account</h1>
        <p>Save mazes, track history, and compare pathfinding algorithms.</p>
      </section>
      <section className="auth-right">
        <form className="auth-card" onSubmit={submit}>
          <h2>Sign Up</h2>
          <p>Create your free account</p>
          <label>Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value.trim() })} />
          <label>Password</label>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="primary-btn">Create Account</button>
          <p className="switch-text">Already have account? <Link to="/">Login</Link></p>
        </form>
      </section>
    </div>
  );
}

export default Register;
