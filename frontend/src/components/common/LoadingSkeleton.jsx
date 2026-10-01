import React from 'react';

export const LoadingSkeleton = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-md)', count = 1 }) => {
  const skeletons = Array.from({ length: count });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {skeletons.map((_, i) => (
        <div
          key={i}
          style={{
            width,
            height,
            borderRadius,
            backgroundColor: 'var(--color-border-subtle)',
            backgroundImage: 'linear-gradient(90deg, var(--color-border-subtle) 0px, var(--color-surface-hover) 40px, var(--color-border-subtle) 80px)',
            backgroundSize: '300px 100%',
            animation: 'pulseShimmer 1.5s infinite linear',
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
