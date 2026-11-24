import { useState } from 'react'
import { ArrowRightLeft, CheckCircle2, UserPlus } from 'lucide-react'
import { Chat } from '../components/Chat'
import { DemoNotice } from '../components/Common'
import { SavedFiles } from '../components/Files'
import { Metrics, StaffFrame, StaffRequired, useEmployee } from '../components/Staff'
import { demo, useDemo } from '../data/demo'
import { isExpert, shortDate, statuses } from '../data/model'
import type { Appeal, Employee } from '../data/model'

const tabs = ['Мои обращения', 'Участие коллегой']

export function ExpertPage() {
  const { appeals, employees } = useDemo()
  const employee = useEmployee('expert')
  const [tab, setTab] = useState(tabs[0])
  const [filter, setFilter] = useState('')
  const [selection, setSelection] = useState('')
  if (!employee) return <StaffRequired/>

  const assigned = appeals.filter(item => item.expertId === employee.id)
  const invited = appeals.filter(item => item.colleagueId === employee.id)
  const listed = (tab === tabs[0] ? assigned : invited).filter(item => !filter || item.status === filter)
  const current = listed.find(item => item.id === selection) ?? listed[0]
  const colleagues = employees.filter(person => person.active && person.id !== employee.id && isExpert(person.role))

  return <StaffFrame desk="expert" title="Кабинет эксперта" employee={employee} tabs={tabs} activeTab={tab} onTab={next => { setTab(next); setSelection(''); setFilter('') }}>
    <div className="stack">
      <Metrics values={[
        ['Назначено', assigned.length], ['В работе', assigned.filter(item => item.status === 'В работе').length],
        ['Завершено', assigned.filter(item => item.status === 'Завершено').length], ['Как коллега', invited.length],
      ]}/>
      <DemoNotice>В этом кабинете видны назначенные вам учебные обращения и диалоги, к которым вас привлекли.</DemoNotice>
      <div className="desk-grid">
        <section className="panel stack"><h2 className="text-xl">{tab}</h2>
          <label className="field">Статус<select className="input" value={filter} onChange={event => setFilter(event.target.value)}>
            <option value="">Все обращения</option>{statuses.map(status => <option key={status}>{status}</option>)}
          </select></label>
          {!listed.length && <p className="empty">В этом разделе пока нет обращений с выбранным статусом.</p>}
          <ul className="case-list">{listed.map(item => <li key={item.id}><button type="button" aria-pressed={current?.id === item.id} onClick={() => setSelection(item.id)}>
            <code>{item.id}</code><strong>{item.category}</strong><span className="chip">{item.status}</span>
          </button></li>)}</ul>
        </section>
        {current ? <ExpertCase key={current.id} appeal={current} employeeId={employee.id} colleagues={colleagues}/> : <p className="panel empty">Выберите обращение, чтобы открыть карточку и переписку.</p>}
      </div>
    </div>
  </StaffFrame>
}

function ExpertCase({ appeal, employeeId, colleagues }: { appeal: Appeal; employeeId: string; colleagues: Employee[] }) {
  const owner = appeal.expertId === employeeId
  const [action, setAction] = useState<'transfer' | 'colleague' | ''>('')
  const [target, setTarget] = useState('')
  const [closing, setClosing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const candidates = colleagues.filter(item => item.id !== appeal.colleagueId && item.id !== appeal.expertId)
  return <div className="stack">
    <article className="panel stack">
      <div><p className="eyebrow break-all">{appeal.id}</p><h2 className="text-2xl">{appeal.category}</h2><p className="subtle mt-1">{shortDate(appeal.createdAt)} · {appeal.status}</p></div>
      <div><h3>Описание</h3><p className="mt-2 whitespace-pre-wrap wrap-anywhere">{appeal.description}</p><SavedFiles files={appeal.files}/></div>
      {owner && appeal.status !== 'Завершено' && <>
        <div className="actions">
          {appeal.status !== 'В работе' && <button className="button secondary" type="button" onClick={() => { demo.update(appeal.id, { status: 'В работе' }); setFeedback('Обращение в работе.') }}>Взять в работу</button>}
          {!appeal.request && <>
            <button className="button secondary" type="button" disabled={!candidates.length} onClick={() => { setAction('transfer'); setClosing(false) }}><ArrowRightLeft size={16}/> Запросить передачу</button>
            <button className="button secondary" type="button" disabled={!candidates.length} onClick={() => { setAction('colleague'); setClosing(false) }}><UserPlus size={16}/> Привлечь коллегу</button>
          </>}
          <button className="button secondary" type="button" onClick={() => { setClosing(!closing); setAction('') }}><CheckCircle2 size={17}/> Завершить</button>
        </div>
        {!candidates.length && <p className="subtle">Других доступных специалистов сейчас нет.</p>}
        {appeal.request && <p className="subtle">Запрос ожидает решения оператора.</p>}
        {closing && <div className="notice stack">
          <p>После завершения переписка будет доступна для чтения.</p>
          <div className="actions"><button className="button" type="button" onClick={() => { demo.update(appeal.id, { status: 'Завершено' }); setClosing(false); setFeedback('Обращение завершено.') }}>Подтвердить завершение</button><button className="button secondary" type="button" onClick={() => setClosing(false)}>Отмена</button></div>
        </div>}
        {action && !appeal.request && <form className="stack" onSubmit={event => {
          event.preventDefault()
          if (!target) return
          demo.request(appeal.id, action, target)
          setAction('')
          setTarget('')
          setFeedback('Учебный запрос передан оператору.')
        }}>
          <label className="field">{action === 'transfer' ? 'Кому передать обращение' : 'Кого привлечь'}
            <select className="input" value={target} onChange={event => setTarget(event.target.value)}><option value="">Выберите специалиста</option>
              {candidates.map(person => <option key={person.id} value={person.id}>{person.name} · {person.role}</option>)}</select>
          </label>
          <div className="actions"><button className="button" type="submit" disabled={!target}>Сохранить запрос</button><button className="button secondary" type="button" onClick={() => { setAction(''); setTarget('') }}>Отмена</button></div>
        </form>}
      </>}
      {feedback && <p className="success" role="status">{feedback}</p>}
    </article>
    <section aria-label="Приватная переписка"><h2 className="mb-3 text-xl">Приватная переписка</h2><Chat appeal={appeal} author="expert" employeeId={employeeId}/></section>
  </div>
}
