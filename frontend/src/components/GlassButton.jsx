import React from 'react';
import { Link } from 'react-router-dom';

/**
 * GlassDot
 * Glowing emerald live status indicator dot
 */
export const GlassDot = ({ className = '' }) => (
  <span className={`glass-dot ${className}`} aria-hidden="true" />
);

/**
 * GlassTab
 * Floating capsule tab button with optional micro-tag badge (e.g. "Lab", "Survey")
 */
export const GlassTab = ({
  to,
  isActive = false,
  icon: Icon,
  label,
  children,
  tag,
  onClick,
  className = '',
  title,
  ariaLabel,
  ...props
}) => {
  const displayText = label || children;
  const combinedClasses = `glass-tab ${isActive ? 'glass-tab--active' : ''} ${className}`.trim();

  const content = (
    <>
      {Icon && <Icon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />}
      <span>{displayText}</span>
      {tag && <span className="glass-tab-tag">{tag}</span>}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={combinedClasses}
        title={title || (typeof displayText === 'string' ? displayText : undefined)}
        aria-label={ariaLabel || title || (typeof displayText === 'string' ? displayText : undefined)}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={combinedClasses}
      title={title || (typeof displayText === 'string' ? displayText : undefined)}
      aria-label={ariaLabel || title || (typeof displayText === 'string' ? displayText : undefined)}
      {...props}
    >
      {content}
    </button>
  );
};

/**
 * GlassButton
 * Reusable glassmorphic button component supporting:
 * - Variants: default | primary | ai | success | warning | white | light | icon
 * - Sizes: sm | md | lg | icon
 * - Modes: to (Link) | href (a) | onClick (button)
 */
export const GlassButton = ({
  children,
  to,
  href,
  onClick,
  variant = 'default', // 'default' | 'primary' | 'ai' | 'success' | 'warning' | 'white' | 'light' | 'icon'
  size = 'md',        // 'sm' | 'md' | 'lg' | 'icon'
  isActive = false,
  isIcon = false,
  isFab = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  title,
  ariaLabel,
  ...props
}) => {
  // Determine variant class
  let variantClass = 'glass-btn--default';
  if (variant === 'primary') variantClass = 'glass-btn--primary';
  else if (variant === 'ai') variantClass = 'glass-btn--ai';
  else if (variant === 'success') variantClass = 'glass-btn--success';
  else if (variant === 'warning') variantClass = 'glass-btn--warning';
  else if (variant === 'white') variantClass = 'glass-btn--white';
  else if (variant === 'light' || variant === 'surface') variantClass = 'glass-btn--light';
  else if (variant === 'icon') variantClass = 'glass-btn--icon';

  // Determine size class
  let sizeClass = 'px-5 py-2.5 text-xs';
  if (size === 'sm') sizeClass = 'px-3.5 py-1.5 text-xs';
  else if (size === 'lg') sizeClass = 'px-8 py-3.5 text-sm';
  else if (size === 'icon' || isIcon || variant === 'icon') sizeClass = 'glass-btn--icon';

  const baseClass = isFab ? 'glass-fab' : 'glass-btn';
  const activeClass = isActive ? 'glass-btn--active' : '';
  const iconClass = (isIcon || size === 'icon' || variant === 'icon') ? 'glass-btn--icon' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  const combinedClasses = `${baseClass} ${variantClass} ${sizeClass} ${iconClass} ${activeClass} ${disabledClass} ${className}`.trim();

  const content = (
    <>
      {Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''} flex-shrink-0`} />}
      {children}
    </>
  );

  if (to && !disabled) {
    return (
      <Link
        to={to}
        onClick={onClick}
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
        onClick={onClick}
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
