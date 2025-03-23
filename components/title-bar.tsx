"use client"

import { useState, useEffect } from "react"
import { Minus, Square, X, Maximize2 } from "lucide-react"

// Helper function to check if Tauri is available
const isTauriAvailable = (): boolean => {
  return typeof window !== "undefined" && window.__TAURI__ !== undefined
}

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // Check if Tauri is available
    if (isTauriAvailable()) {
      const { appWindow } = window.__TAURI__!.window

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
      const setupListener = async () => {
        try {
          const unlisten = await appWindow.onResized(() => {
            checkMaximized()
          })

          return () => {
            unlisten()
          }
        } catch (error) {
          console.error("Failed to set up resize listener:", error)
          return () => {}
        }
      }

      const cleanupFn = setupListener()

      return () => {
        cleanupFn.then((fn) => fn())
      }
    }
  }, [])

  const handleMinimize = () => {
    if (isTauriAvailable()) {
      window.__TAURI__!.window.appWindow.minimize().catch((err) => console.error("Failed to minimize window:", err))
    }
  }

  const handleMaximize = () => {
    if (isTauriAvailable()) {
      if (isMaximized) {
        window
          .__TAURI__!.window.appWindow.unmaximize()
          .catch((err) => console.error("Failed to unmaximize window:", err))
      } else {
        window.__TAURI__!.window.appWindow.maximize().catch((err) => console.error("Failed to maximize window:", err))
      }
    }
  }

  const handleClose = () => {
    if (isTauriAvailable()) {
      window.__TAURI__!.window.appWindow.close().catch((err) => console.error("Failed to close window:", err))
    }
  }

  return (
    <div className="title-bar">
      <div className="title-bar-drag-area" data-tauri-drag-region>
        <div className="title-bar-title">Customizable Timer</div>
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

