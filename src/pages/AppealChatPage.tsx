import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Chat } from '../components/Chat'
import { DemoNotice, MissingAppeal, PageHeading, useTone } from '../components/Common'
import { demo, useDemo } from '../data/demo'
import '../components/forms.css'

export function AppealChatPage() {
  const { id } = useParams()
  const { appeals, employees } = useDemo()
  const appeal = appeals.find(item => item.id === id)
  const last = appeal?.messages.at(-1)
  const say = useTone()
  const lastUserMessageId = last?.author === 'user' ? last.id : undefined
  const waiting = Boolean(appeal && appeal.status !== 'Завершено' && lastUserMessageId)
  const reply = say(
    'Учебное сообщение получено. Здесь появится ответ специалиста, когда к платформе подключат консультации.',
    'Учебное сообщение получено. Здесь появится ответ специалиста, когда к платформе подключат консультации.',
  )

  useEffect(() => {
    if (!waiting || !id || !lastUserMessageId) return
    const timer = window.setTimeout(() => demo.reply(id, lastUserMessageId, reply), 1200)
    return () => window.clearTimeout(timer)
  }, [id, lastUserMessageId, reply, waiting])

  if (!appeal) return <MissingAppeal/>
  const expert = employees.find(employee => employee.id === appeal.expertId)
  return <section className="wrap page max-w-[54rem]">
    <Link className="text-link mb-5 inline-flex items-center gap-2" to={'/appeal/check?number=' + appeal.id}><ArrowLeft size={17}/> К статусу</Link>
    <PageHeading title="Переписка" eyebrow={appeal.id}>{appeal.category} · {appeal.status}{expert && ' · ' + expert.role.toLowerCase()}</PageHeading>
    <div className="stack">
      <DemoNotice>В чате доступны учебные ответы и сообщения из кабинета эксперта. Реальные консультации в прототипе не проводятся.</DemoNotice>
      <Chat key={appeal.id} appeal={appeal} author="user" waiting={waiting}/>
      <Link className="text-link" to="/help">Памятки и экстренная помощь</Link>
    </div>
  </section>
}
