// Типы для дерева зависимостей и структуры требований

// Типы требований
export type RequirementType = "functional" | "non-functional"

// Базовые элементы требования
export interface RequirementElement {
  actor?: string // Кто выполняет действие
  action?: string // Какое действие выполняется
  object?: string // Над чем выполняется действие
  result?: string // Результат действия
}

// Структура требования
export interface Requirement {
  id: string
  type: RequirementType
  title: string
  description: string
  elements: RequirementElement
  priority: "high" | "medium" | "low"
  status: "draft" | "review" | "approved" | "rejected"
  createdAt: Date
  updatedAt: Date
  relatedEntities: string[] // ID связанных сущностей
  relatedDocuments: string[] // ID связанных документов
}

// Сущности проекта
export interface Entity {
  id: string
  type: "object" | "role" | "process" | "component"
  name: string
  description: string
  attributes: Record<string, any>
  relatedRequirements: string[] // ID связанных требований
  relatedEntities: string[] // ID связанных сущностей
}

// Документы проекта
export interface Document {
  id: string
  type: "specification" | "user-guide" | "api-doc" | "use-case" | "other"
  title: string
  content: string
  sections: DocumentSection[]
  relatedRequirements: string[] // ID связанных требований
  relatedEntities: string[] // ID связанных сущностей
}

// Секции документа
export interface DocumentSection {
  id: string
  title: string
  content: string
  level: number // Уровень вложенности
  parentId?: string // ID родительской секции
}

// Предложения автодополнения
export interface Suggestion {
  id: string
  text: string
  context: string
  accepted: boolean
  timestamp: Date
}

// Настройки пользователя
export interface UserSettings {
  language: "ru" | "en"
  theme: "light" | "dark"
  voiceRecognitionEnabled: boolean
  autoCompleteEnabled: boolean
}

// Тип сообщения с поддержкой структурированных требований
export interface EnhancedMessage {
  id: number
  content: string
  structuredContent?: RequirementElement
  sender: "user" | "assistant"
  timestamp: Date
  language: "ru" | "en"
  suggestions?: Suggestion[]
}
