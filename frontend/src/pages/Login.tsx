import {
  useState,
  type FormEvent,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const {
    user,
    login,
  } = useAuth();

  const location =
    useLocation();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  if (user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError(
        "Enter your AeroVision email.",
      );
      return;
    }

    if (!password) {
      setError(
        "Enter your password.",
      );
      return;
    }

    try {
      setSubmitting(true);

      await login(
        email,
        password,
      );

      const from =
        (
          location.state as
            | {
                from?: string;
              }
            | null
        )?.from;

      window.history.replaceState(
        {},
        "",
        from || "/",
      );

      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">

        <div className="login-brand">
          <div className="login-brand-mark">
            AV
          </div>

          <div>
            <strong>
              AeroVision
            </strong>

            <span>
              Mobility Intelligence
            </span>
          </div>
        </div>

        <div className="login-content">
          <p className="eyebrow">
            SECURE ACCESS
          </p>

          <h1>
            Welcome back.
          </h1>

          <p className="login-description">
            Sign in to access the AeroVision
            operations platform.
          </p>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <label>
              <span>Email</span>

              <input
                type="text"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="admin@aerovision.local"
                autoComplete="username"
                autoFocus
              />
            </label>

            <label>
              <span>Password</span>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </label>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              className="login-button"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <p className="login-footer">
            AeroVision access is managed by
            your system administrator.
          </p>
        </div>
      </div>

      <div className="login-visual">
        <div className="visual-grid" />

        <div className="visual-content">
          <p className="eyebrow">
            INTELLIGENT MOBILITY
          </p>

          <h2>
            Sense.
            <br />
            Understand.
            <br />
            Improve.
          </h2>

          <p>
            Edge AI, mobility intelligence
            and geospatial data in one
            operational platform.
          </p>
        </div>

        <div className="visual-footer">
          <span>
            AEROVISION
          </span>

          <span>
            SIH26220
          </span>
        </div>
      </div>
    </div>
  );
}