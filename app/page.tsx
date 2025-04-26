"use client"

import { useState, useContext } from "react"
import { BarChart3, FileText, MessageSquare, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarContext,
} from "@/components/ui/sidebar"

import { AnalyticsCharts } from "./components/analytics-charts"
import { DocumentationAssistant } from "./components/documentation-assistant"

export default function AnalyticsDashboard() {
  // Ensure activeTab has a valid default value
  const [activeTab, setActiveTab] = useState<string>("assistant")

  return (
    <SidebarProvider>
      <DashboardContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </SidebarProvider>
  )
}

function DashboardContent({
  activeTab,
  setActiveTab,
}: {
  activeTab: string
  setActiveTab: (tab: string) => void
}) {
  const { setOpen } = useContext(SidebarContext)

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Закрываем сайдбар на мобильных устройствах
    setOpen(false)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar>
        <SidebarHeader className="flex h-14 items-center border-b px-6">
          <div className="flex items-center gap-2 font-semibold">
            <FileText className="h-5 w-5" />
            <span>AnalystAI</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeTab === "assistant"} onClick={() => handleTabChange("assistant")}>
                <MessageSquare className="h-5 w-5" />
                <span>AI Ассистент</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeTab === "analytics"} onClick={() => handleTabChange("analytics")}>
                <BarChart3 className="h-5 w-5" />
                <span>Аналитика</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <Button className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            Новый проект
          </Button>
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div className="font-medium">
            {activeTab === "assistant" ? "AI Ассистент для документации" : "Аналитика проекта"}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {activeTab === "assistant" ? <DocumentationAssistant /> : <AnalyticsCharts />}
        </main>
      </div>
    </div>
  )
}
