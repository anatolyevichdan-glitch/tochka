import { Download, Paperclip, X } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { formatSize } from '../data/model'
import type { Attachment } from '../data/model'
import { demo } from '../data/demo'

export const fileLimit = 5
const maxSize = 10 * 1024 * 1024

export function chooseFiles(current: File[], incoming: File[]) {
  if (current.length + incoming.length > fileLimit) return { files: current, error: 'Можно добавить до пяти файлов.' }
  if (incoming.some(file => file.size > maxSize)) return { files: current, error: 'Размер одного файла не должен превышать 10 МБ.' }
  return { files: [...current, ...incoming], error: '' }
}

export function FilePicker({ onAdd, label = 'Прикрепить файлы' }: { onAdd: (files: File[]) => void; label?: string }) {
  function select(event: ChangeEvent<HTMLInputElement>) {
    onAdd(Array.from(event.target.files ?? []))
    event.target.value = ''
  }
  return <label className="file-picker button secondary">
    <input className="sr-only" type="file" aria-label={label} multiple onChange={select} />
    <Paperclip size={17} />{label}
  </label>
}

export function DraftFiles({ files, onRemove }: { files: File[]; onRemove?: (index: number) => void }) {
  if (!files.length) return null
  return <ul className="file-list">{files.map((file, index) => <li key={file.name + '-' + index}>
    <Paperclip size={17} /><div><span>{file.name}</span><small>{formatSize(file.size)}</small></div>
    {onRemove && <button type="button" className="icon-button" onClick={() => onRemove(index)} aria-label={'Удалить ' + file.name}><X size={17} /></button>}
  </li>)}</ul>
}

export function SavedFiles({ files }: { files: Attachment[] }) {
  if (!files.length) return null
  return <ul className="file-list">{files.map(file => <li key={file.id}>
    <Paperclip size={17} /><div><span>{file.name}</span><small>{formatSize(file.size)}{!demo.hasFile(file.id) && ' · только сведения о файле'}</small></div>
    {demo.hasFile(file.id) && <button type="button" className="icon-button" onClick={() => demo.openFile(file.id)} aria-label={'Скачать ' + file.name}><Download size={17} /></button>}
  </li>)}</ul>
}
