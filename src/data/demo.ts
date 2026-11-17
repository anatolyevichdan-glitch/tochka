import { useSyncExternalStore } from 'react'
import { isExpert } from './model'
import type { Appeal, Attachment, DemoData, Employee, Message, RoutingAppeal } from './model'
import { seedData } from './seed'

const storageKey = 'otklik:demo:v1'
function read(): DemoData {
  try {
    const value = localStorage.getItem(storageKey)
    if (value) return JSON.parse(value) as DemoData
  } catch {
    // The demo also works in memory when storage is blocked.
  }
  return seedData()
}

let data = read()
const listeners = new Set<() => void>()
const attachments = new Map<string, File>()
const notify = () => listeners.forEach(listener => listener())
const now = () => new Date().toISOString()

window.addEventListener('storage', event => {
  if (event.key !== storageKey && event.key !== null) return
  data = read()
  notify()
})

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function save(next: DemoData) {
  data = next
  try {
    localStorage.setItem(storageKey, JSON.stringify(next))
  } catch {
    // Retain the current demonstration session.
  }
  notify()
}

function updateAppeal(id: string, change: (appeal: Appeal) => Appeal) {
  const current = data.appeals.find(appeal => appeal.id === id)
  if (!current) return
  const next = change(current)
  if (next === current) return
  save({ ...data, appeals: data.appeals.map(appeal => appeal.id === id ? next : appeal) })
}

function registerFiles(files: File[]): Attachment[] {
  return files.map(file => {
    const id = crypto.randomUUID()
    attachments.set(id, file)
    return { id, name: file.name, size: file.size, type: file.type }
  })
}

export function useDemo() {
  return useSyncExternalStore(subscribe, () => data)
}

export function routingView(appeals: Appeal[]): RoutingAppeal[] {
  return appeals.map(({ description: _description, messages: _messages, files, ...routing }) => ({
    ...routing, fileCount: files.length,
  }))
}

export const demo = {
  create(input: Pick<Appeal, 'category' | 'description' | 'priority' | 'preferredExpertId'>, files: File[]) {
    const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()
    const id = 'OTK-' + suffix.match(/.{4}/g)?.join('-')
    save({ ...data, appeals: [{
      ...input, id, status: 'Новое', files: registerFiles(files), createdAt: now(), messages: [],
    }, ...data.appeals] })
    return id
  },

  update(id: string, patch: Pick<Partial<Appeal>, 'status' | 'priority'>) {
    updateAppeal(id, appeal => ({ ...appeal, ...patch }))
  },

  assign(id: string, employeeId: string) {
    const expert = data.employees.find(employee => employee.id === employeeId && employee.active && isExpert(employee.role))
    if (!expert) return false
    updateAppeal(id, appeal => appeal.status === 'Завершено' ? appeal : {
      ...appeal, expertId: expert.id, status: 'В работе', request: undefined,
    })
    return true
  },

  request(id: string, kind: 'transfer' | 'colleague', employeeId: string) {
    updateAppeal(id, appeal => appeal.status === 'Завершено' ? appeal : {
      ...appeal, request: { kind, employeeId, time: now() },
    })
  },

  resolveRequest(id: string, approve: boolean) {
    updateAppeal(id, appeal => {
      const request = appeal.request
      if (!request) return appeal
      const available = data.employees.some(employee => employee.id === request.employeeId && employee.active && isExpert(employee.role))
      if (!approve || !available || appeal.status === 'Завершено') return { ...appeal, request: undefined }
      if (request.kind === 'transfer') return { ...appeal, expertId: request.employeeId, colleagueId: undefined, request: undefined }
      return { ...appeal, colleagueId: request.employeeId, request: undefined }
    })
  },

  escalation(id: string, consume = false) {
    updateAppeal(id, appeal => {
      if (appeal.priority !== 'Срочно' || appeal.status === 'Завершено') return appeal
      if (consume) return appeal.escalation && !appeal.escalation.used
        ? { ...appeal, escalation: { ...appeal.escalation, used: true } } : appeal
      if (appeal.escalation) return appeal
      return { ...appeal, escalation: { token: 'DEMO-' + crypto.randomUUID().slice(0, 8).toUpperCase(), used: false } }
    })
  },

  send(id: string, author: Message['author'], text: string, files: File[] = [], kind: Message['kind'] = 'message') {
    updateAppeal(id, appeal => appeal.status === 'Завершено' ? appeal : {
      ...appeal, messages: [...appeal.messages, {
        id: crypto.randomUUID(), author, kind, time: now(), text, files: registerFiles(files),
      }],
    })
  },

  openFile(id: string) {
    const file = attachments.get(id)
    if (!file) return
    const href = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = href
    link.download = file.name
    link.click()
    setTimeout(() => URL.revokeObjectURL(href), 5000)
  },

  hasFile(id: string) {
    return attachments.has(id)
  },

  saveEmployee(employee: Employee) {
    const exists = data.employees.some(item => item.id === employee.id)
    const employees = exists
      ? data.employees.map(item => item.id === employee.id ? employee : item)
      : [...data.employees, employee]
    save({ ...data, employees })
  },

  reset() {
    attachments.clear()
    save(seedData())
  },
}
