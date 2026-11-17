import { ArrowRight, CircleCheck, ClipboardList, Hash, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DemoNotice, PageHeading, useTone } from '../components/Common'
import { useDemo } from '../data/demo'
import { shortDate, statuses } from '../data/model'
import type { Category } from '../data/model'
import { sampleAppealId } from '../data/seed'
import '../components/forms.css'

const waitingNotes: Partial<Record<Category, string>> = {
  'Тревога и стресс': 'Можно заранее записать, о чём хочется поговорить в первую очередь.',
  'Буллинг': 'Если это безопасно, можно коротко описать, что произошло и какая помощь нужна.',
  'Угроза безопасности': 'При непосредственной угрозе жизни или здоровью звоните 112.',
}

export function CheckAppealPage() {
  const { appeals } = useDemo()
  const [params, setParams] = useSearchParams()
  const requested = params.get('number')?.trim().toUpperCase() ?? ''
  const [input, setInput] = useState(requested)
  const [empty, setEmpty] = useState(false)
  const say = useTone()
  const appeal = appeals.find(item => item.id === requested)
  const invalidFormat = Boolean(requested) && !/^OTK-(?:[A-F0-9]{4}-){2}[A-F0-9]{4}$|^OTK-DEMO-\d{4}$/.test(requested)
  const error = empty ? 'Введите номер обращения.' : invalidFormat ? 'Проверьте формат номера и тире.' : requested && !appeal ? 'Обращение с таким номером не найдено в этом браузере.' : ''
  const sampleAvailable = appeals.some(item => item.id === sampleAppealId)

  function check(number: string) {
    const value = number.trim().toUpperCase()
    setInput(value)
    setEmpty(!value)
    setParams(value ? { number: value } : {}, { replace: true })
  }

  return <section className="wrap page narrow">
    <PageHeading title="Проверить обращение">{say('Введите номер, который получили после заполнения формы.', 'Введи номер, который получил после заполнения формы.')}</PageHeading>
    <div className="stack">
      <form className="panel stack" onSubmit={event => { event.preventDefault(); check(input) }}>
        <label className="field" htmlFor="tracking">Номер обращения</label>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input id="tracking" className="input font-mono" autoComplete="off" spellCheck={false} value={input}
            placeholder="OTK-XXXX-XXXX-XXXX" maxLength={40} aria-invalid={Boolean(error)} aria-describedby={error ? 'tracking-error' : undefined}
            onChange={event => { setInput(event.target.value); setEmpty(false); if (requested) setParams({}, { replace: true }) }}/>
          <button className="button" type="submit"><Hash size={17}/> Проверить</button>
        </div>
        {error && <p className="error" id="tracking-error" role="alert">{error}</p>}
        {sampleAvailable && <button className="text-link justify-self-start" type="button" onClick={() => check(sampleAppealId)}>Открыть пример {sampleAppealId}</button>}
      </form>
      {appeal && <>
        <article className="panel stack" aria-label="Состояние обращения">
          <div className="flex items-center gap-2"><CircleCheck size={20} className="text-forest"/><code className="break-all">{appeal.id}</code></div>
          <div><h2 className="text-2xl">{appeal.category}</h2><p className="subtle mt-1">Создано {shortDate(appeal.createdAt)}</p></div>
          <ol className="grid gap-2 sm:grid-cols-2" aria-label="Статусы обращения">{statuses.map(status => <li key={status} aria-current={status === appeal.status ? 'step' : undefined}
            className={status === appeal.status ? 'rounded-md bg-sage px-3 py-2 font-semibold text-forest' : 'rounded-md border border-[#d9dfd2] px-3 py-2 text-[#535f56]'}>{status}</li>)}</ol>
          <div className="actions"><Link className="button" to={'/appeal/' + appeal.id + '/chat'}><MessageCircle size={17}/> Открыть чат</Link>
            {appeal.expertId && <Link className="button secondary" to={'/appeal/new?previous=' + appeal.id}>Повторное обращение <ArrowRight size={17}/></Link>}
          </div>
        </article>
        {(!appeal.expertId && appeal.status !== 'Завершено') && <aside className="panel stack">
          <h2 className="flex items-center gap-2 text-lg"><ClipboardList size={20}/> Пока ожидаете специалиста</h2>
          <p>{waitingNotes[appeal.category] ?? 'Можно подумать, какой вопрос вы хотите задать первым.'}</p><Link className="text-link" to="/help">Открыть памятки и контакты</Link>
        </aside>}
      </>}
      <DemoNotice>Проверка работает с учебными обращениями этого браузера.</DemoNotice>
    </div>
  </section>
}
