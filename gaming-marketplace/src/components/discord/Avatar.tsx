import React from 'react';
import './Avatar.css';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'idle' | 'dnd' | 'offline';
  className?: string;
  fallback?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  status,
  className = '',
  fallback
}) => {
  const classes = [
    'discord-avatar',
    `discord-avatar--${size}`,
    status && 'discord-avatar--with-status',
    className
  ].filter(Boolean).join(' ');

  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const showFallback = !src || imageError;

  return (
    <div className={classes}>
      <div className="discord-avatar__image">
        {showFallback ? (
          <div className="discord-avatar__fallback">
            {fallback || alt.charAt(0).toUpperCase() || '?'}
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            onError={handleImageError}
            className="discord-avatar__img"
          />
        )}
      </div>
      
      {status && (
        <div className={`discord-avatar__status discord-avatar__status--${status}`} />
      )}
    </div>
  );
};