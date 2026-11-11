import React from 'react';
import { Link } from 'react-router-dom';

/**
 * GlassButton
 * Reusable glassmorphic button component with translucent white background,
 * backdrop blur, 1px light border, soft shadow with inner specular highlight,
 * hover lift, accessible focus ring, and active glowing indigo-violet gradient.
 */
const GlassButton = ({
  children,
  to,
  href,
  onClick,
  variant = 'default', // 'default' | 'active' | 'primary' | 'surface'
  size = 'md',        // 'sm' | 'md' | 'lg' | 'icon'
  isActive = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  title,
  ariaLabel,
  ...props
}) => {
  // Determine variant class
  let variantClass = 'glass-btn';
  if (isActive || variant === 'active') {
    variantClass = 'glass-btn-active';
  } else if (variant === 'primary') {
    variantClass = 'glass-btn-primary';
  } else if (variant === 'surface') {
    variantClass = 'glass-btn-surface';
  }

  // Determine size classes
  let sizeClass = 'px-4 py-2 text-xs';
  if (size === 'sm') {
    sizeClass = 'px-3 py-1.5 text-xs';
  } else if (size === 'lg') {
    sizeClass = 'px-6 py-3 text-sm';
  } else if (size === 'icon') {
    sizeClass = 'w-9 h-9 p-0';
  }

  const combinedClasses = `${variantClass} ${sizeClass} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`.trim();

  const content = (
    <>
      {Icon && <Icon className={`w-4 h-4 ${children ? 'mr-1.5' : ''} flex-shrink-0`} />}
      {children}
    </>
  );

  if (to && !disabled) {
    return (
      <Link
        to={to}
        className={combinedClasses}
        title={title}
        aria-label={ariaLabel || title}
        {...props}
      >
        {content}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a
        href={href}
        className={combinedClasses}
        title={title}
        aria-label={ariaLabel || title}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      title={title}
      aria-label={ariaLabel || title}
      {...props}
    >
      {content}
    </button>
  );
};

export default GlassButton;
