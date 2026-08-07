'use client';

const OnlineStatusDot = ({
  visible = false,
  size = 11,
  borderColor = 'var(--bs-body-bg, #fff)',
  className = '',
}) => {
  if (!visible) return null;

  return (
    <span
      className={`messaging-online-dot ${className}`.trim()}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderColor,
      }}
      aria-hidden="true"
    />
  );
};

export default OnlineStatusDot;
