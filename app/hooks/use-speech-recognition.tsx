"use client"

import { useState, useEffect, useCallback } from "react"
import type { RequirementElement } from "../types"

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void
  onStructuredResult?: (elements: RequirementElement) => void
  language?: string
}

export function useSpeechRecognition({ onResult, onStructuredResult, language = "ru-RU" }: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Проверяем поддержку API в браузере
    setIsSupported("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
  }, [])

  // Функция для структурирования текста в элементы требования
  const structureRequirement = useCallback((text: string): RequirementElement => {
    const result: RequirementElement = {}

    // Простые шаблоны для выделения элементов требования
    const actorPatterns = [
      /(?:пользователь|администратор|система|клиент|сотрудник|менеджер|оператор|user|admin|system|client|employee|manager|operator) (должен|может|should|can|must)/i,
      /(как|as) (?:пользователь|администратор|система|клиент|сотрудник|менеджер|оператор|user|admin|system|client|employee|manager|operator)/i,
    ]

    const actionPatterns = [
      /(должен|может|should|can|must) (иметь возможность |be able to )?(создавать|просматривать|редактировать|удалять|отправлять|получать|загружать|скачивать|create|view|edit|delete|send|receive|upload|download)/i,
      /(создаёт|просматривает|редактирует|удаляет|отправляет|получает|загружает|скачивает|creates|views|edits|deletes|sends|receives|uploads|downloads)/i,
    ]

    const objectPatterns = [
      /(создавать|просматривать|редактировать|удалять|отправлять|получать|загружать|скачивать|create|view|edit|delete|send|receive|upload|download) ([а-яА-Яa-zA-Z\s]+) (для|в|на|to|for|in|on)/i,
      /(данные|информацию|файлы|документы|записи|отчеты|data|information|files|documents|records|reports)/i,
    ]

    const resultPatterns = [
      /(чтобы|для того чтобы|so that|in order to) ([а-яА-Яa-zA-Z\s]+)/i,
      /(результатом должно быть|результат|the result should be|result) ([а-яА-Яa-zA-Z\s]+)/i,
    ]

    // Поиск актора
    for (const pattern of actorPatterns) {
      const match = text.match(pattern)
      if (match) {
        const actorWords = [
          "пользователь",
          "администратор",
          "система",
          "клиент",
          "сотрудник",
          "менеджер",
          "оператор",
          "user",
          "admin",
          "system",
          "client",
          "employee",
          "manager",
          "operator",
        ]
        for (const word of actorWords) {
          if (match[0].toLowerCase().includes(word)) {
            result.actor = word
            break
          }
        }
        break
      }
    }

    // Поиск действия
    for (const pattern of actionPatterns) {
      const match = text.match(pattern)
      if (match) {
        const actionWords = [
          "создавать",
          "просматривать",
          "редактировать",
          "удалять",
          "отправлять",
          "получать",
          "загружать",
          "скачивать",
          "create",
          "view",
          "edit",
          "delete",
          "send",
          "receive",
          "upload",
          "download",
          "создаёт",
          "просматривает",
          "редактирует",
          "удаляет",
          "отправляет",
          "получает",
          "загружает",
          "скачивает",
          "creates",
          "views",
          "edits",
          "deletes",
          "sends",
          "receives",
          "uploads",
          "downloads",
        ]
        for (const word of actionWords) {
          if (match[0].toLowerCase().includes(word)) {
            result.action = word
            break
          }
        }
        break
      }
    }

    // Поиск объекта
    for (const pattern of objectPatterns) {
      const match = text.match(pattern)
      if (match && match[2]) {
        result.object = match[2].trim()
        break
      }
    }

    // Поиск результата
    for (const pattern of resultPatterns) {
      const match = text.match(pattern)
      if (match && match[2]) {
        result.result = match[2].trim()
        break
      }
    }

    return result
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = language
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("")

      onResult(transcript)

      // Если передан обработчик структурированного результата
      if (onStructuredResult) {
        const structuredElements = structureRequirement(transcript)
        onStructuredResult(structuredElements)
      }
    }

    recognition.onerror = (event) => {
      console.error("Ошибка распознавания речи:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()

    return () => {
      recognition.stop()
    }
  }, [isSupported, language, onResult, onStructuredResult, structureRequirement])

  const stopListening = useCallback(() => {
    setIsListening(false)
  }, [])

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  }
}
