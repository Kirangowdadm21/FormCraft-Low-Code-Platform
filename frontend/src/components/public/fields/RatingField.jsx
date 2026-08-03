import React, { useState } from 'react';
import { Star, AlertCircle } from 'lucide-react';

export default function RatingField({ field, value, onChange, error, disabled }) {
  const fieldId = `field-${field.id}`;
  const maxStars = field.validation_conf?.max_value || 5;
  const currentRating = Number(value) || 0;
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starNum) => {
    if (disabled) return;
    onChange(starNum === currentRating ? 0 : starNum);
  };

  return (
    <div className="public-field-group">
      <label className="public-field-label">
        {field.label} {field.required && <span className="required-star">*</span>}
      </label>

      <div
        className="rating-stars-container"
        role="radiogroup"
        aria-label={`Rating for ${field.label}`}
      >
        {Array.from({ length: maxStars }, (_, i) => {
          const starNum = i + 1;
          const isFilled = starNum <= (hoverRating || currentRating);

          return (
            <button
              key={starNum}
              type="button"
              className={`rating-star-btn ${isFilled ? 'star-filled' : 'star-empty'}`}
              onClick={() => handleStarClick(starNum)}
              onMouseEnter={() => !disabled && setHoverRating(starNum)}
              onMouseLeave={() => !disabled && setHoverRating(0)}
              onFocus={() => !disabled && setHoverRating(starNum)}
              onBlur={() => !disabled && setHoverRating(0)}
              disabled={disabled}
              role="radio"
              aria-checked={currentRating === starNum}
              aria-label={`${starNum} star${starNum > 1 ? 's' : ''}`}
              title={`${starNum} star${starNum > 1 ? 's' : ''}`}
            >
              <Star
                size={28}
                fill={isFilled ? '#f59e0b' : 'transparent'}
                stroke={isFilled ? '#f59e0b' : '#D8D3C7'}
                strokeWidth={1.5}
              />
            </button>
          );
        })}

        {currentRating > 0 && (
          <span className="rating-current-text">{currentRating}/{maxStars}</span>
        )}
      </div>

      {error && (
        <div className="field-error-message" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
