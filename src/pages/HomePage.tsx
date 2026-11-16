import { ArrowDown, ArrowUpRight, CloudRain, Fingerprint, Hash, HeartHandshake, Home, LifeBuoy, MessageCircle, Scale, Shield, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Emergency, useTone } from '../components/Common'
import './home.css'

const topics = [
  [CloudRain, 'Тревога и стресс', 'Когда переживания мешают отдыху, учёбе или работе.'],
  [Users, 'Буллинг и конфликты', 'Травля, давление и ссоры дома, в школе или на работе.'],
  [Home, 'Сложности в семье', 'Когда с близкими трудно договориться или поговорить.'],
  [HeartHandshake, 'Чувство одиночества', 'Когда хочется выговориться и рядом нет собеседника.'],
  [LifeBuoy, 'Кризисные ситуации', 'Когда трудно разобраться, к кому обратиться за поддержкой.'],
  [Scale, 'Юридическая поддержка', 'Вопросы о правах и возможных способах их защитить.'],
] as const

const principles = [
  [Fingerprint, 'Без имени и регистрации'],
  [Hash, 'Доступ по номеру обращения'],
  [MessageCircle, 'Переписка в удобное время'],
  [Shield, 'Личный диалог со специалистом'],
] as const

export function HomePage() {
  const say = useTone()
  const steps = [
    say('Расскажите о ситуации', 'Расскажи о ситуации'),
    say('Сохраните номер обращения', 'Сохрани номер обращения'),
    say('Дождитесь назначения специалиста', 'Дождись назначения специалиста'),
    say('Вернитесь к переписке', 'Вернись к переписке'),
  ]

  return <>
    <section className="wrap hero">
      <div className="hero-copy">
        <p className="eyebrow">Анонимная поддержка</p>
        <h1>Не обязательно справляться со всем <em>в одиночку</em></h1>
        <p className="lede">Здесь можно рассказать о том, что происходит, и получить поддержку. Без имени, регистрации и лишних вопросов.</p>
        <div className="actions">
          <Link className="button" to="/appeal/new">Мне нужна помощь <ArrowUpRight size={18} /></Link>
          <Link className="button secondary" to="/how-it-works">Как это работает <ArrowDown size={16} /></Link>
        </div>
        <p className="hero-demo">Учебная версия. Обращения остаются в браузере.</p>
      </div>
      <figure className="hero-photo">
        <img src="/images/daria-trofimova.webp" width="1200" height="1800" fetchPriority="high" alt="Женщина сидит рядом с собакой на лугу в лучах заходящего солнца" />
        <figcaption><a href="https://unsplash.com/photos/a-person-sitting-in-a-field-with-a-dog-fa0zrToQHQ0">Дарья Трофимова / Unsplash</a></figcaption>
      </figure>
    </section>
    <section className="home-topics">
      <div className="wrap">
        <h2>Как мы можем помочь</h2>
        <div className="topic-grid">{topics.map(([Icon, title, description]) => <article key={title}>
          <Icon size={25}/><div><h3>{title}</h3><p>{description}</p></div>
        </article>)}</div>
      </div>
    </section>
    <section className="wrap journey">
      <div><h2>Как работает «Отклик»</h2><p className="lede">От первого сообщения до переписки со специалистом.</p><Link to="/how-it-works" className="text-link">Подробнее о шагах</Link></div>
      <ol>{steps.map((step, index) => <li key={step}><span aria-hidden="true">{index + 1}</span>{step}</li>)}</ol>
    </section>
    <section className="home-privacy">
      <div className="wrap">
        <h2>Почему можно обратиться</h2>
        <ul>{principles.map(([Icon, label]) => <li key={label}><Icon size={20}/>{label}</li>)}</ul>
        <p>В учебной версии можно пройти весь сценарий с вымышленными данными.</p>
      </div>
    </section>
    <div className="wrap home-emergency"><Emergency /></div>
  </>
}
