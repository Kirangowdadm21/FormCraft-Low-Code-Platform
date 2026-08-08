import React from "react";
import { Search } from "lucide-react";

export function Input({
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = "",
  ...props
}) {
  return (
    <div className="fc-input-wrapper">
      {LeftIcon && (
        <LeftIcon size={16} className="fc-input-icon fc-input-icon-left" />
      )}
      <input
        className={`fc-input ${LeftIcon ? "has-left-icon" : ""} ${RightIcon ? "has-right-icon" : ""} ${error ? "is-error" : ""} ${className}`}
        {...props}
      />
      {RightIcon && (
        <RightIcon size={16} className="fc-input-icon fc-input-icon-right" />
      )}
    </div>
  );
}

export function Select({ error, children, className = "", ...props }) {
  return (
    <div className="fc-select-wrapper">
      <select
        className={`fc-select ${error ? "is-error" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function SearchInput({
  placeholder = "Search...",
  value,
  onChange,
  className = "",
  ...props
}) {
  return (
    <Input
      type="text"
      leftIcon={Search}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`fc-search-input ${className}`}
      {...props}
    />
  );
}

export default Input;
