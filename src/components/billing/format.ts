/** Compact elapsed time for tiles and lists: "8 phút", "1g 15p". */
export function shortDuration(minutes: number) {
  if (minutes < 60) return `${minutes} phút`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}g ${rest}p` : `${hours} giờ`
}

/** "vừa xong", "5 phút trước", "2 giờ trước". */
export function ago(minutes: number) {
  if (minutes < 1) return 'vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  return `${Math.floor(minutes / 60)} giờ trước`
}
