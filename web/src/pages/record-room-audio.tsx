/** biome-ignore-all lint/suspicious/noConsole: dev */
import { useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const isRecordingSupported: boolean =
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getUserMedia === 'function' &&
  typeof window.MediaRecorder === 'function'

type RecordRoomAudioParams = {
  roomId: string
}

export function RecordRoomAudio() {
  const [isRecording, setIsRecording] = useState<boolean>(false)

  const params = useParams<RecordRoomAudioParams>()
  const recorder = useRef<MediaRecorder | null>(null)

  function stopRecording() {
    setIsRecording(false)

    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.stop()
    }
  }

  async function uploadAudio(audio: Blob) {
    const formData = new FormData()

    formData.append('file', audio, 'audio.webm')

    const response = await fetch(
      `http://localhost:3333/rooms/${params.roomId}/audio`,
      { method: 'POST', body: formData }
    )

    const result = await response.json()
    console.log(result)
  }

  async function startRecording() {
    if (!isRecordingSupported) {
      alert('O seu navegador não suporta gravação')
      return
    }

    setIsRecording(true)

    try {
      const audio = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44_100,
        },
      })

      recorder.current = new MediaRecorder(audio, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 64_000,
      })

      recorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          uploadAudio(event.data)
        }
      }

      recorder.current.onstart = () => {
        console.log('Gravação iniciada!')
      }

      recorder.current.onstop = () => {
        console.log('Gravação encerrada!')
      }

      recorder.current.start()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  if (!params.roomId) {
    return <Navigate replace to="/" />
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      {isRecording ? (
        <Button className="cursor-pointer" onClick={stopRecording}>
          Pausar gravação
        </Button>
      ) : (
        <Button className="cursor-pointer" onClick={startRecording}>
          Gravar áudio
        </Button>
      )}
      <p>{isRecording ? 'Gravando...' : 'Pausado'}</p>
    </div>
  )
}
