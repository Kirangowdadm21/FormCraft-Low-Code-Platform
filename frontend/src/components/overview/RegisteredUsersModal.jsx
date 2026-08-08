import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  X,
  Search,
  RefreshCw,
  ShieldCheck,
  Mail,
  Calendar,
  UserCheck,
  Loader2,
} from "lucide-react";
import { getRegisteredUsers } from "../../services/api";

export default function RegisteredUsersModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userList = await getRegisteredUsers();
      setUsers(userList || []);
    } catch (err) {
      console.error("Failed to fetch registered users:", err);
      setError(err.message || "Failed to load registered users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const email = (u.email || "").toLowerCase();
    const isSyntheticTestAccount =
      email.includes("_owner_") ||
      email.startsWith("test_") ||
      email.startsWith("user_") ||
      email.startsWith("managed_") ||
      (email.startsWith("admin_") && email.endsWith("@example.com"));

    if (isSyntheticTestAccount) return false;

    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim().toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    return !query || fullName.includes(query) || email.includes(query);
  });

  const getInitials = (user) => {
    const fn = (user.first_name || "").trim();
    const ln = (user.last_name || "").trim();
    if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
    if (fn) return fn.slice(0, 2).toUpperCase();
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return "US";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "680px",
          width: "90%",
          borderRadius: "16px",
          overflow: "hidden",
          padding: 0,
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            background: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "#EEF2FF",
                color: "#4F46E5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>{t("registeredUsersModal.title", "Registered Users")}</span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.6rem",
                    borderRadius: "12px",
                    background: "#4F46E5",
                    color: "#FFFFFF",
                  }}
                >
                  {filteredUsers.length}
                </span>
              </h2>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#64748B",
                  margin: "0.15rem 0 0 0",
                }}
              >
                {t(
                  "registeredUsersModal.subtitle",
                  "Active platform user accounts and credentials in workspace.",
                )}
              </p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0.4rem",
              borderRadius: "8px",
              color: "#64748B",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Refresh Controls Bar */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            background: "#FFFFFF",
          }}
        >
          <div
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search
              size={16}
              color="#94A3B8"
              style={{ position: "absolute", left: "12px" }}
            />
            <input
              type="text"
              placeholder={t("registeredUsersModal.searchPlaceholder", "Search users by name or email...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem 0.5rem 2.25rem",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.5rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              background: "#FFFFFF",
              color: "#475569",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            <span>{t("registeredUsersModal.refresh", "Refresh")}</span>
          </button>
        </div>

        {/* Modal Body / User List */}
        <div style={{ maxHeight: "420px", overflowY: "auto", padding: "1rem 1.5rem" }}>
          {error && (
            <div
              style={{
                padding: "0.85rem 1rem",
                borderRadius: "8px",
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                color: "#991B1B",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div
              style={{
                padding: "3rem 1rem",
                textAlign: "center",
                color: "#64748B",
              }}
            >
              <Loader2
                size={28}
                className="animate-spin"
                color="#4F46E5"
                style={{ margin: "0 auto 0.5rem auto" }}
              />
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                {t("registeredUsersModal.loading", "Loading registered user accounts...")}
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div
              style={{
                padding: "3rem 1rem",
                textAlign: "center",
                color: "#64748B",
              }}
            >
              <Users size={36} color="#CBD5E1" style={{ margin: "0 auto 0.75rem auto" }} />
              <h4 style={{ margin: 0, fontWeight: 700, color: "#334155" }}>
                {searchQuery
                  ? t("registeredUsersModal.noMatchesTitle", "No matching users found")
                  : t("registeredUsersModal.noUsersTitle", "No registered users")}
              </h4>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                {searchQuery
                  ? t("registeredUsersModal.noMatchesSub", "Try searching with a different name or email.")
                  : t("registeredUsersModal.noUsersSub", "Registered platform users will appear here.")}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filteredUsers.map((user) => {
                const fullName =
                  [user.first_name, user.last_name].filter(Boolean).join(" ") ||
                  user.email.split("@")[0];
                const roleLabel = (user.role || "user").toUpperCase();
                const isAdmin = roleLabel === "ADMIN" || roleLabel === "ADMINISTRATOR";

                return (
                  <div
                    key={user.id || user.email}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.9rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      background: "#FFFFFF",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    }}
                  >
                    {/* Left: User Avatar & Info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          background: isAdmin ? "#EEF2FF" : "#F1F5F9",
                          color: isAdmin ? "#4F46E5" : "#475569",
                          fontWeight: 800,
                          fontSize: "0.95rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: isAdmin ? "1.5px solid #C7D2FE" : "1px solid #E2E8F0",
                        }}
                      >
                        {getInitials(user)}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.92rem",
                            color: "#0F172A",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <span>{fullName}</span>
                          {isAdmin && (
                            <ShieldCheck
                              size={15}
                              color="#4F46E5"
                              title="Administrator"
                            />
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748B",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            marginTop: "0.15rem",
                          }}
                        >
                          <Mail size={12} color="#94A3B8" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Role & Status Badges */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.55rem",
                            borderRadius: "12px",
                            background: isAdmin ? "#EEF2FF" : "#F8FAFC",
                            color: isAdmin ? "#4F46E5" : "#64748B",
                            border: isAdmin ? "1px solid #C7D2FE" : "1px solid #E2E8F0",
                          }}
                        >
                          {isAdmin ? "Administrator" : "User"}
                        </span>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#10B981",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            justifyContent: "flex-end",
                            marginTop: "0.25rem",
                          }}
                        >
                          <UserCheck size={12} />
                          <span>Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "0.9rem 1.5rem",
            background: "#F8FAFC",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{
              padding: "0.45rem 1.1rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("registeredUsersModal.close", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
}
