import { useState } from 'react'
import { Download, PencilLine, Plus, RotateCcw } from 'lucide-react'
import { DemoNotice } from '../components/Common'
import { Metrics, StaffFrame, StaffRequired, useEmployee } from '../components/Staff'
import { demo, useDemo } from '../data/demo'
import { roles } from '../data/model'
import type { Employee, Role } from '../data/model'
import { downloadReport, summarize } from '../data/report'
import './admin.css'

const adminTabs = ['Обзор', 'Сотрудники', 'Отчёты и данные']
const analystTabs = ['Обзор', 'Отчёты и данные']

export function AdminPage() {
  const { appeals, employees } = useDemo()
  const employee = useEmployee('admin')
  const [tab, setTab] = useState('Обзор')
  const [editing, setEditing] = useState<Employee | null>(null)
  const [feedback, setFeedback] = useState('')
  const [filter, setFilter] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const [exportState, setExportState] = useState<'ready' | 'exporting' | 'success' | 'error'>('ready')
  const summary = summarize(appeals)
  if (!employee) return <StaffRequired/>
  const isAdmin = employee.role === 'Администратор'
  const tabs = isAdmin ? adminTabs : analystTabs
  const activeTab = tabs.includes(tab) ? tab : tabs[0]
  const found = employees.filter(person => (person.name + ' ' + person.role).toLowerCase().includes(filter.toLowerCase().trim()))

  async function exportReport() {
    setExportState('exporting')
    try {
      await downloadReport(summary)
      setExportState('success')
    } catch {
      setExportState('error')
    }
  }

  return <StaffFrame desk="admin" title={isAdmin ? 'Административная панель' : 'Кабинет аналитика'} employee={employee}
    tabs={tabs} activeTab={activeTab} onTab={next => { setTab(next); setFeedback(''); setEditing(null) }}>
    <div className="stack">
      <DemoNotice>Показатели рассчитаны по учебным обращениям. В сводку и XLSX входят только агрегированные числа.</DemoNotice>
      {activeTab === 'Обзор' && <>
        <Metrics values={[
          ['Обращения', summary.total], ['В работе', summary.status.find(item => item.label === 'В работе')?.count ?? 0],
          ['Завершено', summary.status.find(item => item.label === 'Завершено')?.count ?? 0], ['Активные сотрудники', employees.filter(item => item.active).length],
        ]}/>
        <div className="admin-charts">
          <Chart title="Распределение по категориям" items={summary.category}/>
          <Chart title="Динамика за 7 дней" items={summary.dynamic}/>
        </div>
      </>}
      {isAdmin && activeTab === 'Сотрудники' && <section className="panel stack">
        <div className="actions justify-between"><h2 className="text-xl">Сотрудники</h2><button className="button secondary" type="button" onClick={() => setEditing({
          id: crypto.randomUUID(), name: '', role: 'Оператор', active: true,
        })}><Plus size={17}/> Добавить сотрудника</button></div>
        {editing && <EmployeeEditor key={editing.id} item={editing} self={editing.id === employee.id} onCancel={() => setEditing(null)}
          onSave={person => { demo.saveEmployee(person); setEditing(null); setFeedback('Учебная запись сохранена.') }}/>}
        {feedback && <p className="success" role="status">{feedback}</p>}
        <label className="field">Поиск сотрудников<input className="input" value={filter} onChange={event => setFilter(event.target.value)} placeholder="Имя или роль"/></label>
        {!found.length && <p className="empty">Сотрудники не найдены.</p>}
        <ul className="people-list">{found.map(person => <li key={person.id}><div><strong>{person.name}</strong><p className="subtle">{person.role} · {person.active ? 'Активен' : 'Доступ отключён'}</p></div>
          <button className="button secondary" type="button" aria-label={'Изменить запись: ' + person.name} onClick={() => { setEditing(person); setFeedback('') }}><PencilLine size={16}/> Изменить</button>
        </li>)}</ul>
      </section>}
      {activeTab === 'Отчёты и данные' && <>
        <section className="panel stack">
          <h2 className="text-xl">Обезличенный отчёт</h2>
          <p>Категории, статусы, приоритеты и динамика за последние семь дней.</p>
          <button className="button justify-self-start" type="button" disabled={exportState === 'exporting'} onClick={exportReport}><Download size={17}/> {exportState === 'exporting' ? 'Подготовка…' : 'Скачать XLSX'}</button>
          {exportState === 'success' && <p className="success" role="status">Отчёт подготовлен.</p>}
          {exportState === 'error' && <p className="error" role="alert">Не удалось создать файл. Попробуйте ещё раз.</p>}
        </section>
        {isAdmin && <section className="panel stack">
          <h2 className="text-xl">Учебные данные</h2><p>Сброс восстановит начальные примеры и удалит обращения, сообщения и записи сотрудников, созданные в этом браузере.</p>
          {confirmReset ? <div className="actions"><button className="button" type="button" onClick={() => {
            demo.reset(); setConfirmReset(false); setFeedback('Начальные данные восстановлены.')
          }}>Подтвердить сброс</button><button className="button secondary" type="button" onClick={() => setConfirmReset(false)}>Отмена</button></div>
          : <button className="button secondary justify-self-start" type="button" onClick={() => setConfirmReset(true)}><RotateCcw size={16}/> Восстановить примеры</button>}
          {feedback && <p className="success" role="status">{feedback}</p>}
        </section>}
      </>}
    </div>
  </StaffFrame>
}

function Chart({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  const max = Math.max(1, ...items.map(item => item.count))
  return <section className="panel stack"><h2 className="text-xl">{title}</h2>
    <ul className="bar-list">{items.map(item => <li key={item.label}><span>{item.label}</span><strong>{item.count}</strong><div className="bar-track" aria-hidden="true"><div style={{ width: item.count / max * 100 + '%' }}/></div></li>)}</ul>
  </section>
}

function EmployeeEditor({ item, self, onSave, onCancel }: {
  item: Employee; self: boolean; onSave: (person: Employee) => void; onCancel: () => void
}) {
  const [draft, setDraft] = useState(item)
  const [error, setError] = useState('')
  return <form className="panel stack" onSubmit={event => {
    event.preventDefault()
    if (draft.name.trim().length < 2) return setError('Введите вымышленное имя длиной от двух символов.')
    onSave({ ...draft, name: draft.name.trim() })
  }}>
    <h3>{item.name ? 'Редактирование сотрудника' : 'Новый сотрудник'}</h3>
    <label className="field">Вымышленное имя<input className="input" value={draft.name} maxLength={70} onChange={event => {
      setDraft({ ...draft, name: event.target.value }); setError('')
    }}/></label>
    <label className="field">Роль<select className="input" value={draft.role} disabled={self} onChange={event => setDraft({ ...draft, role: event.target.value as Role })}>
      {roles.map(role => <option key={role}>{role}</option>)}
    </select></label>
    <label className="flex items-center gap-2 font-medium"><input className="accent-forest" type="checkbox" checked={draft.active} disabled={self} onChange={event => setDraft({ ...draft, active: event.target.checked })}/> Доступ включён</label>
    {self && <p className="subtle">Для текущей учётной записи доступно изменение имени.</p>}
    {error && <p className="error" role="alert">{error}</p>}
    <div className="actions"><button className="button" type="submit">Сохранить сотрудника</button><button className="button secondary" type="button" onClick={onCancel}>Отмена</button></div>
  </form>
}
