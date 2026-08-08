import React from "react";
import Skeleton, {
  SkeletonText,
  SkeletonRect,
  SkeletonCircle,
  SkeletonStatCard,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonChart,
} from "./Skeleton";

/**
 * Overview Page Skeleton layout
 */
export function OverviewSkeleton() {
  return (
    <div
      style={{
        paddingBottom: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.75rem",
      }}
    >
      {/* Header Skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <SkeletonText size="lg" width="220px" height={32} />
        <SkeletonText size="sm" width="340px" height={18} />
      </div>

      {/* Metric Tiles Grid (4 Tiles) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Secondary Row: Recent Forms Grid + Quick Start */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Recent Forms Card */}
        <div
          className="skeleton-card"
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <SkeletonText width="160px" height={22} />
            <SkeletonRect width="80px" height={28} borderRadius="6px" />
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.65rem 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <SkeletonRect width={36} height={36} borderRadius="8px" />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                      flex: 1,
                    }}
                  >
                    <SkeletonText width="70%" height={16} />
                    <SkeletonText size="sm" width="40%" height={12} />
                  </div>
                </div>
                <SkeletonRect width={60} height={22} borderRadius="12px" />
              </div>
            ))}
          </div>
        </div>

        {/* Workspace Activity Card */}
        <div
          className="skeleton-card"
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <SkeletonText width="180px" height={22} />
            <SkeletonCircle size={28} />
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <SkeletonCircle size={32} />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem",
                    flex: 1,
                  }}
                >
                  <SkeletonText size="sm" width="85%" height={14} />
                  <SkeletonText size="sm" width="40%" height={11} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Forms Portfolio Page Skeleton
 */
export function FormsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Bar / Search & Filter Skeleton */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <SkeletonRect width="280px" height={40} borderRadius="8px" />
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <SkeletonRect width="140px" height={40} borderRadius="8px" />
          <SkeletonRect width="160px" height={40} borderRadius="8px" />
        </div>
      </div>

      {/* Forms Portfolio Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <SkeletonCard key={n} height="195px" />
        ))}
      </div>
    </div>
  );
}

/**
 * Templates Page Skeleton
 */
export function TemplatesSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Search & Filter Header Skeleton */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <SkeletonRect width="300px" height={40} borderRadius="8px" />
        <SkeletonRect width="150px" height={40} borderRadius="8px" />
      </div>

      {/* Template Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="skeleton-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              height: "210px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <SkeletonRect width={40} height={40} borderRadius="10px" />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                    flex: 1,
                  }}
                >
                  <SkeletonText width="75%" height={18} />
                  <SkeletonText size="sm" width="45%" height={12} />
                </div>
              </div>
              <SkeletonRect width={65} height={22} borderRadius="12px" />
            </div>
            <SkeletonText size="sm" lines={2} width="95%" />
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <SkeletonText size="sm" width="35%" />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <SkeletonRect width={75} height={32} borderRadius="6px" />
                <SkeletonRect width={95} height={32} borderRadius="6px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Submissions / Responses Page Skeleton
 */
export function ResponsesSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Search & Filter Header Skeleton */}
      <div
        className="skeleton-card"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.25rem",
          padding: "1.25rem",
        }}
      >
        <div style={{ flex: "1 1 200px" }}>
          <SkeletonText
            size="sm"
            width="80px"
            height={12}
            style={{ marginBottom: "0.5rem" }}
          />
          <SkeletonRect width="100%" height={40} borderRadius="8px" />
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <SkeletonText
            size="sm"
            width="80px"
            height={12}
            style={{ marginBottom: "0.5rem" }}
          />
          <SkeletonRect width="100%" height={40} borderRadius="8px" />
        </div>
        <div style={{ flex: "2 1 280px" }}>
          <SkeletonText
            size="sm"
            width="120px"
            height={12}
            style={{ marginBottom: "0.5rem" }}
          />
          <SkeletonRect width="100%" height={40} borderRadius="8px" />
        </div>
      </div>

      {/* Submissions List Skeleton */}
      <div
        className="skeleton-card"
        style={{ padding: "0", overflow: "hidden" }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <SkeletonText width="140px" height={16} />
          <SkeletonText width="100px" height={16} />
        </div>
        {[1, 2, 3, 4, 5].map((n) => (
          <SkeletonTableRow key={n} columns={5} />
        ))}
      </div>
    </div>
  );
}

/**
 * Conditional Rules Page Skeleton
 */
export function RulesSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Filter Header */}
      <div
        className="skeleton-card"
        style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}
      >
        <div style={{ flex: 1, minWidth: "220px" }}>
          <SkeletonText
            size="sm"
            width="90px"
            height={12}
            style={{ marginBottom: "0.5rem" }}
          />
          <SkeletonRect width="100%" height={40} borderRadius="8px" />
        </div>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <SkeletonText
            size="sm"
            width="90px"
            height={12}
            style={{ marginBottom: "0.5rem" }}
          />
          <SkeletonRect width="100%" height={40} borderRadius="8px" />
        </div>
      </div>

      {/* Rules List Skeleton Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="skeleton-card"
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <SkeletonRect width={28} height={28} borderRadius="6px" />
                <SkeletonText width="180px" height={20} />
              </div>
              <SkeletonRect width={80} height={26} borderRadius="12px" />
            </div>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                background: "#f8fafc",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
              }}
            >
              <SkeletonText size="sm" width="30%" />
              <SkeletonRect width={60} height={20} borderRadius="4px" />
              <SkeletonText size="sm" width="40%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Analytics Page Skeleton
 */
export function AnalyticsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header Skeleton */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <SkeletonText size="lg" width="260px" height={32} />
          <SkeletonText size="sm" width="360px" height={16} />
        </div>
        <SkeletonRect width="140px" height={38} borderRadius="8px" />
      </div>

      {/* Analytics Metric Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Charts Grid Skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <SkeletonChart height="300px" />
        <SkeletonChart height="300px" />
      </div>
    </div>
  );
}

/**
 * Reports & Export Page Skeleton
 */
export function ReportsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Form configuration & download card */}
      <div
        className="skeleton-card"
        style={{
          maxWidth: "580px",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <SkeletonText size="lg" width="240px" height={24} />
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <SkeletonText size="sm" width="120px" />
          <SkeletonRect width="100%" height={40} borderRadius="8px" />
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <SkeletonText size="sm" width="100px" />
          <SkeletonRect width="100%" height={40} borderRadius="8px" />
        </div>
        <SkeletonRect
          width="100%"
          height={44}
          borderRadius="8px"
          style={{ marginTop: "0.5rem" }}
        />
      </div>
    </div>
  );
}

/**
 * Profile Page Skeleton
 */
export function ProfileSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        maxWidth: "720px",
      }}
    >
      {/* User Header Profile Box Skeleton */}
      <div
        className="skeleton-card"
        style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
      >
        <SkeletonCircle size={64} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            flex: 1,
          }}
        >
          <SkeletonText size="lg" width="180px" height={24} />
          <SkeletonText size="sm" width="220px" height={16} />
          <SkeletonText size="sm" width="120px" height={14} />
        </div>
      </div>

      {/* User Details Grid */}
      <div
        className="skeleton-card"
        style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
      >
        <SkeletonText size="lg" width="160px" height={22} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <SkeletonText size="sm" width="100px" />
              <SkeletonRect width="100%" height={38} borderRadius="6px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Public Form Skeleton layout
 */
export function PublicFormSkeleton() {
  return (
    <div className="skeleton-form-loading">
      <div className="skeleton-line skeleton-heading" />
      <div className="skeleton-line skeleton-desc" />
      <div className="skeleton-divider" />
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="skeleton-field-block">
          <div className="skeleton-line skeleton-field-label" />
          <div className="skeleton-line skeleton-field-input" />
        </div>
      ))}
      <div className="skeleton-line skeleton-field-btn" />
    </div>
  );
}
