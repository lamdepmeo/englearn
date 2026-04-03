import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
} from 'microsoft-cognitiveservices-speech-sdk'
import * as speechSDK from 'microsoft-cognitiveservices-speech-sdk'

export const hasAzureSpeechConfig = () =>
  Boolean(process.env.AZURE_SECRET && process.env.AZURE_REGION)

const getBrowserSpeechRecognition = () => {
  if (typeof window === 'undefined') {
    return null
  }
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export const hasSpeechRecordingSupport = () =>
  hasAzureSpeechConfig() || Boolean(getBrowserSpeechRecognition())

export const hasSpeechPlaybackSupport = () =>
  hasAzureSpeechConfig() ||
  (typeof window !== 'undefined' && Boolean(window.speechSynthesis))

export const getSpeakToTextApi = () => {
  if (hasAzureSpeechConfig()) {
    const speechConfig = SpeechConfig.fromSubscription(
      process.env.AZURE_SECRET,
      process.env.AZURE_REGION
    )
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput()
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig)
    return recognizer
  }

  const BrowserSpeechRecognition = getBrowserSpeechRecognition()
  if (!BrowserSpeechRecognition) {
    return null
  }

  const recognition = new BrowserSpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = false
  recognition.lang = 'en-US'

  const recognizer = {
    recognized: null,
    sessionStopped: null,
    startContinuousRecognitionAsync: (onSuccess, onError) => {
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0]?.transcript || '')
          .join('')
          .trim()
        if (!transcript) {
          return
        }
        recognizer.recognized?.(null, { result: { text: transcript } })
      }
      recognition.onend = () => {
        recognizer.sessionStopped?.(null, null)
      }
      recognition.onerror = (event) => {
        onError?.(event)
      }
      recognition.start()
      onSuccess?.()
    },
    stopContinuousRecognitionAsync: () => {
      recognition.stop()
    },
  }

  return recognizer
}

export const azureSpeechSynthesize = (
  text: string,
  voiceId: string,
  setIsPlaying: (isPlaying) => void
) => {
  if (!hasSpeechPlaybackSupport()) {
    setIsPlaying(false)
    return null
  }

  if (!hasAzureSpeechConfig()) {
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const selectedVoice = voices.find((voice) => voice.name === voiceId)
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    utterance.onend = () => {
      setIsPlaying(false)
    }
    utterance.onerror = () => {
      setIsPlaying(false)
    }
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)

    return {
      pause: () => {
        window.speechSynthesis.cancel()
      },
    }
  }

  const speechConfig = speechSDK.SpeechConfig.fromSubscription(
    process.env.AZURE_SECRET,
    process.env.AZURE_REGION
  )
  speechConfig.speechSynthesisVoiceName = voiceId
  const player = new speechSDK.SpeakerAudioDestination()
  const audioConfig = speechSDK.AudioConfig.fromSpeakerOutput(player)
  const speechSynthesizer = new speechSDK.SpeechSynthesizer(
    speechConfig,
    audioConfig
  )
  player.onAudioEnd = () => {
    setIsPlaying(false)
  }
  speechSynthesizer.speakTextAsync(
    text,
    (result) => {
      speechSynthesizer.close()
    },
    (error) => {
      console.log(error)
      speechSynthesizer.close()
    }
  )
  return player
}
