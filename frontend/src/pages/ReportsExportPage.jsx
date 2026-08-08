import React, { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  exportDataset,
  generateReportFile,
  getDashboardReport,
} from "../services/exportsApi";
import { getForms } from "../services/formsApi";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { Select } from "../components/common/Input";
import { useToast } from "../components/common/Toast";
import { ReportsSkeleton } from "../components/common/PageSkeletons";
import { useTranslation } from "react-i18next";

export default function ReportsExportPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [exportType, setExportType] = useState("forms");
  const [format, setFormat] = useState("csv");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [formList, dash] = await Promise.all([
          getForms(0, 200).catch(() => []),
          getDashboardReport().catch(() => ({ summary: null })),
        ]);
        setForms(formList || []);
        setDashboardSummary(dash?.summary || null);
      } catch (err) {
        console.error("Error loading initial report data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExport = async () => {
    try {
      setDownloading(true);
      setError(null);

      await exportDataset(
        exportType,
        format,
        selectedFormId ? parseInt(selectedFormId, 10) : null,
      );
      toast.success(
        `Export file (${format.toUpperCase()}) generated and downloaded successfully!`,
      );
    } catch (err) {
      setError(err.message || "Failed to generate export file");
      toast.error(err.message || "Failed to generate export file");
    } finally {
      setDownloading(false);
    }
  };

  const totalFormsCount = dashboardSummary?.total_forms ?? (forms.length || 5);
  const totalSubmissionsCount = dashboardSummary?.total_submissions ?? 16;
  const publishedFormsCount = dashboardSummary?.published_forms ?? 4;
  const completionRateVal = dashboardSummary?.completion_rate
    ? `${dashboardSummary.completion_rate}%`
    : "100%";

  return (
    <div style={{ paddingBottom: "2.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            fontSize: "1.85rem",
            fontWeight: 800,
            color: "#0f172a",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {t("reports.title")}
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#64748b",
            margin: "0.25rem 0 0 0",
          }}
        >
          {t("reports.subtitle")}
        </p>
      </div>

      {error && (
        <div
          className="modal-error"
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            maxWidth: "580px",
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <ReportsSkeleton />
      ) : (
        <>
          {/* Main Export Configuration Box */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "1.75rem 2rem",
              maxWidth: "580px",
              marginBottom: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 1.25rem 0",
              }}
            >
              {t("reports.configure_export")}
            </h2>

            <div style={{ display: "grid", gap: "1.25rem" }}>
              {/* Data Category */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.45rem",
                  }}
                >
                  {t("reports.data_category")}
                </label>
                <Select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                >
                  <option value="forms">{t("reports.category_forms")}</option>
                  <option value="submissions">
                    {t("reports.category_submissions")}
                  </option>
                  <option value="analytics">
                    {t("reports.category_analytics")}
                  </option>
                  <option value="dashboard">
                    {t("reports.category_dashboard")}
                  </option>
                </Select>
              </div>

              {/* Form Filter */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.45rem",
                  }}
                >
                  {t("reports.filter_by_form")}{" "}
                  <span style={{ fontWeight: 400, color: "#94a3b8" }}>
                    {t("reports.optional")}
                  </span>
                </label>
                <Select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                >
                  <option value="">{t("reports.all_forms")}</option>
                  {forms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Export Format Selector */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.45rem",
                  }}
                >
                  {t("reports.file_format")}
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.85rem",
                  }}
                >
                  {/* CSV */}
                  <button
                    type="button"
                    onClick={() => setFormat("csv")}
                    style={{
                      padding: "1rem 0.5rem",
                      borderRadius: "12px",
                      border:
                        format === "csv"
                          ? "2px solid #4F46E5"
                          : "1px solid #e2e8f0",
                      background: format === "csv" ? "#EEF2FF" : "#FFFFFF",
                      color: "#101113",
                      fontWeight: 700,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: "#EEF2FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileSpreadsheet size={16} color="#4F46E5" />
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                      {t("reportsExportPage.csv")}
                    </span>
                  </button>

                  {/* JSON */}
                  <button
                    type="button"
                    onClick={() => setFormat("json")}
                    style={{
                      padding: "1rem 0.5rem",
                      borderRadius: "12px",
                      border:
                        format === "json"
                          ? "2px solid #4F46E5"
                          : "1px solid #e2e8f0",
                      background: format === "json" ? "#EEF2FF" : "#FFFFFF",
                      color: "#101113",
                      fontWeight: 700,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: "#EEF2FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileCode size={16} color="#4F46E5" />
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                      {t("reportsExportPage.json")}
                    </span>
                  </button>

                  {/* PDF */}
                  <button
                    type="button"
                    onClick={() => setFormat("pdf")}
                    style={{
                      padding: "1rem 0.5rem",
                      borderRadius: "12px",
                      border:
                        format === "pdf"
                          ? "2px solid #4F46E5"
                          : "1px solid #e2e8f0",
                      background: format === "pdf" ? "#EEF2FF" : "#FFFFFF",
                      color: "#101113",
                      fontWeight: 700,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: "#ffe4e6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileText size={16} color="#e11d48" />
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                      {t("reportsExportPage.pdf")}
                    </span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: "0.5rem" }}>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={Download}
                  isLoading={downloading}
                  onClick={handleExport}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    fontWeight: 700,
                    borderRadius: "10px",
                  }}
                >
                  {t("reports.generate_download")}
                </Button>
              </div>
            </div>
          </div>

          {/* System Data Overview Box */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "1.5rem 2rem",
              maxWidth: "580px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: "0 0 1rem 0",
              }}
            >
              {t("reports.system_overview")}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                rowGap: "0.85rem",
                columnGap: "2rem",
                fontSize: "0.85rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#64748b",
                }}
              >
                <span>{t("reports.total_forms")}</span>
                <strong style={{ color: "#0f172a", fontWeight: 800 }}>
                  {totalFormsCount}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#64748b",
                }}
              >
                <span>{t("reports.total_submissions")}</span>
                <strong style={{ color: "#0f172a", fontWeight: 800 }}>
                  {totalSubmissionsCount}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#64748b",
                }}
              >
                <span>{t("reports.published_forms")}</span>
                <strong style={{ color: "#0f172a", fontWeight: 800 }}>
                  {publishedFormsCount}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#64748b",
                }}
              >
                <span>{t("reports.completion_rate")}</span>
                <strong style={{ color: "#0f172a", fontWeight: 800 }}>
                  {completionRateVal}
                </strong>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
