/**
 * Decorative mint sprigs drifting around the menu panel, like fresh
 * garnish scattered on a printed menu. Purely ornamental: hidden from
 * assistive tech and never intercepts clicks. The blurred ones read as
 * out-of-focus leaves closer to the camera.
 */
function Sprig({ className }) {
  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden>
      <defs>
        <linearGradient id="mint-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8BD86A" />
          <stop offset="100%" stopColor="#2F9A3A" />
        </linearGradient>
      </defs>
      <path d="M58 58 C 30 70, 6 56, 4 30 C 30 22, 52 32, 58 58Z" fill="url(#mint-leaf)" />
      <path d="M58 58 C 72 32, 98 20, 116 34 C 106 60, 82 70, 58 58Z" fill="url(#mint-leaf)" />
      <path d="M58 58 C 44 76, 46 96, 62 108 C 76 92, 74 72, 58 58Z" fill="url(#mint-leaf)" />
      <g stroke="#1F6E2A" strokeOpacity="0.45" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M58 58 C 40 50, 22 40, 8 31" />
        <path d="M58 58 C 78 48, 96 40, 112 35" />
        <path d="M58 58 C 60 76, 60 90, 62 104" />
      </g>
    </svg>
  )
}

const LEAVES = [
  { position: 'top-6 -left-6 w-24 rotate-[-20deg]', blur: '' },
  { position: 'top-[28%] -right-8 w-28 rotate-[35deg]', blur: 'blur-[2px]' },
  { position: 'top-[55%] left-[2%] w-10 rotate-[10deg]', blur: '' },
  { position: 'bottom-[18%] -right-4 w-16 rotate-[-45deg]', blur: '' },
  { position: '-bottom-6 left-[12%] w-28 rotate-[60deg]', blur: 'blur-[3px]' },
  { position: 'top-3 right-[30%] w-9 rotate-[80deg]', blur: 'blur-[1px]' },
]

export function MintLeaves() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {LEAVES.map(({ position, blur }, index) => (
        <div
          key={position}
          className={`absolute ${position} ${blur} ${index % 2 ? 'animate-float-slower' : 'animate-float-slow'} drop-shadow-[0_8px_10px_rgba(60,40,20,0.25)]`}
        >
          <Sprig className="h-auto w-full" />
        </div>
      ))}
    </div>
  )
}
