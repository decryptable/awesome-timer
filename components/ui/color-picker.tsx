"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, Pipette } from "lucide-react"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const presetColors = [
  "#000000",
  "#ffffff",
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
  "#795548",
  "#607d8b",
]

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [color, setColor] = useState(value || "#000000")
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setColor(value)
  }, [value])

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange(newColor)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    handleColorChange(newColor)
  }

  const handlePresetClick = (presetColor: string) => {
    handleColorChange(presetColor)
    setIsOpen(false)
  }

  const handleEyeDropper = async () => {
    // Check if EyeDropper API is available
    if ("EyeDropper" in window) {
      try {
        // @ts-ignore - EyeDropper is not in TypeScript's lib.dom yet
        const eyeDropper = new window.EyeDropper()
        const result = await eyeDropper.open()
        handleColorChange(result.sRGBHex)
      } catch (e) {
        console.error("Error using eyedropper:", e)
      }
    } else {
      alert("EyeDropper API is not supported in your browser")
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-2"
            style={{ backgroundColor: color }}
            aria-label="Pick a color"
          >
            <span className="sr-only">Pick a color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="w-8 h-8 rounded-md border border-input" style={{ backgroundColor: color }} />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleEyeDropper}
                title="Pick color from screen"
              >
                <Pipette className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((presetColor) => (
                <Button
                  key={presetColor}
                  variant="outline"
                  className="w-full h-6 p-0 rounded-md"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handlePresetClick(presetColor)}
                >
                  {color.toLowerCase() === presetColor.toLowerCase() && (
                    <Check className="h-3 w-3 text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
                  )}
                  <span className="sr-only">Select color {presetColor}</span>
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                value={color}
                onChange={handleInputChange}
                className="flex-1"
                placeholder="#RRGGBB"
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              />
              <Input type="color" value={color} onChange={handleInputChange} className="w-10 h-10 p-1 cursor-pointer" />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Input type="text" value={color} onChange={handleInputChange} className="flex-1" placeholder="#RRGGBB" />
    </div>
  )
}

