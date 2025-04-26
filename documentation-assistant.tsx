"use client"

import { useState } from "react"
import { Send } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

type Message = {
  id: number
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

export function DocumentationAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Здравствуйте! Я ваш AI-ассистент для системных аналитиков. Я могу помочь вам с написанием документации, созданием требований и спецификаций. Чем я могу вам помочь сегодня?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInputValue("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Я могу помочь вам составить функциональные требования для этого модуля. Давайте начнем с определения основных пользовательских сценариев.",
        "Для этого типа документации рекомендую использовать формат IEEE 830. Я могу предоставить шаблон и помочь заполнить разделы.",
        "Исходя из вашего описания, вам нужна диаграмма последовательности. Я могу предложить структуру и ключевые элементы для включения.",
        "Для этого бизнес-процесса важно детально описать все входные и выходные данные. Давайте составим таблицу с атрибутами и их описанием.",
      ]

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

      const assistantMessage: Message = {
        id: messages.length + 2,
        content: randomResponse,
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    }, 1000)
  }

  return (
    <Tabs defaultValue="chat" className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="chat">Чат</TabsTrigger>
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="chat" className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>AI Ассистент для документации</CardTitle>
            <CardDescription>Задайте вопрос или опишите, какую документацию вам нужно создать</CardDescription>
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
                    {message.sender === "user" && (
                      <Avatar>
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>ВЫ</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center space-x-2">
              <Textarea
                placeholder="Напишите сообщение..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Отправить</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="templates" className="h-full">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Шаблоны документации</CardTitle>
            <CardDescription>Готовые шаблоны для различных типов документации</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="cursor-pointer hover:bg-muted/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Техническое задание</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Стандартный шаблон для создания технического задания по ГОСТ
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Спецификация требований</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Шаблон для детального описания функциональных и нефункциональных требований
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Руководство пользователя</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Структурированный шаблон для создания пользовательской документации
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Описание API</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Шаблон для документирования REST API с примерами запросов и ответов
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
            <CardTitle>История документации</CardTitle>
            <CardDescription>Ранее созданные документы и черновики</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-medium">Требования к модулю авторизации</h3>
                  <p className="text-sm text-muted-foreground">Последнее обновление: 2 часа назад</p>
                </div>
                <Button variant="outline" size="sm">
                  Открыть
                </Button>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-medium">Спецификация API платежного сервиса</h3>
                  <p className="text-sm text-muted-foreground">Последнее обновление: вчера</p>
                </div>
                <Button variant="outline" size="sm">
                  Открыть
                </Button>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-medium">Руководство администратора</h3>
                  <p className="text-sm text-muted-foreground">Последнее обновление: 3 дня назад</p>
                </div>
                <Button variant="outline" size="sm">
                  Открыть
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
