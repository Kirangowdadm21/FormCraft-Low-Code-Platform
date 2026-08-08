import { useTranslation } from "react-i18next";
import React from "react";
import { Send, Loader2 } from "lucide-react";
export default function SubmitButton({ isSubmitting, disabled, label }) {
  const { t } = useTranslation();
  return (
    <button
      type="submit"
      disabled={isSubmitting || disabled}
      className="public-submit-btn"
      aria-busy={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>{t("submitButton.submittingResponse")}</span>
        </>
      ) : (
        <>
          <span>{label || "Submit Response"}</span>
          <Send size={18} />
        </>
      )}
    </button>
  );
}
