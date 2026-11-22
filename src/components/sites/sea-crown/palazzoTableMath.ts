export const PALAZZO_COURSE_COUNT = 8
export const PALAZZO_STEP = 360 / PALAZZO_COURSE_COUNT

export type PalazzoTableMetrics = {
  stageSize: number
  orbitRadius: number
  plateSize: number
  centerX: number
  centerY: number
  frontAngle: number
  compact: boolean
}

export function normalizeAngle(angle: number) {
  return ((((angle + 180) % 360) + 360) % 360) - 180
}

export function getActiveCourse(angle: number, count = PALAZZO_COURSE_COUNT) {
  const step = 360 / count
  return ((Math.round(-angle / step) % count) + count) % count
}

export function getPalazzoTableMetrics(width: number, height: number): PalazzoTableMetrics {
  const compact = width < 1000

  if (compact) {
    const edge = Math.min(width, height * 0.5)
    return {
      stageSize: 1.96 * edge,
      orbitRadius: 0.646 * edge,
      plateSize: 0.4257 * edge,
      centerX: width / 2,
      centerY: height - 0.133 * edge,
      frontAngle: 270,
      compact,
    }
  }

  const orbitRadius = 0.4656 * height
  const plateSize = 0.3064 * height
  return {
    stageSize: 1.4 * height,
    orbitRadius,
    plateSize,
    centerX: Math.max(width - 0.1745 * height, 660 + orbitRadius + 0.65 * plateSize),
    centerY: 0.54 * height,
    frontAngle: 180,
    compact,
  }
}
