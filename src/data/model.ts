export const categories = [
  'Тревога и стресс', 'Конфликты', 'Буллинг', 'Семейные проблемы', 'Угроза безопасности', 'Другое',
] as const
export const statuses = ['Новое', 'Ожидает специалиста', 'В работе', 'Завершено'] as const
export const priorities = ['Срочно', 'Обычное', 'Не срочно'] as const
export const roles = ['Оператор', 'Психолог', 'Конфликтолог', 'Юрист', 'Администратор', 'Аналитик'] as const

export type Category = typeof categories[number]
export type Status = typeof statuses[number]
export type Priority = typeof priorities[number]
export type Role = typeof roles[number]
export type Attachment = { id: string; name: string; size: number; type: string }
export type Employee = { id: string; name: string; role: Role; active: boolean }
export type Message = {
  id: string
  author: 'user' | 'expert' | 'demo'
  kind: 'message' | 'recommendation'
  time: string
  text: string
  files: Attachment[]
}
export type Request = { kind: 'transfer' | 'colleague'; employeeId: string; time: string }
export type Appeal = {
  id: string
  category: Category
  description: string
  files: Attachment[]
  createdAt: string
  status: Status
  priority: Priority
  expertId?: string
  preferredExpertId?: string
  colleagueId?: string
  request?: Request
  escalation?: { token: string; used: boolean }
  messages: Message[]
}
export type RoutingAppeal = Omit<Appeal, 'description' | 'messages' | 'files'> & { fileCount: number }
export type DemoData = { appeals: Appeal[]; employees: Employee[] }

export function isExpert(role: Role) {
  return role === 'Психолог' || role === 'Конфликтолог' || role === 'Юрист'
}

export function suggestRole(category: Category): Role {
  if (category === 'Другое') return 'Юрист'
  if (category === 'Конфликты' || category === 'Буллинг') return 'Конфликтолог'
  return 'Психолог'
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' Б'
  if (bytes < 1048576) return Math.round(bytes / 1024) + ' КБ'
  return (bytes / 1048576).toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' МБ'
}

export function shortDate(date: string) {
  return new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}
