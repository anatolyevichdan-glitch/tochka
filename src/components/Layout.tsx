import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const navigation = [
  ['/', 'Главная'], ['/how-it-works', 'Как это работает'], ['/help', 'Получить помощь'],
  ['/appeal/check', 'Проверить обращение'], ['/about', 'О проекте'],
]

export function Layout() {
  const [open, setOpen] = useState(false)
  const [tone, setTone] = useState(() => localStorage.getItem('otklik:tone') === 'ты' ? 'ты' : 'вы')
  const { pathname } = useLocation()
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [])
  useEffect(() => {
    window.scrollTo(0, 0)
    setOpen(false)
    document.getElementById('content')?.focus({ preventScroll: true })
  }, [pathname])

  return <>
    <a className="skip" href="#content">К содержанию</a>
    <header className="header">
      <div className="wrap header-inner">
        <Link className="logo" to="/" aria-label="Отклик, главная">отклик<span>.</span></Link>
        <button type="button" className="icon-button menu-toggle" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav id="site-nav" className={open ? 'nav is-open' : 'nav'} aria-label="Основная навигация">
          {navigation.map(([to, label]) => <NavLink key={to} to={to} end onClick={() => setOpen(false)}>{label}</NavLink>)}
          <Link className="button nav-cta" to="/appeal/new">Получить помощь <ArrowUpRight size={17} /></Link>
        </nav>
      </div>
    </header>
    <main id="content" tabIndex={-1}><Outlet context={tone} /></main>
    <footer className="footer">
      <div className="wrap footer-grid">
        <div><Link className="logo" to="/">отклик<span>.</span></Link><p>Учебный прототип анонимной поддержки.</p></div>
        <nav aria-label="Ссылки в подвале"><Link to="/about">О проекте</Link><Link to="/help">Экстренная помощь</Link><Link to="/staff/login">Вход для сотрудников</Link></nav>
        <div><a className="emergency-number" href="tel:112">112</a><p>Экстренные службы в России</p>
          <label className="tone">Обращаться на <select value={tone} onChange={(event) => {
            const next = event.target.value
            localStorage.setItem('otklik:tone', next)
            setTone(next)
          }}><option>вы</option><option>ты</option></select></label>
        </div>
      </div>
    </footer>
  </>
}
