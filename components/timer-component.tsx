"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Check } from "lucide-react"
import { formatTime } from "@/lib/format-time"
import { executeShellCommands } from "@/lib/shell-executor-with-api"
import type { TimerSettings } from "@/types/timer-types"
import type { ShellAction } from "@/types/shell-types"

interface TimerComponentProps {
  settings: TimerSettings
  shellActions: ShellAction[]
}

export default function TimerComponent({ settings, shellActions }: TimerComponentProps) {
  const [timeLeft, setTimeLeft] = useState(settings.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Reset timer when duration changes
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(settings.duration)
      setIsCompleted(false)
    }
  }, [settings.duration, isRunning])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            clearInterval(intervalRef.current as NodeJS.Timeout)
            setIsRunning(false)
            setIsCompleted(true)

            // Play sound if enabled
            if (settings.playSound && audioRef.current) {
              audioRef.current.play().catch((err) => console.error("Error playing sound:", err))
            }

            // Execute shell commands
            const enabledActions = shellActions.filter((action) => action.enabled)
            if (enabledActions.length > 0) {
              executeShellCommands(enabledActions)
            }

            return 0
          }
          return prev - 0.1
        })
      }, 100)
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, shellActions, settings.playSound])

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(settings.duration)
    }
    setIsRunning(true)
    setIsCompleted(false)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(settings.duration)
    setIsCompleted(false)
  }

  const { theme } = settings

  return (
    <Card
      className="w-full"
      style={{
        backgroundColor: theme.backgroundColor,
        borderRadius:
          theme.borderRadius === "rounded-none" ? "0" : theme.borderRadius === "rounded-full" ? "9999px" : undefined,
        boxShadow: theme.shadow === "shadow-none" ? "none" : undefined,
      }}
    >
      <CardContent className="flex flex-col items-center justify-center p-8 space-y-8">
        {settings.playSound && <audio ref={audioRef} src={settings.soundUrl} />}

        <div
          className={`${theme.fontSize} ${theme.fontWeight} tabular-nums`}
          style={{ color: theme.textColor }}
          aria-live="polite"
        >
          {formatTime(timeLeft, settings.showMilliseconds)}
        </div>

        <div className="flex space-x-4">
          {!isRunning ? (
            <Button
              onClick={startTimer}
              size="lg"
              style={{ backgroundColor: theme.accentColor }}
              className="text-white hover:brightness-110"
            >
              {isCompleted ? <Check className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isCompleted ? "Done" : "Start"}
            </Button>
          ) : (
            <Button
              onClick={pauseTimer}
              size="lg"
              style={{ backgroundColor: theme.accentColor }}
              className="text-white hover:brightness-110"
            >
              <Pause className="mr-2 h-5 w-5" />
              Pause
            </Button>
          )}

          <Button
            onClick={resetTimer}
            size="lg"
            variant="outline"
            style={{ borderColor: theme.accentColor, color: theme.textColor }}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

