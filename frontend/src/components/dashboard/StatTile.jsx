import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Card from "../common/Card";

export default function StatTile({
  label,
  value,
  delta,
  trend = "up",
  icon: Icon,
  sparkline = [30, 45, 38, 60, 52, 75, 90],
}) {
  const isUp = trend === "up";
  const maxVal = Math.max(...sparkline, 1);

  return (
    <Card className="stat-tile-dense" interactive={true}>
      <div className="stat-tile-header">
        <span className="stat-label-text">{label}</span>
        {Icon && <Icon size={16} className="stat-icon" />}
      </div>

      <div className="stat-value-container">
        <span className="stat-value-num">{value}</span>
        {delta && (
          <span className={`delta-chip ${isUp ? "up" : "down"}`}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta}
          </span>
        )}
      </div>

      {/* Embedded Sparkline Graphic */}
      <div className="sparkline-strip" title={`7-day trend (${delta})`}>
        {sparkline.map((val, idx) => {
          const heightPercent = Math.max(15, Math.round((val / maxVal) * 100));
          const isLast = idx === sparkline.length - 1;
          return (
            <div
              key={idx}
              className={`sparkline-bar ${isLast ? "active" : ""}`}
              style={{ height: `${heightPercent}%` }}
            />
          );
        })}
      </div>
    </Card>
  );
}
