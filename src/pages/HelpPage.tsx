import { ArrowUpRight, ChevronDown, PhoneCall } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Emergency, PageHeading, useTone } from '../components/Common'

export function HelpPage() {
  const say = useTone()
  const notes = [
    ['Трудно начать разговор', say('Можно начать с одного предложения: «Мне сейчас тяжело, можно с вами поговорить?» Не обязательно сразу рассказывать всё.', 'Можно начать с одного предложения: «Мне сейчас тяжело, можно поговорить?» Не обязательно сразу рассказывать всё.')],
    ['Травля или конфликт', say('Если это безопасно, обратитесь к человеку, которому доверяете. Можно заранее записать, что произошло и какая поддержка нужна.', 'Если это безопасно, обратись к человеку, которому доверяешь. Можно заранее записать, что произошло и какая поддержка нужна.')],
    ['Ожидание ответа', say('Сохраните номер обращения и вернитесь к нему в этом браузере. В учебной версии появится пример ответа.', 'Сохрани номер обращения и вернись к нему в этом браузере. В учебной версии появится пример ответа.')],
  ]

  return <section className="wrap page narrow">
    <PageHeading title="Памятки и экстренная помощь">Контакты в России и короткие подсказки, с которых можно начать.</PageHeading>
    <div className="space-y-5">
      <Emergency />
      <div className="panel flex items-start gap-3">
        <PhoneCall className="shrink-0 text-forest" size={22} />
        <div><h2 className="text-lg">Детский телефон доверия</h2><p className="my-2 text-[#535f56]">Поддержка для детей, подростков и родителей.</p><a className="text-link" href="https://telefon-doveria.ru/contacts/">Официальные контакты <ArrowUpRight size={15} className="inline" /></a></div>
      </div>
      <section className="pt-3"><h2 className="mb-4">Короткие памятки</h2>
        {notes.map(([title, description]) => <details key={title} className="group border-t border-[#d9dfd2] py-3"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">{title}<ChevronDown size={18} className="shrink-0 group-open:rotate-180" /></summary><p className="mt-3 text-[#535f56]">{description}</p></details>)}
      </section>
      <Link className="button secondary" to="/appeal/new">Открыть учебную форму <ArrowUpRight size={17} /></Link>
    </div>
  </section>
}
