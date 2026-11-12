/** Client logo, framed to its wide central band (same crop as the staff app). */
export function BrandLogo({ width = 148 }: { width?: number }) {
  return (
    <img className="k-logo" src="/kitchen/restosphere-logo-560.png" width={width} height={Math.round(width * 132 / 560)}
      alt="RestoSphere – Restaurant Management System" />
  )
}
