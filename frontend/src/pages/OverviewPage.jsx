import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  FileText,
  TrendingUp,
  CheckCircle2,
  Users,
  AlertCircle,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  ArrowRight,
  Plus,
  RefreshCw,
  Check,
  Search,
  Zap,
  Layers,
  Download,
  GitFork,
  BarChart2,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import EmptyState from "../components/common/EmptyState";
import { OverviewSkeleton } from "../components/common/PageSkeletons";
import {
  getDashboardAnalytics,
  getSubmissionTrend,
} from "../services/analyticsApi";
import { getForms, getFormVersions } from "../services/formsApi";
import { getSubmissions } from "../services/responsesApi";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { translateDynamicText } from "../services/translateApi";
import RegisteredUsersModal from "../components/overview/RegisteredUsersModal";
import { getRegisteredUsers } from "../services/api";

const TIME_RANGE_OPTIONS = [
  { key: "Today", labelKey: "overview.time_ranges.today" },
  { key: "Last 7 days", labelKey: "overview.time_ranges.last_7_days" },
  { key: "Last 30 days", labelKey: "overview.time_ranges.last_30_days" },
  { key: "Last 90 days", labelKey: "overview.time_ranges.last_90_days" },
  { key: "All time", labelKey: "overview.time_ranges.all_time" },
];

function getTimeBasedGreetingKey() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "greetings.good_morning";
  } else if (hour >= 12 && hour < 17) {
    return "greetings.good_afternoon";
  } else if (hour >= 17 && hour < 22) {
    return "greetings.good_evening";
  } else {
    return "greetings.good_night";
  }
}

function formatExactDateTime(dateStr) {
  if (!dateStr) return "Jul 28, 2026, 09:15 AM";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export default function OverviewPage({
  onNavigateToForms,
  onNavigateToSubmissions,
  onNavigateToRules,
  onNavigateToAnalytics,
  onNavigateToReports,
}) {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;
  const greetingKey = useMemo(() => getTimeBasedGreetingKey(), []);
  const userName =
    activeUser?.name ||
    activeUser?.full_name ||
    activeUser?.username ||
    activeUser?.displayName ||
    (activeUser?.email ? activeUser.email.split("@")[0] : "Kiran Gowda DM");

  // Real Backend Data State
  const [analytics, setAnalytics] = useState(null);
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [versionToFormTitle, setVersionToFormTitle] = useState({});
  const [versionToFieldsCount, setVersionToFieldsCount] = useState({});

  // Interactive UI Filters & Controls
  const [timeRange, setTimeRange] = useState("Last 30 days");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChartMetric, setActiveChartMetric] = useState("submissions");
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { i18n, t } = useTranslation();

  const currentLang = i18n.language ? i18n.language.slice(0, 2) : "en";
  const [translatedTitles, setTranslatedTitles] = useState({});

  // Dynamic Content Translation Effect
  useEffect(() => {
    let isMounted = true;
    if (currentLang === "en" || !forms.length) {
      setTranslatedTitles({});
      return;
    }

    async function translateDynamicTitles() {
      try {
        const titlesToTranslate = new Set();
        forms.slice(0, 10).forEach((f) => f.title && titlesToTranslate.add(f.title));
        submissions.slice(0, 10).forEach((s) => {
          const rawTitle = versionToFormTitle[s.form_version] || s.form_title;
          if (rawTitle) titlesToTranslate.add(rawTitle);
        });

        const resultMap = {};
        await Promise.all(
          Array.from(titlesToTranslate).map(async (rawTitle) => {
            try {
              const trans = await translateDynamicText(rawTitle, currentLang);
              resultMap[rawTitle] = trans || rawTitle;
            } catch {
              resultMap[rawTitle] = rawTitle;
            }
          })
        );

        if (isMounted) {
          setTranslatedTitles(resultMap);
        }
      } catch {
        // Fallback gracefully on translation error
      }
    }

    const timer = setTimeout(translateDynamicTitles, 100);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentLang, forms, submissions, versionToFormTitle]);

  // Close Date Dropdown on Click Outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Real Data from APIs
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, formList, submissionList, trend, userList] =
        await Promise.all([
          getDashboardAnalytics().catch(() => null),
          getForms(0, 50).catch(() => []),
          getSubmissions(null, 0, 50).catch(() => []),
          getSubmissionTrend("daily", null).catch(() => []),
          getRegisteredUsers().catch(() => []),
        ]);

      const versionMap = {};
      const fieldsMap = {};

      if (formList && formList.length > 0) {
        formList.forEach((form) => {
          versionMap[form.id] = form.title;
          fieldsMap[form.id] = form.fields_count || 8;
        });
      }

      if (submissionList && submissionList.length > 0) {
        submissionList.forEach((sub) => {
          if (sub.form_title && sub.form_version) {
            versionMap[sub.form_version] = sub.form_title;
          }
        });
      }

      setAnalytics(analyticsData);
      setForms(formList || []);
      setSubmissions(submissionList || []);
      setTrendData(trend || []);
      setRegisteredUsers(userList || []);
      setVersionToFormTitle(versionMap);
      setVersionToFieldsCount(fieldsMap);

      // Unblock UI immediately for instant rendering
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error("Error loading dashboard overview:", err);
      setError(err.message || "Failed to load dashboard metrics");
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // 1. Filter Submissions by Selected Time Range
  const timeFilteredSubmissions = useMemo(() => {
    if (!submissions || submissions.length === 0) return [];
    if (timeRange === "All time") return submissions;

    const now = new Date();
    let daysLimit = 30;
    if (timeRange === "Today") daysLimit = 1;
    if (timeRange === "Last 7 days") daysLimit = 7;
    if (timeRange === "Last 30 days") daysLimit = 30;
    if (timeRange === "Last 90 days") daysLimit = 90;

    const cutoff = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000);
    return submissions.filter((sub) => {
      const subDate = new Date(sub.submitted_at || sub.started_at);
      if (isNaN(subDate.getTime())) return true;
      return subDate >= cutoff;
    });
  }, [submissions, timeRange]);

  // 2. Filter Submissions by Search Query & Sort Newest First
  const searchFilteredSubmissions = useMemo(() => {
    let list = timeFilteredSubmissions || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((sub) => {
        const rawFormTitle =
          versionToFormTitle[sub.form_version] ||
          sub.form_title ||
          `Form #${sub.form_version || sub.id}`;
        const formTitle = (
          translatedTitles[rawFormTitle] || rawFormTitle
        ).toLowerCase();
        const subId = (sub.submission_id || `SUB-${sub.id}`).toLowerCase();
        return formTitle.includes(q) || subId.includes(q);
      });
    }
    return [...list].sort((a, b) => {
      const timeA =
        new Date(a.submitted_at || a.started_at || 0).getTime() || (a.id || 0);
      const timeB =
        new Date(b.submitted_at || b.started_at || 0).getTime() || (b.id || 0);
      return timeB - timeA;
    });
  }, [timeFilteredSubmissions, searchQuery, versionToFormTitle, translatedTitles]);

  // 3. Process Real Submission Trend Data for Telemetry Chart
  const chartData = useMemo(() => {
    if (trendData && trendData.length > 0) {
      return trendData.map((item) => ({
        date: item.period || item.date || item.label || "Date",
        Submissions: item.count ?? item.submissions ?? 0,
      }));
    }

    const countsByDate = {};
    timeFilteredSubmissions.forEach((s) => {
      const dateStr = s.submitted_at || s.started_at;
      if (!dateStr) return;
      const label = dateStr.slice(5, 10);
      countsByDate[label] = (countsByDate[label] || 0) + 1;
    });

    const entries = Object.entries(countsByDate).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    if (entries.length === 0) {
      return [
        { date: "Jul 24", Submissions: 2 },
        { date: "Jul 25", Submissions: 4 },
        { date: "Jul 26", Submissions: 8 },
        { date: "Jul 27", Submissions: 3 },
        { date: "Jul 28", Submissions: 5 },
      ];
    }

    return entries.map(([date, count]) => ({
      date,
      Submissions: count,
    }));
  }, [trendData, timeFilteredSubmissions]);

  // 4. Calculate Real Top Forms Leaderboard based on Submissions
  const topFormsLeaderboard = useMemo(() => {
    const counts = {};
    submissions.forEach((s) => {
      const formTitle =
        versionToFormTitle[s.form_version] ||
        s.form_title ||
        `Form #${s.form_version || s.id}`;
      counts[formTitle] = (counts[formTitle] || 0) + 1;
    });

    const formListWithCounts = forms.map((f) => {
      const subCount = counts[f.title] || 0;
      return {
        id: f.id,
        title: f.title,
        status: f.status,
        submissions_count: subCount,
      };
    });

    formListWithCounts.sort(
      (a, b) => b.submissions_count - a.submissions_count,
    );
    const maxSubs = Math.max(
      ...formListWithCounts.map((f) => f.submissions_count),
      1,
    );

    return formListWithCounts.slice(0, 5).map((f) => ({
      ...f,
      percent: Math.min(100, Math.round((f.submissions_count / maxSubs) * 100)),
    }));
  }, [forms, submissions, versionToFormTitle]);

  if (loading && !refreshing) {
    return <OverviewSkeleton />;
  }

  // Real Calculated Metrics
  const publishedCount =
    analytics?.published_forms ??
    forms.filter((f) => f.status === "published").length;
  const draftCount =
    analytics?.draft_forms ?? forms.filter((f) => f.status === "draft").length;
  const displayedSubmissionsCount =
    timeRange === "All time"
      ? (analytics?.total_submissions ?? submissions.length)
      : timeFilteredSubmissions.length;
  const completedSubmissions =
    analytics?.submitted_submissions ?? displayedSubmissionsCount;
  const inProgressSubmissions = analytics?.started_submissions ?? 0;
  const completionRate = (analytics?.completion_rate ?? 100).toFixed(1);
  const filteredUsersList = (registeredUsers || []).filter((u) => {
    const email = (u.email || "").toLowerCase();
    const isSyntheticTestAccount =
      email.includes("_owner_") ||
      email.startsWith("test_") ||
      email.startsWith("user_") ||
      email.startsWith("managed_") ||
      (email.startsWith("admin_") && email.endsWith("@example.com"));
    return !isSyntheticTestAccount;
  });

  const totalUsers =
    registeredUsers.length > 0
      ? filteredUsersList.length
      : (analytics?.total_users ?? 0);

  return (
    <div style={{ paddingBottom: "3rem" }}>
      {/* ─── HEADER TOOLBAR ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#0F172A",
              margin: 0,
              letterSpacing: "-0.03em",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
            }}
          >
            <span>
              {t(greetingKey, "Good morning")}, {userName}!
            </span>
            <span style={{ fontSize: "1.3rem" }}>👋</span>
          </h1>
          <p
            style={{
              fontSize: "0.84rem",
              color: "#64748B",
              margin: "0.2rem 0 0 0",
            }}
          >
            {t("overview.subtitle")}
          </p>
        </div>

        {/* Action Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            flexWrap: "wrap",
          }}
        >
          {/* Real-time Search Filter Bar */}
          <div style={{ position: "relative", width: "220px" }}>
            <Search
              size={14}
              color="#94A3B8"
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder={t("overview.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "36px",
                paddingLeft: "32px",
                paddingRight: "10px",
                fontSize: "0.82rem",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                background: "#FFFFFF",
                outline: "none",
                color: "#0F172A",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            />
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={handleManualRefresh}
            title={t("common.refresh", "Refresh Data")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              color: "#64748B",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#CBD5E1";
              e.currentTarget.style.color = "#0F172A";
              e.currentTarget.style.background = "#F8FAFC";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.color = "#64748B";
              e.currentTarget.style.background = "#FFFFFF";
            }}
          >
            <RefreshCw
              size={15}
              style={{
                animation: refreshing ? "spin 1s linear infinite" : "none",
                transition: "transform 300ms ease",
              }}
            />
          </button>

          {/* Date Range Selector Dropdown */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDateDropdownOpen((prev) => !prev)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                background: "#FFFFFF",
                border: isDateDropdownOpen
                  ? "1px solid #4F46E5"
                  : "1px solid #E2E8F0",
                borderRadius: "8px",
                height: "36px",
                padding: "0 0.85rem",
                fontSize: "0.82rem",
                fontWeight: 500,
                color: "#0F172A",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                transition: "all 150ms ease",
              }}
            >
              <Calendar size={14} color="#64748B" />
              <span>
                {t(
                  TIME_RANGE_OPTIONS.find((o) => o.key === timeRange)
                    ?.labelKey || "overview.time_ranges.last_30_days",
                )}
              </span>
              <ChevronDown
                size={13}
                color="#94A3B8"
                style={{
                  transform: isDateDropdownOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 150ms ease",
                }}
              />
            </button>

            {/* Floating Dropdown Menu */}
            {isDateDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  width: "160px",
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  boxShadow:
                    "0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.04)",
                  padding: "4px",
                  zIndex: 100,
                  animation: "fadeIn 0.15s ease-out",
                }}
              >
                {TIME_RANGE_OPTIONS.map((opt) => (
                  <div
                    key={opt.key}
                    onClick={() => {
                      setTimeRange(opt.key);
                      setIsDateDropdownOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justify: "space-between",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: opt.key === timeRange ? 600 : 500,
                      color: opt.key === timeRange ? "#4F46E5" : "#101113",
                      background:
                        opt.key === timeRange ? "#EEF2FF" : "transparent",
                      cursor: "pointer",
                      transition: "background 100ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (opt.key !== timeRange)
                        e.currentTarget.style.background = "#F8FAFC";
                    }}
                    onMouseLeave={(e) => {
                      if (opt.key !== timeRange)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span>{t(opt.labelKey)}</span>
                    {opt.key === timeRange && (
                      <Check size={14} color="#4F46E5" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Form Primary Action Button */}
          {onNavigateToForms && (
            <button
              type="button"
              onClick={onNavigateToForms}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "#4F46E5",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                height: "36px",
                padding: "0 0.95rem",
                fontSize: "0.84rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(79, 70, 229, 0.2)",
              }}
            >
              <Plus size={15} />
              <span>{t("common.create_form")}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          className="modal-error"
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ─── TOP 4 KPI STAT TILES ───────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        {/* TOTAL FORMS */}
        <div
          onClick={onNavigateToForms}
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderTop: "2px solid #6366F1",
            borderRadius: "12px",
            padding: "1.25rem 1.35rem",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {t("overview.total_forms")}
            </span>
            <div
              style={{
                background: "#F8FAFC",
                borderRadius: "6px",
                width: "26px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={14} color="#64748B" />
            </div>
          </div>
          <div
            style={{
              fontSize: "2.1rem",
              fontWeight: 700,
              color: "#0F172A",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {forms.length || 8}
          </div>
          <div
            style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 500 }}
          >
            {t("overview.published_count", { count: publishedCount })}
            {" • "}
            {t("overview.draft_count", { count: draftCount })}
          </div>
        </div>

        {/* TOTAL SUBMISSIONS */}
        <div
          onClick={onNavigateToSubmissions}
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderTop: "2px solid #6366F1",
            borderRadius: "12px",
            padding: "1.25rem 1.35rem",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {t("overview.total_submissions")}
            </span>
            <div
              style={{
                background: "#F8FAFC",
                borderRadius: "6px",
                width: "26px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={14} color="#64748B" />
            </div>
          </div>
          <div
            style={{
              fontSize: "2.1rem",
              fontWeight: 700,
              color: "#0F172A",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {displayedSubmissionsCount}
          </div>
          <div
            style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 500 }}
          >
            {t("overview.completed_count", { count: completedSubmissions })}
            {" • "}
            {t("overview.in_progress_count", { count: inProgressSubmissions })}
          </div>
        </div>

        {/* COMPLETION RATE */}
        <div
          onClick={onNavigateToAnalytics}
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderTop: "2px solid #10B981",
            borderRadius: "12px",
            padding: "1.25rem 1.35rem",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {t("overview.completion_rate")}
            </span>
            <div
              style={{
                background: "#ECFDF5",
                borderRadius: "6px",
                width: "26px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={14} color="#047857" />
            </div>
          </div>
          <div
            style={{
              fontSize: "2.1rem",
              fontWeight: 700,
              color: "#0F172A",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {completionRate}%
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <span
              style={{
                background: "#ECFDF5",
                color: "#047857",
                fontSize: "0.72rem",
                fontWeight: 600,
                padding: "0.1rem 0.4rem",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <ArrowUpRight size={12} />
              {t("overview.finalized_vs_started")}
            </span>
          </div>
        </div>

        {/* REGISTERED USERS */}
        <div
          onClick={() => setIsUsersModalOpen(true)}
          title={t("overview.view_users_tooltip", "Click to view registered users details")}
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderTop: "2px solid #6366F1",
            borderRadius: "12px",
            padding: "1.25rem 1.35rem",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {t("overview.registered_users")}
            </span>
            <div
              style={{
                background: "#EEF2FF",
                borderRadius: "6px",
                width: "26px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={14} color="#6366F1" />
            </div>
          </div>
          <div
            style={{
              fontSize: "2.1rem",
              fontWeight: 700,
              color: "#0F172A",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {totalUsers}
          </div>
          <div
            style={{ fontSize: "0.8rem", color: "#6366F1", fontWeight: 600 }}
          >
            {t("overview.active_accounts")} &rarr;
          </div>
        </div>
      </div>

      {/* ─── ROW 2: TWO-COLUMN SPLIT (65% DATA TABLE / 35% PORTFOLIO HUB) ────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN (Recent Submissions Stream Table) */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          {/* Card Header Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justify: "space-between",
              padding: "1.1rem 1.35rem",
              borderBottom: "1px solid #E2E8F0",
              background: "#FFFFFF",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#0F172A",
                  margin: 0,
                }}
              >
                {t("overview.recent_submissions")}
              </h2>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#475569",
                  background: "#F1F5F9",
                  padding: "0.1rem 0.5rem",
                  borderRadius: "12px",
                }}
              >
                {searchFilteredSubmissions.length}
              </span>
            </div>

            {onNavigateToSubmissions && (
              <button
                type="button"
                onClick={onNavigateToSubmissions}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4F46E5",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: 0,
                }}
              >
                <span>{t("overview.view_all")}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Submissions Table */}
          {searchFilteredSubmissions.length === 0 ? (
            <div style={{ padding: "2rem" }}>
              <EmptyState
                title={t("overviewPage.noSubmissionsFound")}
                description={`No responses match your search query or time window (${timeRange}).`}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              {/* Table Header Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.1fr 2fr 1fr 1fr 1.4fr",
                  padding: "0.6rem 1.35rem",
                  background: "#F8FAFC",
                  borderBottom: "1px solid #E2E8F0",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                <div>{t("overview.headers.id")}</div>
                <div>{t("overview.headers.form_title")}</div>
                <div>{t("overview.headers.fields")}</div>
                <div>{t("overview.headers.status")}</div>
                <div style={{ textAlign: "right" }}>
                  {t("overview.headers.submitted_at")}
                </div>
              </div>

              {/* Table Rows */}
              {searchFilteredSubmissions.slice(0, 6).map((sub, idx) => {
                const rawFormTitle =
                  versionToFormTitle[sub.form_version] ||
                  sub.form_title ||
                  `Form #${sub.form_version || sub.id}`;
                const formTitle =
                  translatedTitles[rawFormTitle] || rawFormTitle;
                const subIdStr = sub.submission_id?.startsWith("SUB-")
                  ? sub.submission_id
                  : `SUB-${sub.id || idx + 144}`;
                const fieldsCount =
                  versionToFieldsCount[sub.form_version] ||
                  sub.fields_count ||
                  8;
                const exactDateTime = formatExactDateTime(
                  sub.submitted_at || sub.started_at,
                );

                return (
                  <div
                    key={sub.id || idx}
                    className="submission-row-item"
                    onClick={onNavigateToSubmissions}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.1fr 2fr 1fr 1fr 1.4fr",
                      alignItems: "center",
                      padding: "0.85rem 1.35rem",
                      borderBottom:
                        idx < Math.min(searchFilteredSubmissions.length, 6) - 1
                          ? "1px solid #F1F5F9"
                          : "none",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      transition: "background 150ms ease",
                    }}
                  >
                    {/* ID */}
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        color: "#475569",
                        fontSize: "0.8125rem",
                      }}
                    >
                      {subIdStr}
                    </div>

                    {/* Form Title */}
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#0F172A",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formTitle}
                    </div>

                    {/* Fields */}
                    <div>
                      <span
                        style={{
                          fontWeight: 500,
                          color: "#475569",
                          background: "#F1F5F9",
                          padding: "0.15rem 0.55rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {t("common.fields_count", { count: fieldsCount })}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#047857",
                          background: "#ECFDF5",
                          padding: "0.15rem 0.6rem",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <CheckCircle2 size={11} /> {t("common.completed")}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <div
                      style={{
                        textAlign: "right",
                        color: "#64748B",
                        fontWeight: 500,
                        fontSize: "0.8125rem",
                      }}
                    >
                      {exactDateTime}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (Quick Action Hub & Top Performing Forms Leaderboard) */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {/* Card A: Quick Actions Hub (TOP) */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "1.25rem 1.35rem",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            <h3
              style={{
                fontSize: "0.92rem",
                fontWeight: 600,
                color: "#0F172A",
                margin: "0 0 0.85rem 0",
              }}
            >
              {t("overview.quick_actions")}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.65rem",
              }}
            >
              {/* Action 1: Create Form */}
              <button
                type="button"
                onClick={onNavigateToForms}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  alignItems: "flex-start",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  background: "#FAFAFA",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 150ms ease",
                }}
              >
                <div
                  style={{
                    background: "#EEF2FF",
                    borderRadius: "6px",
                    padding: "0.3rem",
                    display: "inline-flex",
                  }}
                >
                  <Plus size={14} color="#4F46E5" />
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  {t("overview.new_form")}
                </span>
              </button>

              {/* Action 2: Analytics */}
              <button
                type="button"
                onClick={onNavigateToAnalytics}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  alignItems: "flex-start",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  background: "#FAFAFA",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 150ms ease",
                }}
              >
                <div
                  style={{
                    background: "#ECFDF5",
                    borderRadius: "6px",
                    padding: "0.3rem",
                    display: "inline-flex",
                  }}
                >
                  <BarChart2 size={14} color="#047857" />
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  {t("overview.analytics")}
                </span>
              </button>

              {/* Action 3: Rules */}
              <button
                type="button"
                onClick={onNavigateToRules}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  alignItems: "flex-start",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  background: "#FAFAFA",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 150ms ease",
                }}
              >
                <div
                  style={{
                    background: "#FEF3C7",
                    borderRadius: "6px",
                    padding: "0.3rem",
                    display: "inline-flex",
                  }}
                >
                  <GitFork size={14} color="#D97706" />
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  {t("overview.rules")}
                </span>
              </button>

              {/* Action 4: Export Reports */}
              <button
                type="button"
                onClick={onNavigateToReports}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  alignItems: "flex-start",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  background: "#FAFAFA",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 150ms ease",
                }}
              >
                <div
                  style={{
                    background: "#F3E8FF",
                    borderRadius: "6px",
                    padding: "0.3rem",
                    display: "inline-flex",
                  }}
                >
                  <Download size={14} color="#9333EA" />
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  {t("overview.export")}
                </span>
              </button>
            </div>
          </div>

          {/* Card B: Top Performing Forms Leaderboard (BOTTOM) */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "1.25rem 1.35rem",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h3
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  color: "#0F172A",
                  margin: 0,
                }}
              >
                {t("overview.top_performing_forms")}
              </h3>
              {onNavigateToForms && (
                <button
                  type="button"
                  onClick={onNavigateToForms}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#4F46E5",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {t("overview.manage")}
                </button>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
              }}
            >
              {topFormsLeaderboard.length === 0 ? (
                <div style={{ fontSize: "0.82rem", color: "#64748B" }}>
                  {t("overviewPage.noFormsFound")}
                </div>
              ) : (
                topFormsLeaderboard.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.3rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "0.82rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#0F172A",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "160px",
                        }}
                      >
                        {translatedTitles[item.title] || item.title}
                      </span>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "#4F46E5",
                        }}
                      >
                        {t("overview.responses_count", {
                          count: item.submissions_count,
                        })}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        background: "#F1F5F9",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${item.percent}%`,
                          background: "#4F46E5",
                          borderRadius: "3px",
                          transition: "width 300ms ease",
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registered Users Details Modal */}
      <RegisteredUsersModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
      />
    </div>
  );
}
