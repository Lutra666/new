import { useState, useEffect, useCallback } from 'react';

function ThemeOverlay({ x, y, toDark, onApply, onDone }) {
  const [startReveal, setStartReveal] = useState(false);

  useEffect(() => {
    onApply();
    const raf = requestAnimationFrame(() => setStartReveal(true));
    return () => cancelAnimationFrame(raf);
    // onApply 仅在挂载时调用一次，故意忽略依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTransitionEnd = useCallback((e) => {
    if (e.propertyName === '--hole-radius') {
      onDone();
    }
  }, [onDone]);

  return (
    <div
      className={`theme-cover ${toDark ? 'from-light' : 'from-dark'}${startReveal ? ' revealing' : ''}`}
      style={{ '--ox': `${x}px`, '--oy': `${y}px` }}
      onTransitionEnd={handleTransitionEnd}
    />
  );
}

export default ThemeOverlay;
