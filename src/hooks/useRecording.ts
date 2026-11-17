import { useEffect, useRef, useState } from 'react'

const maxDuration = 60_000

export function useRecording(onRecord: (file: File) => void) {
  const [state, setState] = useState<'idle' | 'requesting' | 'recording'>('idle')
  const [error, setError] = useState('')
  const active = useRef<MediaRecorder | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const mounted = useRef(false)
  const callback = useRef(onRecord)
  useEffect(() => { callback.current = onRecord }, [onRecord])
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      window.clearTimeout(timer.current)
      const recorder = active.current
      if (!recorder) return
      recorder.onstop = null
      if (recorder.state !== 'inactive') recorder.stop()
      recorder.stream.getTracks().forEach(track => track.stop())
      active.current = null
    }
  }, [])

  async function start() {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Запись недоступна в этом браузере. Можно прикрепить готовый аудиофайл.')
      return
    }
    setState('requesting')
    let stream: MediaStream | undefined
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!mounted.current) {
        stream.getTracks().forEach(track => track.stop())
        return
      }
      const chunks: Blob[] = []
      const recorder = new MediaRecorder(stream)
      active.current = recorder
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
      recorder.onerror = () => {
        setError('Не удалось записать звук. Проверьте подключение микрофона.')
      }
      recorder.onstop = () => {
        window.clearTimeout(timer.current)
        recorder.stream.getTracks().forEach(track => track.stop())
        active.current = null
        if (!mounted.current) return
        setState('idle')
        if (!chunks.length) return
        const extension = recorder.mimeType.includes('mp4') ? 'm4a' : recorder.mimeType.includes('ogg') ? 'ogg' : 'webm'
        callback.current(new File(chunks, 'Учебная запись.' + extension, { type: recorder.mimeType }))
      }
      recorder.start()
      setState('recording')
      timer.current = window.setTimeout(() => { if (recorder.state === 'recording') recorder.stop() }, maxDuration)
    } catch {
      stream?.getTracks().forEach(track => track.stop())
      active.current = null
      if (!mounted.current) return
      setState('idle')
      setError('Микрофон недоступен. Разрешите запись в браузере или прикрепите аудиофайл.')
    }
  }

  function stop() {
    if (active.current?.state === 'recording') active.current.stop()
  }

  return { state, start, stop, error }
}
