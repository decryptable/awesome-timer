"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

interface TimerInputProps {
  duration: number
  onChange: (newDuration: number) => void
}

export default function TimerInput({ duration, onChange }: TimerInputProps) {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  // Update local state when duration prop changes
  useEffect(() => {
    const h = Math.floor(duration / 3600)
    const m = Math.floor((duration % 3600) / 60)
    const s = Math.floor(duration % 60)

    setHours(h)
    setMinutes(m)
    setSeconds(s)
  }, [duration])

  // Update parent component when any time unit changes
  const updateDuration = (h: number, m: number, s: number) => {
    const newDuration = h * 3600 + m * 60 + s
    onChange(newDuration)
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = Math.max(0, Math.min(99, Number.parseInt(e.target.value) || 0))
    setHours(h)
    updateDuration(h, minutes, seconds)
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const m = Math.max(0, Math.min(59, Number.parseInt(e.target.value) || 0))
    setMinutes(m)
    updateDuration(hours, m, seconds)
  }

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const s = Math.max(0, Math.min(59, Number.parseInt(e.target.value) || 0))
    setSeconds(s)
    updateDuration(hours, minutes, s)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <Label className="text-base font-medium">Timer Duration</Label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label htmlFor="hours" className="text-xs text-center block">
            Hours
          </Label>
          <Input
            id="hours"
            type="number"
            min="0"
            max="99"
            value={hours}
            onChange={handleHoursChange}
            className="text-center"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="minutes" className="text-xs text-center block">
            Minutes
          </Label>
          <Input
            id="minutes"
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={handleMinutesChange}
            className="text-center"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="seconds" className="text-xs text-center block">
            Seconds
          </Label>
          <Input
            id="seconds"
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={handleSecondsChange}
            className="text-center"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4">
        {[5, 10, 15, 25].map((min) => (
          <Button
            key={min}
            variant="outline"
            size="sm"
            onClick={() => {
              setMinutes(min)
              setSeconds(0)
              updateDuration(hours, min, 0)
            }}
          >
            {min}m
          </Button>
        ))}
      </div>
    </div>
  )
}

