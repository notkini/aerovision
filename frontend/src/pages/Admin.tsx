import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../auth/AuthContext";
import {
  type CurrentUser,
} from "../services/api";


type ManagedUser = CurrentUser;


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8765";


export default function Admin() {
  const { token } = useAuth();

  const [users, setUsers] =
    useState<ManagedUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const [email, setEmail] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("OPERATOR");

  const [creating, setCreating] =
    useState(false);


  async function loadUsers() {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_BASE_URL}/api/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load users.",
        );
      }

      const data =
        await response.json();

      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadUsers();
  }, [token]);


  async function createUser(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!token) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response =
        await fetch(
          `${API_BASE_URL}/api/admin/users`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
              full_name: fullName,
              password,
              role,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
          "Failed to create user.",
        );
      }

      setEmail("");
      setFullName("");
      setPassword("");
      setRole("OPERATOR");

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create user.",
      );
    } finally {
      setCreating(false);
    }
  }


  async function toggleUser(
    user: ManagedUser,
  ) {
    if (!token) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/admin/users/${user.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              is_active:
                !user.is_active,
            }),
          },
        );

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data?.detail ||
          "Failed to update user.",
        );
      }

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update user.",
      );
    }
  }


  return (
    <div className="page-content">
      <div className="page-header">
        <p className="eyebrow">
          ADMINISTRATION
        </p>

        <h1>
          User Management
        </h1>

        <p className="page-description">
          Manage AeroVision accounts and
          operational access.
        </p>
      </div>


      <div className="admin-layout">

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="card-label">
                CREATE ACCOUNT
              </p>

              <h2>
                New user
              </h2>
            </div>
          </div>


          <form
            className="admin-form"
            onSubmit={createUser}
          >
            <label>
              <span>Full name</span>

              <input
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value,
                  )
                }
                placeholder="Operator name"
                required
              />
            </label>


            <label>
              <span>Email</span>

              <input
                type="text"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                placeholder="operator@aerovision.local"
                required
              />
            </label>


            <label>
              <span>Password</span>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                placeholder="Minimum 8 characters"
                minLength={8}
                required
              />
            </label>


            <label>
              <span>Role</span>

              <select
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value,
                  )
                }
              >
                <option value="OPERATOR">
                  Operator
                </option>

                <option value="VIEWER">
                  Viewer
                </option>

                <option value="ADMIN">
                  Administrator
                </option>
              </select>
            </label>


            {error && (
              <div className="admin-error">
                {error}
              </div>
            )}


            <button
              className="admin-primary-button"
              type="submit"
              disabled={creating}
            >
              {creating
                ? "Creating..."
                : "Create account"}
            </button>
          </form>
        </section>


        <section className="admin-card users-card">
          <div className="admin-card-header">
            <div>
              <p className="card-label">
                ACCOUNTS
              </p>

              <h2>
                AeroVision users
              </h2>
            </div>

            <span className="user-count">
              {users.length}
            </span>
          </div>


          {loading ? (
            <div className="admin-empty">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="admin-empty">
              No users found.
            </div>
          ) : (
            <div className="users-table">
              <div className="users-row users-header">
                <span>User</span>
                <span>Role</span>
                <span>Status</span>
                <span />
              </div>

              {users.map((user) => (
                <div
                  className="users-row"
                  key={user.id}
                >
                  <div>
                    <strong>
                      {user.full_name}
                    </strong>

                    <span>
                      {user.email}
                    </span>
                  </div>

                  <span className="role-badge">
                    {user.role}
                  </span>

                  <span
                    className={
                      `status-badge ${
                        user.is_active
                          ? "active"
                          : "inactive"
                      }`
                    }
                  >
                    {user.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                  <button
                    className="table-action"
                    onClick={() =>
                      toggleUser(user)
                    }
                    disabled={
                      !user.is_active ||
                      user.id === 1
                    }
                  >
                    {user.is_active
                      ? "Deactivate"
                      : "Inactive"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}