import { categories, priorities, statuses } from './model'
import type { Appeal } from './model'

function countLabels<T extends string>(labels: readonly T[], values: T[]) {
  return labels.map(label => ({ label, count: values.filter(value => value === label).length }))
}

export function summarize(appeals: Pick<Appeal, 'category' | 'createdAt' | 'status' | 'priority'>[]) {
  const day = new Date()
  day.setHours(0, 0, 0, 0)
  day.setDate(day.getDate() - 6)
  const dynamic = Array.from({ length: 7 }, () => {
    const start = day.getTime()
    const label = day.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    day.setDate(day.getDate() + 1)
    const end = day.getTime()
    return { label, count: appeals.filter(item => {
      const time = Date.parse(item.createdAt)
      return time >= start && time < end
    }).length }
  })

  return {
    total: appeals.length,
    category: countLabels(categories, appeals.map(item => item.category)),
    status: countLabels(statuses, appeals.map(item => item.status)),
    priority: countLabels(priorities, appeals.map(item => item.priority)),
    dynamic,
  }
}

export async function downloadReport(summary: ReturnType<typeof summarize>) {
  const { default: writeXlsxFile } = await import('write-excel-file')
  const rows = [
    ['Раздел', 'Показатель', 'Количество'],
    ['Демонстрационные данные', 'Все обращения', summary.total],
    ...summary.category.map(item => ['Категории', item.label, item.count]),
    ...summary.status.map(item => ['Статусы', item.label, item.count]),
    ...summary.priority.map(item => ['Приоритеты', item.label, item.count]),
    ...summary.dynamic.map(item => ['Последние 7 дней', item.label, item.count]),
  ].map(row => row.map(value => ({ value })))
  await writeXlsxFile(rows, {
    fileName: 'otklik-demo-report.xlsx',
    sheet: 'Учебная статистика',
    columns: [{ width: 27 }, { width: 32 }, { width: 16 }],
  })
}
