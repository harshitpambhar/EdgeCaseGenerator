import { useState, useMemo } from 'react';

const JS_RIPPLE_KEYFRAMES = `
  @keyframes js-ripple-animation {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
  }
  .animate-js-ripple-effect {
    animation: js-ripple-animation var(--ripple-duration) ease-out forwards;
  }
`;

const GRID_NUM_COLS = 36;
const GRID_NUM_ROWS = 12;
const GRID_TOTAL = GRID_NUM_COLS * GRID_NUM_ROWS;
const GRID_RIPPLE_SIZE = '18.973665961em';

export function RippleButton({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'default',
  rippleColor,
  rippleDuration = 600,
  hoverBaseColor = '#6366f1',
  hoverRippleColor,
  hoverBorderEffectColor = '#6366f177',
  hoverBorderEffectThickness = '0.3em',
}) {
  const [ripples, setRipples] = useState([]);

  const jsRippleColor = rippleColor || 'var(--button-ripple-color, rgba(0,0,0,0.1))';

  const gridStyles = useMemo(() => {
    if (variant !== 'hover' && variant !== 'hoverborder') return '';
    const dur = '0.9s';
    let nth = '';
    for (let r = 0; r < GRID_NUM_ROWS; r++) {
      for (let c = 0; c < GRID_NUM_COLS; c++) {
        const i = r * GRID_NUM_COLS + c + 1;
        const top = 0.125 + r * 0.25;
        const left = 0.1875 + c * 0.25;
        if (variant === 'hover') {
          nth += `.hover-grid-cell:nth-child(${i}):hover ~ .hover-visual-ripple { top:${top}em;left:${left}em;transition:width ${dur} ease,height ${dur} ease,top 0s,left 0s; }`;
        } else {
          nth += `.hoverborder-grid-cell:nth-child(${i}):hover ~ .hoverborder-visual-ripple { top:${top}em;left:${left}em;transition:width ${dur} ease-out,height ${dur} ease-out,top 0s,left 0s; }`;
        }
      }
    }
    if (variant === 'hover') {
      const color = hoverRippleColor || `${hoverBaseColor}77`;
      return `.hover-visual-ripple{background:${color};transition:width .9s ease,height .9s ease,top 99999s,left 99999s}.hover-grid-cell:hover~.hover-visual-ripple{width:${GRID_RIPPLE_SIZE};height:${GRID_RIPPLE_SIZE}}${nth}`;
    }
    return `.hoverborder-ripple-container{padding:${hoverBorderEffectThickness};mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude;-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor}.hoverborder-visual-ripple{background:${hoverBorderEffectColor};transition:width .9s ease-out,height .9s ease-out,top 99999s,left 9999s}.hoverborder-grid-cell:hover~.hoverborder-visual-ripple{width:${GRID_RIPPLE_SIZE};height:${GRID_RIPPLE_SIZE}}${nth}`;
  }, [variant, hoverBaseColor, hoverRippleColor, hoverBorderEffectColor, hoverBorderEffectThickness]);

  const addRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const key = Date.now();
    setRipples(p => [...p, { key, x, y, size }]);
    setTimeout(() => setRipples(p => p.filter(r => r.key !== key)), rippleDuration);
  };

  const handleClick = (e) => {
    if (!disabled) { addRipple(e); onClick?.(e); }
  };

  const rippleEls = (
    <div className="absolute inset-0 pointer-events-none z-[5]">
      {ripples.map(r => (
        <span key={r.key} className="absolute rounded-full animate-js-ripple-effect"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size, backgroundColor: jsRippleColor, '--ripple-duration': `${rippleDuration}ms` }} />
      ))}
    </div>
  );

  const gridCells = (cellClass) =>
    Array.from({ length: GRID_TOTAL }, (_, i) => (
      <span key={i} className={`${cellClass} relative flex justify-center items-center pointer-events-auto`} />
    ));

  if (variant === 'hover') {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: JS_RIPPLE_KEYFRAMES + gridStyles }} />
        <button onClick={handleClick} disabled={disabled}
          className={`relative rounded-lg text-sm px-4 py-2 border-none bg-transparent isolate overflow-hidden cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
          <span className="relative z-[10] pointer-events-none">{children}</span>
          {rippleEls}
          <div className="absolute inset-0 grid overflow-hidden pointer-events-none z-0"
            style={{ gridTemplateColumns: `repeat(${GRID_NUM_COLS}, 0.25em)` }}>
            {gridCells('hover-grid-cell')}
            <div className="hover-visual-ripple pointer-events-none absolute w-0 h-0 rounded-full -translate-x-1/2 -translate-y-1/2 top-0 left-0 z-[-1]" />
          </div>
        </button>
      </>
    );
  }

  if (variant === 'hoverborder') {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: JS_RIPPLE_KEYFRAMES + gridStyles }} />
        <button onClick={handleClick} disabled={disabled}
          className={`relative rounded-lg text-sm px-4 py-2 border-none bg-transparent isolate overflow-hidden cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
          <span className="relative z-[10] pointer-events-none">{children}</span>
          {rippleEls}
          <div className="hoverborder-ripple-container absolute inset-0 grid rounded-[0.8em] overflow-hidden pointer-events-none z-0"
            style={{ gridTemplateColumns: `repeat(${GRID_NUM_COLS}, 0.25em)` }}>
            {gridCells('hoverborder-grid-cell')}
            <div className="hoverborder-visual-ripple pointer-events-none absolute w-0 h-0 rounded-full -translate-x-1/2 -translate-y-1/2 top-0 left-0 z-[-1]" />
          </div>
        </button>
      </>
    );
  }

  if (variant === 'ghost') {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: JS_RIPPLE_KEYFRAMES }} />
        <button onClick={handleClick} disabled={disabled}
          className={`relative border-none bg-transparent isolate overflow-hidden cursor-pointer px-4 py-2 rounded-lg text-sm ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
          <span className="relative z-10 pointer-events-none">{children}</span>
          {rippleEls}
        </button>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: JS_RIPPLE_KEYFRAMES }} />
      <button onClick={handleClick} disabled={disabled}
        className={`relative border-none overflow-hidden isolate cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        <span className="relative z-[1] pointer-events-none">{children}</span>
        {rippleEls}
      </button>
    </>
  );
}
