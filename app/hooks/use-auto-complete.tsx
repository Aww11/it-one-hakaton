"use client"

import { useState, useEffect, useCallback } from "react"
import type { Suggestion } from "../types"

// Простые шаблоны для автодополнения
const templates = {
  ru: {
    functional: [
      "Система должна предоставлять пользователю возможность {action} {object}.",
      "Пользователь должен иметь возможность {action} {object} для {result}.",
      "{actor} должен иметь возможность {action} {object}.",
      "При {action}, система должна {result}.",
    ],
    nonFunctional: [
      "Система должна обеспечивать {action} с временем отклика не более {value} секунд.",
      "Интерфейс должен быть интуитивно понятным для {actor}.",
      "Система должна поддерживать одновременную работу не менее {value} пользователей.",
      "Данные должны быть защищены с использованием {object}.",
    ],
  },
  en: {
    functional: [
      "The system shall provide the user with the ability to {action} {object}.",
      "The user shall be able to {action} {object} to {result}.",
      "{actor} shall be able to {action} {object}.",
      "When {action}, the system shall {result}.",
    ],
    nonFunctional: [
      "The system shall provide {action} with a response time of no more than {value} seconds.",
      "The interface shall be intuitive for {actor}.",
      "The system shall support simultaneous operation of at least {value} users.",
      "Data shall be protected using {object}.",
    ],
  },
}

// Общие слова для автодополнения
const commonWords = {
  ru: {
    actions: [
      "создать",
      "просмотреть",
      "редактировать",
      "удалить",
      "экспортировать",
      "импортировать",
      "отправить",
      "получить",
    ],
    objects: ["документ", "отчет", "пользователя", "профиль", "настройки", "данные", "файл", "запись"],
    actors: ["пользователь", "администратор", "менеджер", "система", "клиент", "сотрудник"],
    results: ["получения информации", "управления данными", "контроля процесса", "оптимизации работы"],
  },
  en: {
    actions: ["create", "view", "edit", "delete", "export", "import", "send", "receive"],
    objects: ["document", "report", "user", "profile", "settings", "data", "file", "record"],
    actors: ["user", "administrator", "manager", "system", "client", "employee"],
    results: ["obtaining information", "managing data", "controlling the process", "optimizing work"],
  },
}

interface UseAutoCompleteProps {
  currentText: string
  language: "ru" | "en"
  context?: {
    recentRequirements?: string[]
    recentEntities?: string[]
  }
}

export function useAutoComplete({ currentText, language, context }: UseAutoCompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  // Move the generateSuggestions logic directly into the useEffect
  // to avoid recreating the function on every render
  useEffect(() => {
    // Skip processing if text is too short
    if (!currentText || currentText.length < 3) {
      setSuggestions([])
      return
    }

    const newSuggestions: Suggestion[] = []
    const lang = language === "ru" ? "ru" : "en"
    const words = currentText.split(" ")
    const lastWord = words[words.length - 1].toLowerCase()

    // If text looks like the beginning of a requirement, suggest a template
    if (currentText.length < 30) {
      if (
        lang === "ru" &&
        (currentText.includes("должен") || currentText.includes("должна") || currentText.includes("система"))
      ) {
        templates.ru.functional.forEach((template, index) => {
          newSuggestions.push({
            id: `template-func-${index}`,
            text: template
              .replace("{action}", commonWords.ru.actions[Math.floor(Math.random() * commonWords.ru.actions.length)])
              .replace("{object}", commonWords.ru.objects[Math.floor(Math.random() * commonWords.ru.objects.length)])
              .replace("{actor}", commonWords.ru.actors[Math.floor(Math.random() * commonWords.ru.actors.length)])
              .replace("{result}", commonWords.ru.results[Math.floor(Math.random() * commonWords.ru.results.length)]),
            context: "template",
            accepted: false,
            timestamp: new Date(),
          })
        })
      } else if (
        lang === "en" &&
        (currentText.includes("shall") || currentText.includes("system") || currentText.includes("user"))
      ) {
        templates.en.functional.forEach((template, index) => {
          newSuggestions.push({
            id: `template-func-${index}`,
            text: template
              .replace("{action}", commonWords.en.actions[Math.floor(Math.random() * commonWords.en.actions.length)])
              .replace("{object}", commonWords.en.objects[Math.floor(Math.random() * commonWords.en.objects.length)])
              .replace("{actor}", commonWords.en.actors[Math.floor(Math.random() * commonWords.en.actors.length)])
              .replace("{result}", commonWords.en.results[Math.floor(Math.random() * commonWords.en.results.length)]),
            context: "template",
            accepted: false,
            timestamp: new Date(),
          })
        })
      }
    }

    // Suggestions based on the last word
    const wordList = lang === "ru" ? commonWords.ru : commonWords.en

    for (const category in wordList) {
      const words = wordList[category as keyof typeof wordList]
      for (const word of words) {
        if (word.startsWith(lastWord) && word !== lastWord) {
          const textWithoutLastWord = currentText.substring(0, currentText.length - lastWord.length)
          newSuggestions.push({
            id: `word-${word}`,
            text: textWithoutLastWord + word,
            context: "word",
            accepted: false,
            timestamp: new Date(),
          })
        }
      }
    }

    // Limit the number of suggestions
    setSuggestions(newSuggestions.slice(0, 3))
  }, [currentText, language]) // Only depend on currentText and language

  const acceptSuggestion = useCallback((suggestionId: string) => {
    setSuggestions((prev) => prev.map((s) => (s.id === suggestionId ? { ...s, accepted: true } : s)))
  }, [])

  return {
    suggestions,
    acceptSuggestion,
  }
}
