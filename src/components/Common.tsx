import { ArrowUpRight, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useOutletContext } from 'react-router-dom'

export function useTone() {
  const tone = useOutletContext<string>()
  return (formal: string, informal: string) => tone === 'ты' ? informal : formal
}

export function PageHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return <header className="page-heading">
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h1>{title}</h1>
    {children && <div className="lede">{children}</div>}
  </header>
}

export function Emergency() {
  const say = useTone()
  return <aside className="emergency" aria-label="Экстренная помощь">
    <span className="emergency-icon"><Phone size={22} /></span>
    <div><h2>Если нужна помощь прямо сейчас</h2>
      <p>{say('При угрозе жизни или здоровью позвоните в экстренные службы.', 'При угрозе жизни или здоровью позвони в экстренные службы.')} Номер действует по всей России.</p></div>
    <a className="button secondary" href="tel:112">Позвонить 112 <ArrowUpRight size={16} /></a>
  </aside>
}

export function DemoNotice({ children = 'Вводите только вымышленные сведения. Данные остаются в этом браузере.' }: { children?: ReactNode }) {
  return <aside className="notice"><strong>Демонстрационный режим</strong><p>{children}</p></aside>
}

export function MissingAppeal() {
  return <section className="wrap page narrow"><PageHeading title="Обращение не найдено">Оно могло быть создано в другом браузере или удалено.</PageHeading><Link className="button" to="/appeal/check">Проверить номер</Link></section>
}
