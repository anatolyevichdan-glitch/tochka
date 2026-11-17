import { useEffect } from 'react'
import { Mic, Square } from 'lucide-react'
import { useRecording } from '../hooks/useRecording'

export function RecordAudio({ onAdd, onBusy }: { onAdd: (files: File[]) => void; onBusy: (busy: boolean) => void }) {
  const recording = useRecording(file => onAdd([file]))
  const busy = recording.state !== 'idle'
  useEffect(() => { onBusy(busy) }, [busy, onBusy])

  return <div className="stack">
    <button type="button" className="button secondary justify-self-start" disabled={recording.state === 'requesting'} onClick={
      recording.state === 'recording' ? recording.stop : recording.start
    }>{recording.state === 'recording' ? <><Square size={16}/> Остановить запись</> : <><Mic size={18}/> {busy ? 'Ожидание разрешения' : 'Записать голос'}</>}</button>
    {recording.state === 'recording' && <p className="success" role="status">Идёт запись. Максимальная длина — 60 секунд.</p>}
    {recording.error && <p className="error" role="alert">{recording.error}</p>}
  </div>
}
