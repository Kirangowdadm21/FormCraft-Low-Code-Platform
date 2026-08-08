import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary", // primary | secondary | outline | ghost | danger
  size = "md", // sm | md | lg
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      className={`fc-btn fc-btn-${variant} fc-btn-${size} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size === "sm" ? 14 : 16} className="fc-spin" />
      ) : (
        LeftIcon && (
          <LeftIcon
            size={size === "sm" ? 14 : 16}
            className="fc-btn-icon-left"
          />
        )
      )}
      <span>{children}</span>
      {!isLoading && RightIcon && (
        <RightIcon
          size={size === "sm" ? 14 : 16}
          className="fc-btn-icon-right"
        />
      )}
    </button>
  );
}
