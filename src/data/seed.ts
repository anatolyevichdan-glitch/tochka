import type { Appeal, DemoData, Employee } from './model'

export const sampleAppealId = 'OTK-DEMO-0001'

const employees: Employee[] = [
  { id: 'staff-01', name: 'Анна Морозова', role: 'Психолог', active: true },
  { id: 'staff-02', name: 'Илья Соколов', role: 'Конфликтолог', active: true },
  { id: 'staff-03', name: 'Мария Лебедева', role: 'Юрист', active: true },
  { id: 'staff-04', name: 'Вера Ким', role: 'Оператор', active: true },
  { id: 'staff-05', name: 'Павел Волков', role: 'Администратор', active: true },
  { id: 'staff-06', name: 'Лев Беляев', role: 'Психолог', active: true },
  { id: 'staff-07', name: 'Елена Белова', role: 'Аналитик', active: true },
]

const samples: Pick<Appeal, 'category' | 'description' | 'status' | 'priority' | 'expertId'>[] = [
  { category: 'Тревога и стресс', description: 'Учебный пример: трудно отдыхать перед важным событием.', status: 'В работе', priority: 'Обычное', expertId: 'staff-01' },
  { category: 'Буллинг', description: 'Учебный пример: в общем чате стали публиковать насмешки.', status: 'Новое', priority: 'Обычное' },
  { category: 'Угроза безопасности', description: 'Учебный пример: автор описал угрозу безопасности.', status: 'Ожидает специалиста', priority: 'Срочно' },
  { category: 'Конфликты', description: 'Учебный пример: возник спор с одногруппниками.', status: 'В работе', priority: 'Не срочно', expertId: 'staff-02' },
  { category: 'Семейные проблемы', description: 'Учебный пример: трудно поговорить с близкими.', status: 'Завершено', priority: 'Обычное', expertId: 'staff-01' },
  { category: 'Другое', description: 'Учебный пример: вопрос о правах учащихся.', status: 'В работе', priority: 'Не срочно', expertId: 'staff-03' },
]

export function seedData(): DemoData {
  return {
    employees: employees.map(employee => ({ ...employee })),
    appeals: samples.map((sample, index) => {
      const createdAt = new Date(Date.now() - (index + 1) * 14 * 3600000).toISOString()
      return {
        ...sample,
        id: 'OTK-DEMO-000' + (index + 1),
        createdAt,
        files: [],
        messages: index === 0 ? [{
          id: 'sample-intro', author: 'demo', kind: 'message', time: createdAt,
          text: 'Это учебный пример переписки. Отправьте тестовое сообщение, чтобы увидеть, как работает чат.',
          files: [],
        }] : [],
      }
    }),
  }
}
