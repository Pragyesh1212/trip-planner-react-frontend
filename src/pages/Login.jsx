
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Compass,
} from "lucide-react";

import authService from "../services/authService";
import "./Login.css";

function getErrorMessage(error) {
  const detail = error.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(", ");
  }

  return detail || error.message || "Unable to log in. Please try again.";
}

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login(formData);

      // The planner route will be implemented in a later step.
      navigate("/planner");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-brand">
        <Link
          to="/"
          className="auth-brand-link"
          aria-label="Tripmate home"
        >
          <span className="auth-brand-icon">
            <Compass size={25} aria-hidden="true" />
          </span>

          <span className="auth-brand-name">
            trip<span>mate</span>
          </span>
        </Link>

        <p>Your next journey starts here.</p>
      </div>

      <div className="auth-card">
        <div className="auth-heading">
          <h1>Welcome Back</h1>
          <p>Sign in to continue planning your trips.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-email">Email address</label>

            <div className="auth-input-wrapper">
              <Mail size={18} aria-hidden="true" />

              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <div className="password-label-row">
              <label htmlFor="login-password">Password</label>

              <Link
                to="/forgot-password"
                className="forgot-password-link"
              >
                Forgot password?
              </Link>
            </div>

            <div className="auth-input-wrapper">
              <LockKeyhole size={18} aria-hidden="true" />

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <button
                className="auth-password-toggle"
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
