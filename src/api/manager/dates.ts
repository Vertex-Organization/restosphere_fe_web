export const TIME_ZONE = 'Asia/Ho_Chi_Minh'
export function businessDay(value: Date | string | number = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value))
  const get = (type: string) => parts.find(p => p.type === type)!.value
  return `${get('year')}-${get('month')}-${get('day')}`
}
export const dayAt = (date: string, time: string) => `${date}T${time}:00+07:00`
export const addDays = (date: string, days: number) => businessDay(new Date(new Date(dayAt(date, '12:00')).getTime() + days * 86400000))
export const time = (value: string | number) => new Intl.DateTimeFormat('vi-VN', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' }).format(new Date(value))
export const dateLabel = (value: string | number) => new Intl.DateTimeFormat('vi-VN', { timeZone: TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
export const money = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(amount)} ₫`
export const minutes = (value: string, now: number) => Math.max(0, Math.floor((now - new Date(value).getTime()) / 60000))
