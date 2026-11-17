import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { DemoNotice, Emergency, PageHeading, useTone } from '../components/Common'
import { chooseFiles, DraftFiles, FilePicker } from '../components/Files'
import { RecordAudio } from '../components/RecordAudio'
import { demo, useDemo } from '../data/demo'
import { categories } from '../data/model'
import type { Category } from '../data/model'
import '../components/forms.css'
import './appeal.css'

const steps = ['Тема', 'Описание', 'Вложения', 'Проверка']
const title = ['Что случилось?', 'Расскажите о ситуации', 'Добавьте вложения', 'Проверьте обращение']
const maxLength = 2500
const crisis = /(?:угроз[ауы] жизни|меня убьют|суицид|убить себя|покончить с собой|навредить себе|опасность для жизни)/iu

export function NewAppealPage() {
  const say = useTone()
  const [search] = useSearchParams()
  const { appeals, employees } = useDemo()
  const previous = appeals.find(appeal => appeal.id === search.get('previous') && appeal.expertId)
  const previousExpert = employees.find(employee => employee.id === previous?.expertId && employee.active)
  const [preferPrevious, setPreferPrevious] = useState(true)
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState<Category | ''>('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [consent, setConsent] = useState(false)
  const [recordPending, setRecordPending] = useState(false)
  const [id, setId] = useState('')
  const [copied, setCopied] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const code = useRef<HTMLElement>(null)
  const urgent = category === 'Угроза безопасности' || crisis.test(description)

  useEffect(() => { if (step || id) heading.current?.focus() }, [step, id])

  function addFiles(added: File[]) {
    const result = chooseFiles(files, added)
    setFiles(result.files)
    setError(result.error)
  }

  function next() {
    if (!category) return setError('Выберите тему обращения.')
    if (step === 1 && description.trim().length < 10) return setError('Добавьте хотя бы 10 символов.')
    if (step === 3) {
      if (!consent) return setError('Подтвердите, что используете вымышленные данные.')
      setId(demo.create({
        category, description: description.trim(), priority: urgent ? 'Срочно' : 'Обычное',
        preferredExpertId: preferPrevious ? previousExpert?.id : undefined,
      }, files))
    } else {
      setStep(step + 1)
    }
    setError('')
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(id)
      setCopied('Номер скопирован.')
    } catch {
      if (code.current) {
        const range = document.createRange()
        range.selectNodeContents(code.current)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
      setCopied('Номер выделен. Скопируйте его вручную.')
    }
  }

  if (id) return <section className="wrap page narrow stack">
    <PageHeading eyebrow="Новое обращение" title="Учебное обращение создано">{say('Сохраните номер, чтобы вернуться к статусу и переписке.', 'Сохрани номер, чтобы вернуться к статусу и переписке.')}</PageHeading>
    <div className="panel stack"><h2 ref={heading} tabIndex={-1} className="text-lg">Номер обращения</h2>
      <code className="tracking-number" ref={code}>{id}</code>
      <div className="actions"><button className="button secondary" type="button" onClick={copy}><Copy size={17}/> Скопировать номер</button><Link className="button" to={'/appeal/check?number=' + id}>Проверить статус <ArrowUpRight size={17}/></Link></div>
      <p className="success" role="status">{copied}</p>
    </div>
    <DemoNotice>Обращение сохранено в этом браузере. Памятки доступны во время ожидания, а учебный ответ можно посмотреть в чате.</DemoNotice>
    <Link className="text-link" to="/help">Открыть памятки</Link>
  </section>

  return <section className="wrap page narrow">
    <PageHeading eyebrow="Анонимное обращение" title="Расскажите, что происходит">{say('Можно писать своими словами. Имя и контакты не нужны.', 'Можно писать своими словами. Твоё имя и контакты не нужны.')}</PageHeading>
    <div className="stack">
      <DemoNotice>Используйте только вымышленные сведения и тестовые файлы. Обращение сохраняется в браузере и не передаётся специалисту.</DemoNotice>
      <ol className="steps" aria-label="Шаги формы">
        {steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} data-complete={step > index}>
          <span aria-hidden="true">{step > index ? <Check size={14}/> : index + 1}</span>{label}
        </li>)}
      </ol>
      {urgent && <div className="stack"><Emergency/><Link className="text-link" to="/help">Другие контакты и памятки</Link><p className="subtle">В учебной очереди такому обращению присваивается статус срочности.</p></div>}
      <form className="panel stack" noValidate onSubmit={event => { event.preventDefault(); next() }}>
        <h2 ref={heading} tabIndex={-1} className="text-2xl">{step === 1 ? say(title[step], 'Расскажи о ситуации') : title[step]}</h2>
        {step === 0 && <fieldset>
          <legend className="subtle mb-3">Выберите одну тему, которая подходит лучше всего.</legend>
          <div className="categories">{categories.map(item => <label key={item}>
            <input type="radio" name="category" value={item} checked={category === item} onChange={() => { setCategory(item); setError('') }}/>{item}
          </label>)}</div>
        </fieldset>}
        {step === 1 && <>
          <label className="field">Описание<textarea className="input" rows={7} value={description} maxLength={maxLength}
            aria-invalid={Boolean(error)} aria-describedby="description-hint description-count" onChange={event => { setDescription(event.target.value); setError('') }}
            placeholder="Учебный пример: меня расстроил разговор с одногруппниками…"/></label>
          <div className="flex flex-wrap justify-between gap-2"><p className="subtle" id="description-hint">От 10 символов. Используйте вымышленную ситуацию.</p><span className="subtle" id="description-count">{description.length} / {maxLength}</span></div>
        </>}
        {step === 2 && <>
          <p className="subtle">Этот шаг можно пропустить. До пяти файлов, каждый до 10 МБ. Сами файлы доступны до обновления страницы.</p>
          <FilePicker onAdd={addFiles}/>
          <RecordAudio onAdd={addFiles} onBusy={setRecordPending}/>
          <DraftFiles files={files} onRemove={index => { setFiles(files.filter((_, position) => index !== position)); setError('') }}/>
        </>}
        {step === 3 && <>
          <dl className="review"><div><dt>Тема</dt><dd>{category}</dd></div><div><dt>Описание</dt><dd>{description.trim()}</dd></div>
            <div><dt>Вложения</dt><dd>{files.length ? <DraftFiles files={files}/> : 'Без вложений'}</dd></div></dl>
          {previousExpert && <label className="checkbox"><input type="checkbox" checked={preferPrevious} onChange={event => setPreferPrevious(event.target.checked)}/> Попросить назначить прежнего специалиста ({previousExpert.role.toLowerCase()})</label>}
          <label className="checkbox"><input type="checkbox" checked={consent} onChange={event => { setConsent(event.target.checked); setError('') }}/> Я использую вымышленные сведения и тестовые файлы</label>
        </>}
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions form-actions">
          {step > 0 && <button className="button secondary" type="button" onClick={() => { setStep(step - 1); setError(''); setRecordPending(false) }}><ArrowLeft size={17}/> Назад</button>}
          <button className="button" type="submit" disabled={recordPending}>{step < 3 ? 'Далее' : 'Отправить обращение'} <ArrowRight size={17}/></button>
        </div>
      </form>
    </div>
  </section>
}
