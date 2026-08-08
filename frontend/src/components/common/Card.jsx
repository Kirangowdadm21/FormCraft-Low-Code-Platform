import React from "react";

export default function Card({
  children,
  className = "",
  interactive = false,
  padding = "p-6",
  onClick,
  ...props
}) {
  return (
    <div
      className={`fc-card ${interactive ? "fc-card-interactive" : ""} ${padding} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
