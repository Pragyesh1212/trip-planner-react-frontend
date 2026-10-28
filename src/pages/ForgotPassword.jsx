

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

import "./ForgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    // UI stage only. Connect this to the existing backend later.
    setSubmitted(true);
  }

  function continueToReset() {
    navigate("/reset-password", {
      state: { email: email.trim() },
    });
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
        {!submitted ? (
          <>
            <div className="recovery-icon">
              <Mail size={24} aria-hidden="true" />
            </div>

            <div className="auth-heading">
              <h1>Forgot password?</h1>
              <p>
                Enter the email address associated with your account
                to continue resetting your password.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="recovery-email">Email address</label>

                <div className="auth-input-wrapper">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    id="recovery-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}

              <button className="auth-submit" type="submit">
                Continue
              </button>
            </form>

            <p className="auth-switch recovery-back-link">
              <Link to="/login">
                <ArrowLeft size={15} aria-hidden="true" />
                Back to login
              </Link>
            </p>
          </>
        ) : (
          <div className="recovery-success">
            <span className="recovery-success-icon">
              <CheckCircle2 size={30} aria-hidden="true" />
            </span>

            <div className="auth-heading">
              <h1>Continue to reset</h1>
              <p>
                Your email has been entered. You can continue to the
                password reset form in this UI preview.
              </p>
            </div>

            <p className="recovery-email">{email}</p>

            <button
              className="auth-submit"
              type="button"
              onClick={continueToReset}
            >
              Continue to reset password
            </button>

            <button
              className="recovery-text-button"
              type="button"
              onClick={() => setSubmitted(false)}
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
