import React, { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Shield,
  Hash,
  Calendar,
  LogOut,
  Loader2,
  AlertCircle,
  RefreshCw,
  Key,
  Lock,
  Activity,
} from "lucide-react";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { ProfileSkeleton } from "../components/common/PageSkeletons";
import { useTranslation } from "react-i18next";

export default function ProfilePage({ onLogoutSuccess }) {
  const { user, token, fetchProfile, logout, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      if (fetchProfile) {
        await fetchProfile(token);
      }
    } catch (err) {
      console.error("Refresh profile error:", err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProfile, token]);

  const formatDate = (dateString) => {
    if (!dateString) return "Jul 22, 2026";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (authLoading) {
    return <ProfileSkeleton />;
  }

  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "Kiran DM";
  const emailStr = user?.email || "kirandm@gmail.com";
  const userIdStr = user?.id ? `USR-${user.id}` : "USR-31";
  const userRoleStr = user?.role ? user.role.toUpperCase() : "ADMINISTRATOR";
  const initials = (
    (user?.first_name?.[0] || "K") + (user?.last_name?.[0] || "D")
  ).toUpperCase();

  return (
    <div
      style={{
        maxWidth: "780px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        paddingBottom: "2.5rem",
      }}
    >
      {/* Top Profile Header Card */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "1.5rem 1.75rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.25rem",
          }}
        >
          {/* Left: Avatar + Details */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
          >
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                background: "#4F46E5",
                color: "#FFFFFF",
                fontSize: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  flexWrap: "wrap",
                  marginBottom: "0.2rem",
                }}
              >
                <h1
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {fullName}
                </h1>
                <span
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    padding: "0.12rem 0.55rem",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                >
                  {userIdStr}
                </span>
                <span
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    padding: "0.12rem 0.55rem",
                    borderRadius: "6px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {userRoleStr}
                </span>
              </div>
              <p style={{ color: "#64748b", margin: 0, fontSize: "0.88rem" }}>
                {emailStr}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", gap: "0.65rem" }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              isLoading={refreshing}
              onClick={handleRefresh}
              title={t("profilePage.refreshAccountData")}
              style={{ padding: "0.45rem 0.85rem" }}
            >
              {t("profile.refresh")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={LogOut}
              isLoading={loggingOut}
              onClick={handleLogout}
              style={{
                background: "#dc2626",
                borderColor: "#dc2626",
                padding: "0.45rem 0.85rem",
              }}
            >
              {t("profile.sign_out")}
            </Button>
          </div>
        </div>
      </div>

      {/* Card 2: Account Specifications & System Credentials */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "1.5rem 1.75rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#94a3b8",
            }}
          >
            {t("profile.account_specs")}
          </span>
          <span
            style={{
              background: "#f1f5f9",
              color: "#475569",
              padding: "0.15rem 0.55rem",
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            {t("profile.confidential")}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 0",
              borderBottom: "1px solid #f1f5f9",
              fontSize: "0.88rem",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                color: "#64748b",
              }}
            >
              <Hash size={15} /> {t("profile.user_identifier")}
            </span>
            <span
              style={{
                background: "#f1f5f9",
                color: "#475569",
                padding: "0.15rem 0.55rem",
                borderRadius: "6px",
                fontSize: "0.78rem",
                fontWeight: 700,
                fontFamily: "monospace",
              }}
            >
              {userIdStr}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 0",
              borderBottom: "1px solid #f1f5f9",
              fontSize: "0.88rem",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                color: "#64748b",
              }}
            >
              <User size={15} /> {t("profile.full_name")}
            </span>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>
              {fullName}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 0",
              borderBottom: "1px solid #f1f5f9",
              fontSize: "0.88rem",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                color: "#64748b",
              }}
            >
              <Mail size={15} /> {t("profile.registered_email")}
            </span>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>
              {emailStr}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 0",
              borderBottom: "1px solid #f1f5f9",
              fontSize: "0.88rem",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                color: "#64748b",
              }}
            >
              <Shield size={15} /> {t("profile.system_role")}
            </span>
            <span
              style={{
                textTransform: "capitalize",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {user?.role || t("profile.administrator")}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 0 0 0",
              fontSize: "0.88rem",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                color: "#64748b",
              }}
            >
              <Calendar size={15} /> {t("profile.account_created")}
            </span>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>
              {formatDate(user?.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Security, Active Sessions & Access Control */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "1.5rem 1.75rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#94a3b8",
            }}
          >
            {t("profile.security_section")}
          </span>
          <span
            style={{
              background: "#d1fae5",
              color: "#047857",
              padding: "0.15rem 0.55rem",
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            {t("profile.encrypted")}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 0",
              borderBottom: "1px solid #f1f5f9",
              fontSize: "0.88rem",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                color: "#64748b",
              }}
            >
              <Lock size={15} /> {t("profile.auth_protocol")}
            </span>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>
              {t("profile.auth_value")}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 0",
              borderBottom: "1px solid #f1f5f9",
              fontSize: "0.88rem",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                color: "#64748b",
              }}
            >
              <Key size={15} /> {t("profile.api_scope")}
            </span>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>
              {t("profile.api_scope_value")}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 0",
              borderBottom: "1px solid #f1f5f9",
              fontSize: "0.88rem",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                color: "#64748b",
              }}
            >
              <Activity size={15} /> {t("profile.session_state")}
            </span>
            <span
              style={{
                background: "#d1fae5",
                color: "#047857",
                padding: "0.15rem 0.65rem",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
            >
              {t("profile.active_token")}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 0 0 0",
              fontSize: "0.88rem",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                color: "#64748b",
              }}
            >
              <Shield size={15} /> {t("profile.password_policy")}
            </span>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>
              {t("profile.password_value")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
