"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save, MoreVertical, Trash, Edit, Clock, Play } from "lucide-react"
import type { TimerPreset } from "@/types/shell-types"
import type { TimerSettings } from "@/types/timer-types"
import { savePreset, getPresets, deletePreset, createPreset } from "@/lib/storage-utils"
import { formatTime } from "@/lib/format-time"

interface TimerPresetsProps {
  currentSettings: TimerSettings
  currentActions: TimerPreset["actions"]
  onLoadPreset: (preset: TimerPreset) => void
}

export default function TimerPresets({ currentSettings, currentActions, onLoadPreset }: TimerPresetsProps) {
  const [presets, setPresets] = useState<TimerPreset[]>([])
  const [newPresetName, setNewPresetName] = useState("")
  const [newPresetDescription, setNewPresetDescription] = useState("")
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<TimerPreset | null>(null)

  // Load presets on component mount
  useEffect(() => {
    setPresets(getPresets())
  }, [])

  // Save a new preset
  const handleSavePreset = () => {
    if (!newPresetName.trim()) return

    let preset: TimerPreset

    if (editingPreset) {
      // Update existing preset
      preset = {
        ...editingPreset,
        name: newPresetName,
        description: newPresetDescription,
        updatedAt: Date.now(),
        settings: currentSettings,
        actions: currentActions,
      }
    } else {
      // Create new preset
      preset = createPreset(newPresetName, newPresetDescription, currentSettings, currentActions)
    }

    savePreset(preset)
    setPresets(getPresets())
    setNewPresetName("")
    setNewPresetDescription("")
    setEditingPreset(null)
    setSaveDialogOpen(false)
  }

  // Delete a preset
  const handleDeletePreset = (id: string) => {
    deletePreset(id)
    setPresets(getPresets())
  }

  // Edit a preset
  const handleEditPreset = (preset: TimerPreset) => {
    setEditingPreset(preset)
    setNewPresetName(preset.name)
    setNewPresetDescription(preset.description || "")
    setSaveDialogOpen(true)
  }

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Saved Presets</h3>

        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Current Setup
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPreset ? "Update Preset" : "Save as Preset"}</DialogTitle>
              <DialogDescription>Save your current timer settings and actions for later use.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="preset-name">Preset Name</Label>
                <Input
                  id="preset-name"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g., Pomodoro Timer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preset-description">Description (Optional)</Label>
                <Textarea
                  id="preset-description"
                  value={newPresetDescription}
                  onChange={(e) => setNewPresetDescription(e.target.value)}
                  placeholder="Describe what this preset is for"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSavePreset} disabled={!newPresetName.trim()}>
                {editingPreset ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {presets.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>No presets saved yet. Save your current setup to create a preset.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presets.map((preset) => (
                <TableRow key={preset.id}>
                  <TableCell className="font-medium">
                    {preset.name}
                    {preset.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{preset.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatTime(preset.settings.duration, false)}
                    </div>
                  </TableCell>
                  <TableCell>{preset.actions.filter((a) => a.enabled).length} active</TableCell>
                  <TableCell>{formatDate(preset.updatedAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onLoadPreset(preset)}>
                          <Play className="mr-2 h-4 w-4" />
                          Load
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditPreset(preset)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeletePreset(preset.id)} className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

