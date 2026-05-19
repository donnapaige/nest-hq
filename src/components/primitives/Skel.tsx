interface SkelProps {
  w?: string | number;
  h?: number;
  r?: number;
  className?: string;
}

export function Skel({ w = '100%', h = 14, r = 8, className = '' }: SkelProps) {
  return (
    <div
      className={`animate-shimmer ${className}`}
      style={{
        width: typeof w === 'number' ? w : w,
        height: h,
        borderRadius: r,
        background: 'linear-gradient(90deg, #E8DFCB 0%, #EFF3F1 50%, #E8DFCB 100%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
}
