"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Send, Globe, ChevronDown, Check } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useSpeechRecognition } from "../hooks/use-speech-recognition"
import { useAutoComplete } from "../hooks/use-auto-complete"
import type { EnhancedMessage, RequirementElement, Suggestion } from "../types"

export function DocumentationAssistant() {
  const [messages, setMessages] = useState<EnhancedMessage[]>([
    {
      id: 1,
      content:
        "Здравствуйте! Я ваш AI-ассистент для системных аналитиков. Я могу помочь вам с написанием документации, созданием требований и спецификаций. Чем я могу вам помочь сегодня?",
      sender: "assistant",
      timestamp: new Date(),
      language: "ru",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [language, setLanguage] = useState<"ru" | "en">("ru")
  const [structuredElements, setStructuredElements] = useState<RequirementElement>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Хук для автодополнения
  const { suggestions, acceptSuggestion } = useAutoComplete({
    currentText: inputValue,
    language,
    context: {
      recentRequirements: messages.filter((m) => m.sender === "user").map((m) => m.content),
    },
  })

  // Хук для распознавания речи
  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    onResult: (transcript) => {
      setInputValue(transcript)
    },
    onStructuredResult: (elements) => {
      // Only update if there are actual changes to avoid unnecessary renders
      if (JSON.stringify(elements) !== JSON.stringify(structuredElements)) {
        setStructuredElements(elements)
      }
    },
    language: language === "ru" ? "ru-RU" : "en-US",
  })

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message with structured elements if available
    const userMessage: EnhancedMessage = {
      id: messages.length + 1,
      content: inputValue,
      structuredContent: Object.keys(structuredElements).length > 0 ? structuredElements : undefined,
      sender: "user",
      timestamp: new Date(),
      language,
    }

    setMessages([...messages, userMessage])
    setInputValue("")
    setStructuredElements({})

    // Simulate AI response
    setTimeout(() => {
      const aiResponses =
        language === "ru"
          ? [
              "Я проанализировал ваше требование и добавил его в дерево зависимостей. Хотите уточнить какие-то детали?",
              "Требование добавлено. На основе анализа дерева зависимостей, это требование связано с модулем авторизации. Хотите добавить еще требования для этого модуля?",
              "Я структурировал ваше требование. Актор: " +
                (structuredElements.actor || "не определен") +
                ", Действие: " +
                (structuredElements.action || "не определено") +
                ", Объект: " +
                (structuredElements.object || "не определено") +
                ", Результат: " +
                (structuredElements.result || "не определено"),
              "Требование записано. Рекомендую также добавить нефункциональные требования по производительности для этой функциональности.",
            ]
          : [
              "I've analyzed your requirement and added it to the dependency tree. Would you like to clarify any details?",
              "Requirement added. Based on the dependency tree analysis, this requirement is related to the authorization module. Would you like to add more requirements for this module?",
              "I've structured your requirement. Actor: " +
                (structuredElements.actor || "not defined") +
                ", Action: " +
                (structuredElements.action || "not defined") +
                ", Object: " +
                (structuredElements.object || "not defined") +
                ", Result: " +
                (structuredElements.result || "not defined"),
              "Requirement recorded. I also recommend adding non-functional performance requirements for this functionality.",
            ]

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

      // Генерируем предложения для автодополнения
      const suggestionsForResponse: Suggestion[] = []
      for (let i = 0; i < 2; i++) {
        const templates =
          language === "ru"
            ? [
                "Система должна обеспечивать время отклика не более 2 секунд при выполнении этой операции.",
                "Пользователь должен иметь возможность отменить операцию на любом этапе.",
                "Система должна логировать все действия пользователя для аудита.",
              ]
            : [
                "The system shall ensure a response time of no more than 2 seconds when performing this operation.",
                "The user shall be able to cancel the operation at any stage.",
                "The system shall log all user actions for audit purposes.",
              ]

        suggestionsForResponse.push({
          id: `suggestion-${Date.now()}-${i}`,
          text: templates[i],
          context: "requirement",
          accepted: false,
          timestamp: new Date(),
        })
      }

      const assistantMessage: EnhancedMessage = {
        id: messages.length + 2,
        content: randomResponse,
        sender: "assistant",
        timestamp: new Date(),
        language,
        suggestions: suggestionsForResponse,
      }

      setMessages((prev) => [...prev, assistantMessage])
    }, 1000)
  }

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleLanguageChange = (newLanguage: "ru" | "en") => {
    setLanguage(newLanguage)

    // Добавляем системное сообщение о смене языка
    const systemMessage: EnhancedMessage = {
      id: messages.length + 1,
      content: newLanguage === "ru" ? "Язык изменен на русский." : "Language changed to English.",
      sender: "assistant",
      timestamp: new Date(),
      language: newLanguage,
    }

    setMessages([...messages, systemMessage])
  }

  const applySuggestion = (suggestion: Suggestion) => {
    setInputValue(suggestion.text)
    // Only call acceptSuggestion if needed to avoid extra renders
    if (!suggestion.accepted) {
      acceptSuggestion(suggestion.id)
    }
  }

  return (
    <Tabs defaultValue="chat" className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="chat">{language === "ru" ? "Чат" : "Chat"}</TabsTrigger>
          <TabsTrigger value="templates">{language === "ru" ? "Шаблоны" : "Templates"}</TabsTrigger>
          <TabsTrigger value="history">{language === "ru" ? "История" : "History"}</TabsTrigger>
          <TabsTrigger value="dependencies">{language === "ru" ? "Зависимости" : "Dependencies"}</TabsTrigger>
        </TabsList>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Globe className="h-4 w-4 mr-2" />
              {language === "ru" ? "Русский" : "English"}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleLanguageChange("ru")}>
              {language === "ru" && <Check className="h-4 w-4 mr-2" />}
              Русский
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
              {language === "en" && <Check className="h-4 w-4 mr-2" />}
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TabsContent value="chat" className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>{language === "ru" ? "AI Ассистент для документации" : "AI Documentation Assistant"}</CardTitle>
            <CardDescription>
              {language === "ru"
                ? "Задайте вопрос или опишите, какую документацию вам нужно создать"
                : "Ask a question or describe what documentation you need to create"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                    {message.sender === "assistant" && (
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col">
                      <div
                        className={`rounded-lg p-4 ${
                          message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p>{message.content}</p>
                        <div
                          className={`text-xs mt-1 ${
                            message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>

                      {/* Отображение структурированных элементов требования */}
                      {message.structuredContent && Object.keys(message.structuredContent).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.structuredContent.actor && (
                            <Badge variant="outline" className="bg-blue-50">
                              {language === "ru" ? "Актор: " : "Actor: "}
                              {message.structuredContent.actor}
                            </Badge>
                          )}
                          {message.structuredContent.action && (
                            <Badge variant="outline" className="bg-green-50">
                              {language === "ru" ? "Действие: " : "Action: "}
                              {message.structuredContent.action}
                            </Badge>
                          )}
                          {message.structuredContent.object && (
                            <Badge variant="outline" className="bg-yellow-50">
                              {language === "ru" ? "Объект: " : "Object: "}
                              {message.structuredContent.object}
                            </Badge>
                          )}
                          {message.structuredContent.result && (
                            <Badge variant="outline" className="bg-purple-50">
                              {language === "ru" ? "Результат: " : "Result: "}
                              {message.structuredContent.result}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Предложения автодополнения от ассистента */}
                      {message.sender === "assistant" && message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 space-y-2">
                          <p className="text-xs text-muted-foreground">
                            {language === "ru" ? "Предложения:" : "Suggestions:"}
                          </p>
                          {message.suggestions.map((suggestion) => (
                            <div
                              key={suggestion.id}
                              className="text-sm p-2 border rounded-md cursor-pointer hover:bg-muted/50"
                              onClick={() => applySuggestion(suggestion)}
                            >
                              {suggestion.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {message.sender === "user" && (
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>ВЫ</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full flex-col space-y-2">
              {/* Предложения автодополнения для пользовательского ввода */}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="text-sm p-2 border rounded-md cursor-pointer hover:bg-muted/50 max-w-full truncate"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      {suggestion.text.length > 50 ? suggestion.text.substring(0, 50) + "..." : suggestion.text}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Textarea
                  placeholder={
                    isListening
                      ? language === "ru"
                        ? "Говорите..."
                        : "Speak..."
                      : language === "ru"
                        ? "Напишите сообщение..."
                        : "Type a message..."
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className={`flex-1 ${isListening ? "border-primary" : ""}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                {isSupported && (
                  <Button
                    size="icon"
                    variant={isListening ? "destructive" : "outline"}
                    onClick={toggleVoiceInput}
                    className="relative"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-4 w-4" />
                        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                      </>
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {isListening
                        ? language === "ru"
                          ? "Остановить запись"
                          : "Stop recording"
                        : language === "ru"
                          ? "Голосовой ввод"
                          : "Voice input"}
                    </span>
                  </Button>
                )}
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">{language === "ru" ? "Отправить" : "Send"}</span>
                </Button>
              </div>

              {/* Отображение структурированных элементов из текущего ввода */}
              {Object.keys(structuredElements).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <p className="text-xs text-muted-foreground w-full">
                    {language === "ru" ? "Распознанные элементы требования:" : "Recognized requirement elements:"}
                  </p>
                  {structuredElements.actor && (
                    <Badge variant="outline" className="bg-blue-50">
                      {language === "ru" ? "Актор: " : "Actor: "}
                      {structuredElements.actor}
                    </Badge>
                  )}
                  {structuredElements.action && (
                    <Badge variant="outline" className="bg-green-50">
                      {language === "ru" ? "Действие: " : "Action: "}
                      {structuredElements.action}
                    </Badge>
                  )}
                  {structuredElements.object && (
                    <Badge variant="outline" className="bg-yellow-50">
                      {language === "ru" ? "Объект: " : "Object: "}
                      {structuredElements.object}
                    </Badge>
                  )}
                  {structuredElements.result && (
                    <Badge variant="outline" className="bg-purple-50">
                      {language === "ru" ? "Результат: " : "Result: "}
                      {structuredElements.result}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="templates" className="h-full">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{language === "ru" ? "Шаблоны документации" : "Documentation Templates"}</CardTitle>
            <CardDescription>
              {language === "ru"
                ? "Готовые шаблоны для различных типов документации"
                : "Ready-made templates for various types of documentation"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="cursor-pointer hover:bg-muted/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">
                    {language === "ru" ? "Техническое задание" : "Technical Specification"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    {language === "ru"
                      ? "Стандартный шаблон для создания технического задания по ГОСТ"
                      : "Standard template for creating technical specifications according to GOST"}
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">
                    {language === "ru" ? "Спецификация требований" : "Requirements Specification"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    {language === "ru"
                      ? "Шаблон для детального описания функциональных и нефункциональных требований"
                      : "Template for detailed description of functional and non-functional requirements"}
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">
                    {language === "ru" ? "Руководство пользователя" : "User Manual"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    {language === "ru"
                      ? "Структурированный шаблон для создания пользовательской документации"
                      : "Structured template for creating user documentation"}
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">
                    {language === "ru" ? "Описание API" : "API Documentation"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    {language === "ru"
                      ? "Шаблон для документирования REST API с примерами запросов и ответов"
                      : "Template for documenting REST API with request and response examples"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="h-full">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{language === "ru" ? "История документации" : "Documentation History"}</CardTitle>
            <CardDescription>
              {language === "ru" ? "Ранее созданные документы и черновики" : "Previously created documents and drafts"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-medium">
                    {language === "ru" ? "Требования к модулю авторизации" : "Authorization Module Requirements"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "ru" ? "Последнее обновление: 2 часа назад" : "Last update: 2 hours ago"}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {language === "ru" ? "Открыть" : "Open"}
                </Button>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-medium">
                    {language === "ru" ? "Спецификация API платежного сервиса" : "Payment Service API Specification"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "ru" ? "Последнее обновление: вчера" : "Last update: yesterday"}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {language === "ru" ? "Открыть" : "Open"}
                </Button>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-medium">
                    {language === "ru" ? "Руководство администратора" : "Administrator Guide"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "ru" ? "Последнее обновление: 3 дня назад" : "Last update: 3 days ago"}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {language === "ru" ? "Открыть" : "Open"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="dependencies" className="h-full">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{language === "ru" ? "Дерево зависимостей" : "Dependency Tree"}</CardTitle>
            <CardDescription>
              {language === "ru"
                ? "Визуализация связей между требованиями, сущностями и документами"
                : "Visualization of relationships between requirements, entities, and documents"}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)] overflow-auto">
            <div className="border rounded-md p-4 h-full flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                {language === "ru"
                  ? "Визуализация дерева зависимостей будет доступна после добавления требований и сущностей."
                  : "Dependency tree visualization will be available after adding requirements and entities."}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
