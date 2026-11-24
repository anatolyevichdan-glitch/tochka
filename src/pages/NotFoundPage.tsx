import { ArrowLeft, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeading } from '../components/Common'

export function NotFoundPage() {
  return <section className="wrap page narrow">
    <PageHeading eyebrow="Ошибка 404" title="Страница не найдена">Если вы искали своё обращение, его можно открыть по номеру.</PageHeading>
    <div className="actions"><Link className="button" to="/"><ArrowLeft size={17}/> На главную</Link><Link className="button secondary" to="/appeal/check"><Search size={17}/> Проверить обращение</Link></div>
  </section>
}
