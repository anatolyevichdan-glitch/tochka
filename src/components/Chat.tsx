import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import type { Appeal, Message } from '../data/model'
import { demo } from '../data/demo'
import { chooseFiles, DraftFiles, FilePicker, SavedFiles } from './Files'
import './chat.css'

const labels: Record<Message['author'], string> = {
  user: 'Заявитель', expert: 'Специалист', demo: 'Демонстрационный ответ',
}

export function Chat({ appeal, author, waiting = false }: { appeal: Appeal; author: 'user' | 'expert'; waiting?: boolean }) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [kind, setKind] = useState<Message['kind']>('message')
  const log = useRef<HTMLDivElement>(null)
  const closed = appeal.status === 'Завершено'
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight
  }, [appeal.messages, waiting])

  function send() {
    if (closed || (!text.trim() && !files.length)) return
    demo.send(appeal.id, author, text.trim(), files, kind)
    setText('')
    setFiles([])
    setError('')
  }

  return <div className="chat">
    <div className="chat-log" role="log" aria-label="Переписка" tabIndex={0} ref={log}>
      {!appeal.messages.length && <div className="chat-empty"><MessageCircle size={26}/><p>Переписка пока пуста</p></div>}
      {appeal.messages.map(message => <article className={'bubble' + (message.author === author ? ' own' : '')} key={message.id}>
        <div className="bubble-meta"><strong>{message.author === author ? 'Вы' : labels[message.author]}</strong><time dateTime={message.time}>{new Date(message.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</time></div>
        {message.kind === 'recommendation' && <span className="chip">Рекомендация</span>}
        {message.text && <p>{message.text}</p>}
        <SavedFiles files={message.files}/>
      </article>)}
      {waiting && <p className="subtle">Готовится учебный ответ…</p>}
    </div>
    {closed ? <p className="chat-footer subtle">Обращение завершено. История переписки доступна для просмотра.</p> : <form className="chat-footer stack" onSubmit={event => { event.preventDefault(); send() }}>
      {author === 'expert' && <label className="field">Тип ответа
        <select className="input max-w-60" value={kind} onChange={event => setKind(event.target.value === 'recommendation' ? 'recommendation' : 'message')}>
          <option value="message">Сообщение</option><option value="recommendation">Рекомендация</option>
        </select></label>}
      <label className="field">Сообщение
        <textarea className="input" rows={3} maxLength={2500} placeholder="Напишите учебное сообщение…" value={text} onChange={event => setText(event.target.value)} onKeyDown={event => {
          if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
          event.preventDefault()
          send()
        }}/>
      </label>
      <DraftFiles files={files} onRemove={index => { setFiles(files.filter((_, position) => index !== position)); setError('') }}/>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions justify-between">
        <FilePicker onAdd={added => { const result = chooseFiles(files, added); setError(result.error); setFiles(result.files) }}/>
        <button className="button" disabled={!text.trim() && !files.length} type="submit">Отправить <Send size={16}/></button>
      </div>
      <p className="subtle">Enter отправляет сообщение. Shift + Enter переносит строку.</p>
    </form>}
  </div>
}
