"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash, Plus, Copy, Eye, Check, AlertCircle } from "lucide-react"
import type { ShellAction } from "@/types/shell-types"
import { templateCategories, getActionTemplates, getTemplateById } from "@/lib/action-templates"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ShellActionSettingsProps {
  actions: ShellAction[]
  onActionsChange: (actions: ShellAction[]) => void
}

export default function ShellActionSettings({ actions, onActionsChange }: ShellActionSettingsProps) {
  const [newActionName, setNewActionName] = useState("")
  const [newActionCommand, setNewActionCommand] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [templates, setTemplates] = useState<Record<string, ShellAction[]>>({})
  const [selectedTemplate, setSelectedTemplate] = useState<ShellAction | null>(null)
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: "success" | "error"
  } | null>(null)

  // Load templates on component mount
  useEffect(() => {
    setTemplates(getActionTemplates())
  }, [])

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copiedCommand) {
      const timer = setTimeout(() => {
        setCopiedCommand(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedCommand])

  // Hide notification after 3 seconds
  useEffect(() => {
    if (notification?.show) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const addAction = () => {
    if (newActionName.trim() && newActionCommand.trim()) {
      const newAction: ShellAction = {
        id: `custom-${Date.now()}`,
        name: newActionName,
        command: newActionCommand,
        enabled: true,
        category: "custom",
        isCustom: true,
      }
      onActionsChange([...actions, newAction])
      setNewActionName("")
      setNewActionCommand("")
    }
  }

  const updateAction = (id: string, updates: Partial<ShellAction>) => {
    onActionsChange(actions.map((action) => (action.id === id ? { ...action, ...updates } : action)))
  }

  const removeAction = (id: string) => {
    onActionsChange(actions.filter((action) => action.id !== id))
  }

  const addTemplateAction = (templateId: string) => {
    const template = getTemplateById(templateId)
    if (template) {
      // Check if this template is already added
      const exists = actions.some((action) => action.id === template.id)
      if (!exists) {
        onActionsChange([...actions, { ...template, enabled: true }])
        showNotification(`Added "${template.name}" to active commands`, "success")
      }
    }
  }

  // Filter templates by category
  const getFilteredTemplates = () => {
    if (activeCategory === "all") {
      return Object.values(templates).flat()
    }
    return templates[activeCategory] || []
  }

  const showTemplateDetails = (template: ShellAction) => {
    setSelectedTemplate(template)
  }

  const copyCommandToClipboard = (command: string) => {
    navigator.clipboard
      .writeText(command)
      .then(() => {
        setCopiedCommand(command)
        showNotification("Command copied to clipboard", "success")
      })
      .catch((err) => {
        console.error("Failed to copy command:", err)
        showNotification("Failed to copy command", "error")
      })
  }

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({
      show: true,
      message,
      type,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Shell Commands</h3>
        <p className="text-sm text-muted-foreground mb-4">These commands will be executed when the timer completes.</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Commands</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 pt-4">
          {actions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No commands added yet. Add from templates or create your own.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {actions.map((action) => (
                <Card key={action.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`action-${action.id}-enabled`}
                          checked={action.enabled}
                          onCheckedChange={(checked) => updateAction(action.id, { enabled: checked })}
                        />
                        <Label htmlFor={`action-${action.id}-enabled`} className="font-medium">
                          {action.name}
                        </Label>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAction(action.id)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {action.description && <p className="text-sm text-muted-foreground mb-2">{action.description}</p>}

                    <div className="relative">
                      <Input
                        value={action.command}
                        onChange={(e) => updateAction(action.id, { command: e.target.value })}
                        placeholder="Shell command"
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => copyCommandToClipboard(action.command)}
                      >
                        {copiedCommand === action.command ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium">Add New Command</h4>

            <div className="space-y-2">
              <Label htmlFor="new-action-name">Name</Label>
              <Input
                id="new-action-name"
                value={newActionName}
                onChange={(e) => setNewActionName(e.target.value)}
                placeholder="Command name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-action-command">Shell Command</Label>
              <Input
                id="new-action-command"
                value={newActionCommand}
                onChange={(e) => setNewActionCommand(e.target.value)}
                placeholder="e.g., echo 'Timer completed!'"
              />
            </div>

            <Button onClick={addAction} className="w-full" disabled={!newActionName.trim() || !newActionCommand.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Command
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 pt-4">
          <div className="flex items-center space-x-2 mb-4">
            <Label htmlFor="template-category">Filter by category:</Label>
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger id="template-category" className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {templateCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {getFilteredTemplates().map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      {template.description && <p className="text-sm text-muted-foreground">{template.description}</p>}
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => showTemplateDetails(template)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>{template.name}</DialogTitle>
                            {template.description && <DialogDescription>{template.description}</DialogDescription>}
                          </DialogHeader>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Command:</h4>
                            <div className="relative">
                              <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all">
                                {template.command}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => copyCommandToClipboard(template.command)}
                              >
                                {copiedCommand === template.command ? (
                                  <Check className="h-3 w-3 mr-1" />
                                ) : (
                                  <Copy className="h-3 w-3 mr-1" />
                                )}
                                {copiedCommand === template.command ? "Copied" : "Copy"}
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Category:</h4>
                            <div className="text-sm">
                              {templateCategories.find((c) => c.id === template.category)?.name || template.category}
                            </div>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button
                              onClick={() => {
                                addTemplateAction(template.id)
                                document
                                  .querySelector<HTMLButtonElement>('[data-state="open"][aria-label="Close"]')
                                  ?.click()
                              }}
                              disabled={actions.some((action) => action.id === template.id)}
                            >
                              {actions.some((action) => action.id === template.id)
                                ? "Already Added"
                                : "Add to Active Commands"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => addTemplateAction(template.id)}
                        className="text-primary hover:text-primary/90 hover:bg-primary/10"
                        disabled={actions.some((action) => action.id === template.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {notification?.show && (
        <div
          className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-md shadow-md z-50 ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
          }`}
        >
          {notification.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  )
}

