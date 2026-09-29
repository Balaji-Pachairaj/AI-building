import React, { useMemo } from 'react';

/**
 * TokenGraphWire Component
 *
 * Renders aesthetic SVG Bezier wires connecting the source node pin (right of input box)
 * to each of the 5 target node pins (left of each next token box).
 * Always present on the screen as requested.
 * Supports active data pulse animations during OpenAI generation.
 */
const TokenGraphWire = ({
  stageRef,
  sourceRef,
  targetRefs,
  isLoading = false,
  activeIndices = [0, 1, 2, 3, 4],
}) => {
  const [wirePaths, setWirePaths] = React.useState([]);

  // Compute bezier curve paths based on bounding rectangles
  const updateWireCoords = React.useCallback(() => {
    if (!stageRef.current || !sourceRef.current) return;

    const stageRect = stageRef.current.getBoundingClientRect();
    const sourceRect = sourceRef.current.getBoundingClientRect();

    // Center coordinates relative to the stage container
    const x1 = sourceRect.left + sourceRect.width / 2 - stageRect.left;
    const y1 = sourceRect.top + sourceRect.height / 2 - stageRect.top;

    const paths = targetRefs.map((targetRef, index) => {
      if (!targetRef.current) return null;

      const targetRect = targetRef.current.getBoundingClientRect();
      const x2 = targetRect.left + targetRect.width / 2 - stageRect.left;
      const y2 = targetRect.top + targetRect.height / 2 - stageRect.top;

      const dx = Math.max(40, x2 - x1);
      // S-curve cubic bezier control points
      const cx1 = x1 + dx * 0.42;
      const cy1 = y1;
      const cx2 = x2 - dx * 0.42;
      const cy2 = y2;

      const d = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

      return {
        id: `wire-${index}`,
        index,
        d,
        x1,
        y1,
        x2,
        y2,
      };
    });

    setWirePaths(paths.filter(Boolean));
  }, [stageRef, sourceRef, targetRefs]);

  // Recalculate on mount, window resize, or DOM mutations
  React.useLayoutEffect(() => {
    updateWireCoords();

    const handleResize = () => {
      requestAnimationFrame(updateWireCoords);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateWireCoords);
    });

    if (stageRef.current) {
      resizeObserver.observe(stageRef.current);
    }

    // Delayed update to ensure full layout stabilization
    const timer = setTimeout(updateWireCoords, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [updateWireCoords, stageRef]);

  return (
    <svg className="cosmic-wires-svg" aria-hidden="true">
      <defs>
        {/* Glow Filters */}
        <filter id="wireNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="wireGradientIdle" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#c084fc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id="wireGradientActive" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
        </linearGradient>
      </defs>

      {wirePaths.map((wire) => {
        const isActive = activeIndices.includes(wire.index);
        return (
          <g key={wire.id}>
            {/* Background Base Wire - Always Present */}
            <path d={wire.d} className="cosmic-wire-path-bg" />

            {/* Glowing Wire Core */}
            <path
              d={wire.d}
              className={`cosmic-wire-path-glow ${isActive && !isLoading ? 'cosmic-wire-path-active' : ''}`}
              stroke={isLoading ? 'url(#wireGradientActive)' : 'url(#wireGradientIdle)'}
            />

            {/* Live Data Pulse Animation streaming from input to tokens */}
            <path
              d={wire.d}
              className={`cosmic-wire-pulse ${isLoading ? 'speedup' : ''}`}
            />

            {/* Source Pin Ring */}
            <circle
              cx={wire.x1}
              cy={wire.y1}
              r="4"
              fill="#38bdf8"
              filter="url(#wireNeonGlow)"
            />

            {/* Target Pin Ring */}
            <circle
              cx={wire.x2}
              cy={wire.y2}
              r="4.5"
              fill={isActive ? '#38bdf8' : '#818cf8'}
              filter="url(#wireNeonGlow)"
            />
          </g>
        );
      })}
    </svg>
  );
};

export default TokenGraphWire;
