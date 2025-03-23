"use client"

import { useState, useEffect } from "react"
import { Minus, Square, X, Maximize2 } from "lucide-react"

// Safely import Tauri API
let appWindow: any = null
let tauriWindow: any = null

// Only import Tauri in the browser
if (typeof window !== "undefined") {
  // Use dynamic import to prevent SSR issues
  Promise.all([
    import("@tauri-apps/api/window").then(({ appWindow: aw }) => {
      appWindow = aw
    }),
    import("@tauri-apps/api").then(({ appWindow }) => {
      tauriWindow = appWindow
    }),
  ]).catch((err) => {
    console.error("Failed to load Tauri window API:", err)
  })
}

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // Only run in browser and when appWindow is available
    if (typeof window === "undefined" || !appWindow) return

    // Check initial window state
    const checkMaximized = async () => {
      try {
        const maximized = await appWindow.isMaximized()
        setIsMaximized(maximized)
      } catch (error) {
        console.error("Failed to check window state:", error)
      }
    }

    checkMaximized()

    // Listen for window changes
    let unlisten: (() => void) | undefined

    const setupListener = async () => {
      try {
        unlisten = await appWindow.onResized(() => {
          checkMaximized()
        })
      } catch (error) {
        console.error("Failed to set up resize listener:", error)
      }
    }

    setupListener()

    return () => {
      if (unlisten) unlisten()
    }
  }, [])

  const handleMinimize = async () => {
    if (!appWindow) return

    try {
      await appWindow.minimize()
    } catch (error) {
      console.error("Failed to minimize window:", error)

      // Fallback for when the app is maximized
      if (tauriWindow && tauriWindow.getCurrent) {
        try {
          const currentWindow = tauriWindow.getCurrent()
          await currentWindow.minimize()
        } catch (fallbackError) {
          console.error("Fallback minimize also failed:", fallbackError)
        }
      }
    }
  }

  const handleMaximize = async () => {
    if (!appWindow) return

    try {
      if (isMaximized) {
        await appWindow.unmaximize()
      } else {
        await appWindow.maximize()
      }
    } catch (error) {
      console.error("Failed to toggle maximize window:", error)
    }
  }

  const handleClose = async () => {
    if (!appWindow) return

    try {
      await appWindow.close()
    } catch (error) {
      console.error("Failed to close window:", error)
    }
  }

  return (
    <div className="title-bar">
      <div className="title-bar-drag-area" data-tauri-drag-region>
        <div className="title-bar-title">Awesome Timer</div>
      </div>
      <div className="title-bar-controls">
        <button className="title-bar-button title-bar-button-minimize" onClick={handleMinimize} aria-label="Minimize">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button className="title-bar-button title-bar-button-maximize" onClick={handleMaximize} aria-label="Maximize">
          {isMaximized ? <Square className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
        <button className="title-bar-button title-bar-button-close" onClick={handleClose} aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

