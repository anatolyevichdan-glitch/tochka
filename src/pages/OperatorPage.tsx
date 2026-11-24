import { useState } from 'react'
import { AlertTriangle, CircleCheck, Search, Sparkles } from 'lucide-react'
import { DemoNotice } from '../components/Common'
import { Metrics, StaffFrame, StaffRequired, useEmployee } from '../components/Staff'
import { demo, routingView, useDemo } from '../data/demo'
import { categories, isExpert, priorities, shortDate, statuses, suggestRole } from '../data/model'
import type { Priority, RoutingAppeal } from '../data/model'

const tabs = ['Очередь обращений', 'Специалисты']

export function OperatorPage() {
  const { appeals, employees } = useDemo()
  const employee = useEmployee('operator')
  const [tab, setTab] = useState(tabs[0])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [selected, setSelected] = useState('')
  const queue = routingView(appeals)
  const experts = employees.filter(person => person.active && isExpert(person.role))
  const workload = (id: string) => queue.filter(item => item.status !== 'Завершено' && (item.expertId === id || item.colleagueId === id)).length
  const filtered = queue.filter(item => {
    return (!status || item.status === status) && (!category || item.category === category) &&
      (!priority || item.priority === priority) && (item.id + ' ' + item.category).toLowerCase().includes(query.trim().toLowerCase())
  }).sort((left, right) => priorities.indexOf(left.priority) - priorities.indexOf(right.priority))
  const active = filtered.find(item => item.id === selected) ?? filtered[0]

  if (!employee) return <StaffRequired/>
  return <StaffFrame desk="operator" title="Кабинет оператора" employee={employee} tabs={tabs} activeTab={tab} onTab={setTab}>
    <div className="stack">
      <Metrics values={[
        ['Всего', queue.length], ['Новые', queue.filter(item => item.status === 'Новое').length],
        ['Без назначения', queue.filter(item => !item.expertId && item.status !== 'Завершено').length],
        ['Срочные открытые', queue.filter(item => item.priority === 'Срочно' && item.status !== 'Завершено').length],
      ]}/>
      {tab === tabs[0] ? <div className="desk-grid">
        <section className="panel stack">
          <h2 className="text-xl">Очередь</h2>
          <label className="field"><span className="flex items-center gap-2"><Search size={16}/> Поиск</span><input className="input" value={query} onChange={event => setQuery(event.target.value)} placeholder="Номер или категория"/></label>
          <label className="field">Статус<select className="input" value={status} onChange={event => setStatus(event.target.value)}><option value="">Все статусы</option>{statuses.map(item => <option key={item}>{item}</option>)}</select></label>
          <label className="field">Категория<select className="input" value={category} onChange={event => setCategory(event.target.value)}><option value="">Все категории</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
          <label className="field">Приоритет<select className="input" value={priority} onChange={event => setPriority(event.target.value)}><option value="">Любой приоритет</option>{priorities.map(item => <option key={item}>{item}</option>)}</select></label>
          {!filtered.length && <p className="empty">По этим фильтрам обращений нет.</p>}
          <ul className="case-list">{filtered.map(item => <li key={item.id}><button type="button" aria-pressed={active?.id === item.id} onClick={() => setSelected(item.id)}>
            <code>{item.id}</code><strong>{item.category}</strong><span className="case-meta"><span className="chip">{item.status}</span><span className={'chip' + (item.priority === 'Срочно' ? ' urgent' : '')}>{item.priority}</span></span>
          </button></li>)}</ul>
        </section>
        {active ? <OperatorCase key={active.id} appeal={active} experts={experts} workload={workload}/> : <p className="panel empty">Выберите обращение из очереди.</p>}
      </div> : <section className="panel stack"><h2 className="text-xl">Загруженность специалистов</h2>
        {!experts.length && <p className="empty">В учебной команде нет доступных специалистов.</p>}
        <ul className="people-list">{experts.map(person => <li key={person.id}><div><strong>{person.name}</strong><p className="subtle">{person.role}</p></div><span className="chip">Открытых: {workload(person.id)}</span></li>)}</ul>
      </section>}
    </div>
  </StaffFrame>
}

function OperatorCase({ appeal, experts, workload }: {
  appeal: RoutingAppeal
  experts: { id: string; name: string; role: string }[]
  workload: (id: string) => number
}) {
  const suggested = suggestRole(appeal.category)
  const preference = experts.find(expert => expert.id === appeal.preferredExpertId)
  const [assigned, setAssigned] = useState('')
  const [feedback, setFeedback] = useState('')
  const closed = appeal.status === 'Завершено'
  const specialist = experts.find(expert => expert.id === appeal.expertId)
  const target = experts.find(expert => expert.id === appeal.request?.employeeId)

  return <article className="panel stack">
    <div><p className="eyebrow">Карточка маршрутизации</p><h2 className="text-2xl">{appeal.category}</h2></div>
    <dl className="case-details">
      <div><dt>Номер</dt><dd>{appeal.id}</dd></div><div><dt>Создано</dt><dd>{shortDate(appeal.createdAt)}</dd></div>
      <div><dt>Состояние</dt><dd>{appeal.status}</dd></div><div><dt>Вложения</dt><dd>{appeal.fileCount}</dd></div>
      <div><dt>Назначено</dt><dd>{specialist?.name ?? (appeal.expertId ? 'Сотрудник недоступен' : 'Без специалиста')}</dd></div>
      {preference && <div><dt>Запрошен прежний специалист</dt><dd>{preference.name}</dd></div>}
    </dl>
    <DemoNotice><span className="inline-flex items-center gap-2 font-semibold"><Sparkles size={16}/> ML-подсказка</span><br/>По выбранной теме подходит {suggested.toLowerCase()}. Это условный пример классификации.</DemoNotice>
    {!closed && <>
      <label className="field">Приоритет<select className="input" value={appeal.priority} onChange={event => { demo.update(appeal.id, { priority: event.target.value as Priority }); setFeedback('Приоритет обновлён.') }}>{priorities.map(item => <option key={item}>{item}</option>)}</select></label>
      {appeal.status === 'Новое' && <button className="button secondary justify-self-start" type="button" onClick={() => { demo.update(appeal.id, { status: 'Ожидает специалиста' }); setFeedback('Обращение принято в очередь.') }}>Принять в очередь</button>}
      <form className="stack" onSubmit={event => {
        event.preventDefault()
        if (assigned && demo.assign(appeal.id, assigned)) { setFeedback('Специалист назначен.'); setAssigned('') }
      }}>
        <label className="field">Назначение специалиста<select className="input" value={assigned} onChange={event => setAssigned(event.target.value)}>
          <option value="">Выберите специалиста</option>
          {experts.map(expert => <option key={expert.id} value={expert.id}>{expert.name} · {expert.role} · открытых: {workload(expert.id)}</option>)}
        </select></label>
        <button className="button justify-self-start" disabled={!assigned || assigned === appeal.expertId} type="submit">Назначить</button>
      </form>
      {appeal.request && <section className="notice stack">
        <h3>{appeal.request.kind === 'transfer' ? 'Запрос передачи' : 'Запрос на участие коллеги'}</h3>
        <p>{target?.name ?? 'Специалист недоступен'}</p>
        <div className="actions">
          <button className="button" type="button" disabled={!target} onClick={() => { demo.resolveRequest(appeal.id, true); setFeedback('Запрос подтверждён.') }}>Подтвердить</button>
          <button className="button secondary" type="button" onClick={() => { demo.resolveRequest(appeal.id, false); setFeedback('Запрос отклонён.') }}>Отклонить</button>
        </div>
      </section>}
      {appeal.priority === 'Срочно' && <section className="panel stack">
        <h3 className="flex items-center gap-2"><AlertTriangle size={18}/> Учебная эскалация</h3>
        <p className="subtle">Смоделируйте выдачу и использование одноразового токена. Данные остаются в браузере.</p>
        {appeal.escalation ? <>
          <code className="break-all">{appeal.escalation.token}</code>
          {appeal.escalation.used ? <p className="subtle">Токен погашен.</p> : <button className="button secondary justify-self-start" type="button" onClick={() => { demo.escalation(appeal.id, true); setFeedback('Учебная эскалация завершена.') }}>Погасить токен</button>}
        </> : <button className="button secondary justify-self-start" type="button" onClick={() => demo.escalation(appeal.id)}>Создать учебный токен</button>}
      </section>}
    </>}
    {feedback && <p className="success flex items-center gap-2" role="status"><CircleCheck size={17}/>{feedback}</p>}
  </article>
}
