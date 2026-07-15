import { useState } from 'react';

export const EventImage = ({
  src,
  alt,
  className = 'catalog-card__img',
  fallbackClassName = 'catalog-card__img-fallback',
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={fallbackClassName}>
        <span className={`${fallbackClassName}-icon`}>🖼️</span>
        <span className={`${fallbackClassName}-text`}>Foto no disponible</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};