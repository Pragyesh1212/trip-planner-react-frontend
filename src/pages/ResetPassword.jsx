
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

import "./ResetPassword.css";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // UI stage only. Save the password through the backend later.
    setUpdated(true);
  }

  return (
    <section className="auth-page">
      <div className="auth-brand">
        <Link to="/" className="auth-brand-link" aria-label="Tripmate home">
          <span className="auth-brand-icon">
            <Compass size={25} aria-hidden="true" />
          </span>
          <span className="auth-brand-name">
            trip<span>mate</span>
          </span>
        </Link>
        <p>Your next journey starts here.</p>
      </div>

      <div className="auth-card recovery-card">
        {!updated ? (
          <>
            <div className="auth-heading">
              <h1>Reset your password</h1>
              <p>
                Choose a new password for your Tripmate account.
              </p>
            </div>

            {email && (
              <p className="reset-account-email">
                Resetting password for <strong>{email}</strong>
              </p>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="reset-password">New password</label>

                <div className="auth-input-wrapper">
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter a new password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={18} aria-hidden="true" />
                    ) : (
                      <Eye size={18} aria-hidden="true" />
                    )}
                  </button>
                </div>
                <span className="reset-hint">Use at least 8 characters.</span>
              </div>

              <div className="auth-field">
                <label htmlFor="reset-confirm-password">
                  Confirm new password
                </label>

                <div className="auth-input-wrapper">
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError("");
                    }}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
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

              <button className="auth-submit" type="submit">
                Reset password
              </button>
            </form>

            <p className="auth-switch recovery-back-link">
              <Link to="/login">Back to login</Link>
            </p>
          </>
        ) : (
          <div className="recovery-success">
            <span className="recovery-success-icon">
              <CheckCircle2 size={30} aria-hidden="true" />
            </span>

            <div className="auth-heading">
              <h1>Password validated</h1>
              <p>
                Your new password passed the form checks. Password changes
                will take effect once backend integration is implemented.
              </p>
            </div>

            <button
              className="auth-submit"
              type="button"
              onClick={() => navigate("/login")}
            >
              Return to login
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
