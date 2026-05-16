import { useRef, useState } from 'react';

export function HoverButton({
  children,
  onClick,
  className = '',
  disabled = false,
  glowColor = '#6366f1',
  backgroundColor = '#0a0a0a',
  textColor = '#ffffff',
  hoverTextColor = '#a5b4fc',
}) {
  const buttonRef = useRef(null);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setGlowPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center justify-center px-6 py-2.5 border-none cursor-pointer overflow-hidden transition-colors duration-300 rounded-lg font-medium text-sm z-10 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{ backgroundColor, color: isHovered ? hoverTextColor : textColor }}
    >
      <div
        className="absolute w-48 h-48 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
        style={{
          left: glowPosition.x,
          top: glowPosition.y,
          background: `radial-gradient(circle, ${glowColor} 10%, transparent 70%)`,
          opacity: isHovered ? 0.5 : 0,
          transform: `translate(-50%, -50%) scale(${isHovered ? 1.2 : 0})`,
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
