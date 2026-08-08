import React from "react";

export default function Badge({
  children,
  variant = "neutral", // success | neutral | warning | danger | outline
  size = "md", // sm | md
  className = "",
  icon: Icon,
  ...props
}) {
  return (
    <span
      className={`fc-badge fc-badge-${variant} fc-badge-${size} ${className}`}
      {...props}
    >
      {Icon && <Icon size={12} className="fc-badge-icon" />}
      {children}
    </span>
  );
}
