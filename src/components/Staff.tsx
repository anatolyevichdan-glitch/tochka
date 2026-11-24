import type { ReactNode } from 'react'
import { ArrowLeftRight, ArrowUpRight, LayoutDashboard, ListChecks, MessageSquare, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Employee } from '../data/model'
import { isExpert } from '../data/model'
import { useDemo } from '../data/demo'
import { PageHeading } from './Common'
import './forms.css'
import './staff.css'

export type Desk = 'operator' | 'expert' | 'admin'
const staffKey = 'otklik:staff'

export function deskFor(employee: Employee): Desk {
  if (employee.role === 'Оператор') return 'operator'
  if (isExpert(employee.role)) return 'expert'
  return 'admin'
}

export function selectEmployee(id: string) {
  sessionStorage.setItem(staffKey, id)
}

export function useEmployee(desk: Desk) {
  const { employees } = useDemo()
  const id = sessionStorage.getItem(staffKey)
  return employees.find(employee => employee.id === id && employee.active && deskFor(employee) === desk)
}

const icons = { operator: ListChecks, expert: MessageSquare, admin: LayoutDashboard }
export function StaffFrame({ desk, title, employee, tabs, activeTab, onTab, children }: {
  desk: Desk; title: string; employee: Employee; tabs: string[]; activeTab: string; onTab: (tab: string) => void; children: ReactNode
}) {
  const Icon = icons[desk]
  return <section className="wrap page staff-shell">
    <aside className="staff-sidebar">
      <div className="staff-profile"><span><Icon size={22}/></span><div><strong>{employee.name}</strong><p>{employee.role}</p></div></div>
      <nav aria-label="Разделы кабинета">
        {tabs.map((tab, index) => <button type="button" key={tab} aria-pressed={activeTab === tab} onClick={() => onTab(tab)}>{index === 0 ? <Icon size={17}/> : <Users size={17}/>} {tab}</button>)}
      </nav>
      <Link className="text-link staff-switch" to="/staff/login"><ArrowLeftRight size={17}/>Сменить роль</Link>
    </aside>
    <div className="staff-content"><PageHeading eyebrow="Учебный кабинет" title={title} />{children}</div>
  </section>
}

export function StaffRequired() {
  return <section className="wrap page narrow"><PageHeading title="Вход в учебный кабинет">Выберите тестового сотрудника подходящей роли.</PageHeading>
    <Link className="button" to="/staff/login">Выбрать сотрудника <ArrowUpRight size={17}/></Link>
  </section>
}

export function Metrics({ values }: { values: [string, number][] }) {
  return <dl className="metrics">{values.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
}
