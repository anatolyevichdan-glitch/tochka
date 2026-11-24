import { useState } from 'react'
import { ArrowRight, BriefcaseBusiness } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DemoNotice, PageHeading } from '../components/Common'
import { deskFor, selectEmployee } from '../components/Staff'
import { useDemo } from '../data/demo'
import { roles } from '../data/model'

export function StaffLoginPage() {
  const { employees } = useDemo()
  const [selected, setSelected] = useState('')
  const navigate = useNavigate()
  const available = employees.filter(employee => employee.active)
  const employee = available.find(item => item.id === selected)

  return <section className="wrap page narrow">
    <PageHeading title="Вход для сотрудников">Откройте учебный кабинет оператора, профильного специалиста, администратора или аналитика.</PageHeading>
    <div className="stack">
      <DemoNotice>Все сотрудники и обращения вымышлены. Для доступа к учебному кабинету достаточно выбрать роль.</DemoNotice>
      <form className="panel stack" onSubmit={event => {
        event.preventDefault()
        if (!employee) return
        selectEmployee(employee.id)
        navigate('/' + deskFor(employee))
      }}>
        <div className="flex items-center gap-3"><BriefcaseBusiness className="text-forest" size={22}/><h2 className="text-xl">Демонстрационный вход</h2></div>
        <label className="field">Тестовый сотрудник
          <select className="input" value={selected} onChange={event => setSelected(event.target.value)} required>
            <option value="">Выберите роль и сотрудника</option>
            {roles.map(role => {
              const group = available.filter(item => item.role === role)
              return group.length > 0 && <optgroup key={role} label={role}>{group.map(item => <option key={item.id} value={item.id}>{item.name} — {item.role.toLowerCase()}</option>)}</optgroup>
            })}
          </select>
        </label>
        <button className="button justify-self-start" disabled={!employee} type="submit">Войти в кабинет <ArrowRight size={17}/></button>
      </form>
    </div>
  </section>
}
