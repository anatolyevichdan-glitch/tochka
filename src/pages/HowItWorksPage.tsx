import { ArrowUpRight, ClipboardList, Hash, MessageCircle, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeading, useTone } from '../components/Common'

export function HowItWorksPage() {
  const say = useTone()
  const journey = [
    [ClipboardList, say('Опишите ситуацию', 'Опиши ситуацию'), 'Выберите тему, добавьте описание и при необходимости приложите файлы или аудио.'],
    [Hash, say('Сохраните номер', 'Сохрани номер'), 'Номер открывает статус и чат. В учебной версии он работает в том же браузере.'],
    [Users, 'Назначение специалиста', 'Оператор оценит срочность и выберет специалиста. Во время ожидания можно открыть памятки.'],
    [MessageCircle, say('Вернитесь в чат', 'Вернись в чат'), 'В демонстрации можно отправить сообщение, увидеть пример ответа и проверить изменение статуса.'],
  ] as const
  return <section className="wrap page narrow">
    <PageHeading title="Как это работает">От заполнения формы до возвращения в переписку.</PageHeading>
    <ol className="mb-8 divide-y divide-[#d9dfd2] border-y border-[#d9dfd2]">
      {journey.map(([Icon, title, note]) => <li className="grid grid-cols-[auto_1fr] gap-4 py-5" key={title}><span className="grid size-11 place-items-center rounded-lg bg-sage text-forest"><Icon size={21} /></span><div><h2 className="text-xl">{title}</h2><p className="mt-1 text-[#535f56]">{note}</p></div></li>)}
    </ol>
    <div className="actions"><Link className="button" to="/appeal/new">Создать обращение <ArrowUpRight size={17} /></Link><Link className="button secondary" to="/appeal/check">Проверить номер</Link></div>
  </section>
}
