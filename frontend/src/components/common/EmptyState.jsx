import React from "react";
import { FileQuestion } from "lucide-react";

export default function EmptyState({
  icon: Icon = FileQuestion,
  title = "No items found",
  description = "There are no items to display at this time.",
  action,
  className = "",
}) {
  return (
    <div className={`fc-empty-state ${className}`}>
      <div className="fc-empty-state-icon">
        <Icon size={28} />
      </div>
      <h3 className="fc-empty-state-title">{title}</h3>
      {description && (
        <p className="fc-empty-state-description">{description}</p>
      )}
      {action && <div className="fc-empty-state-action">{action}</div>}
    </div>
  );
}
