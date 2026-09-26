/** NammaQR brand logo — green tile with chef hat + NQ monogram */
type Props = {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export function NammaQrLogo({
  className = '',
  size = 40,
  showWordmark = false,
  wordmarkClassName = '',
}: Props) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="NammaQR"
      >
        <rect width="64" height="64" rx="14" fill="#0A5D3B" />
        {/* Chef hat */}
        <path
          d="M22 20c0-3.2 2.2-5.8 5.2-6.5C28.1 11.5 30 10.5 32 10.5c2 0 3.9 1 4.8 3 3 .7 5.2 3.3 5.2 6.5 0 1.1-.3 2.1-.7 3H22.7c-.4-.9-.7-1.9-.7-3z"
          fill="#E8F5EF"
        />
        <rect x="23" y="23" width="18" height="3.5" rx="1" fill="#E8F5EF" />
        {/* N */}
        <path
          d="M18 42V28h3.2l6.2 9.2V28H31v14h-3.2l-6.2-9.2V42H18z"
          fill="#FFFFFF"
        />
        {/* Q */}
        <path
          d="M41.5 35c0-4.7-3.4-8.2-8-8.2S25.5 30.3 25.5 35s3.4 8.2 8 8.2c1.5 0 2.9-.4 4.1-1l1.8 1.8 2.2-2.2-1.7-1.7c1-1.3 1.6-3 1.6-4.9zm-8 5.2c-2.9 0-5-2.3-5-5.2s2.1-5.2 5-5.2 5 2.3 5 5.2-2.1 5.2-5 5.2z"
          fill="#FFFFFF"
        />
      </svg>
      {showWordmark && (
        <span
          className={`font-bold tracking-tight text-white ${wordmarkClassName}`}
          style={{ fontSize: Math.max(18, size * 0.55) }}
        >
          Namma<span className="text-[#7CFFB2]">QR</span>
        </span>
      )}
    </div>
  );
}

export default NammaQrLogo;
