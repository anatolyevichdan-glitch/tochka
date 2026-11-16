import { ArrowUpRight, LockKeyhole, MessageCircle, Route, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DemoNotice, PageHeading } from '../components/Common'

const roles = [
  [Users, 'Заявитель', 'Создаёт обращение без учётной записи и возвращается к диалогу по номеру.'],
  [Route, 'Оператор', 'Оценивает срочность и направляет обращение профильному специалисту.'],
  [MessageCircle, 'Эксперт', 'Ведёт назначенные обращения. Экспертом может быть психолог, конфликтолог или юрист.'],
  [LockKeyhole, 'Администратор', 'Управляет учётными записями сотрудников и смотрит обезличенные отчёты.'],
] as const

export function AboutPage() {
  return <section className="wrap page narrow">
    <PageHeading title="О проекте" eyebrow="Отклик">Учебный проект платформы анонимной психологической и кризисной поддержки.</PageHeading>
    <div className="space-y-8">
      <section className="space-y-3"><h2>Зачем нужен «Отклик»</h2><p>В трудной ситуации бывает сложно сразу позвонить или рассказать о себе. В «Отклике» можно описать, что происходит, и продолжить общение позже по номеру обращения.</p></section>
      <section><h2 className="mb-4">Кто работает с обращением</h2><ul className="divide-y divide-[#d9dfd2] border-y border-[#d9dfd2]">
        {roles.map(([Icon, title, description]) => <li key={title} className="grid grid-cols-[auto_1fr] gap-4 py-4"><Icon className="text-forest" /><div><h3>{title}</h3><p className="mt-1 text-[#535f56]">{description}</p></div></li>)}
      </ul></section>
      <DemoNotice>Формы, кабинеты и переписка работают с учебными данными. Реальные консультанты к этой версии не подключены.</DemoNotice>
      <Link className="button secondary" to="/how-it-works">Порядок обращения <ArrowUpRight size={17} /></Link>
    </div>
  </section>
}
