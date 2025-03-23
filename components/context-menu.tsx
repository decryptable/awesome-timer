"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Scissors, Copy, Clipboard, Info, X, Check, AlertCircle, Clock, Github } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface ContextMenuProps {
  children: React.ReactNode
}

interface MenuPosition {
  x: number
  y: number
}

export default function ContextMenuProvider({ children }: ContextMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 })
  const [showAboutDialog, setShowAboutDialog] = useState(false)
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: "success" | "error"
  }>({
    show: false,
    message: "",
    type: "success",
  })

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Allow default context menu in input, textarea, and contenteditable elements
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.getAttribute("contenteditable") === "true" ||
        target.closest('input, textarea, [contenteditable="true"]')

      if (isInput) return

      e.preventDefault()
      setPosition({ x: e.clientX, y: e.clientY })
      setShowMenu(true)
    }

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("click", handleClick)
    }
  }, [])

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false })
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleCut = async () => {
    try {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        showNotification("No text selected", "error")
        return
      }

      const text = selection.toString()
      await navigator.clipboard.writeText(text)

      // Execute cut command only if we're in an editable field
      const activeElement = document.activeElement
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement && activeElement.getAttribute("contenteditable") === "true")
      ) {
        document.execCommand("cut")
      } else {
        // If not in editable field, just clear the selection after copying
        selection.removeAllRanges()
      }

      showNotification("Cut to clipboard", "success")
    } catch (error) {
      console.error("Cut failed:", error)
      showNotification("Cut failed", "error")
    }
    setShowMenu(false)
  }

  const handleCopy = async () => {
    try {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        showNotification("No text selected", "error")
        return
      }

      const text = selection.toString()
      await navigator.clipboard.writeText(text)
      showNotification("Copied to clipboard", "success")
    } catch (error) {
      console.error("Copy failed:", error)
      showNotification("Copy failed", "error")
    }
    setShowMenu(false)
  }

  const handlePaste = async () => {
    try {
      const activeElement = document.activeElement
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement && activeElement.getAttribute("contenteditable") === "true")
      ) {
        // For editable elements, use the clipboard API and then insert at cursor
        const text = await navigator.clipboard.readText()
        document.execCommand("insertText", false, text)
        showNotification("Pasted from clipboard", "success")
      } else {
        showNotification("Cannot paste here - no input field selected", "error")
      }
    } catch (error) {
      console.error("Paste failed:", error)
      showNotification("Paste failed", "error")
    }
    setShowMenu(false)
  }

  const handleAbout = () => {
    setShowMenu(false)
    setShowAboutDialog(true)
  }

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({
      show: true,
      message,
      type,
    })
  }

  // Prevent text selection
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      /* Allow selection in inputs and textareas */
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <>
      {children}

      {showMenu && (
        <div
          ref={menuRef}
          className="fixed bg-popover text-popover-foreground shadow-md rounded-md py-1 z-50 min-w-[160px]"
          style={{
            left: `${Math.min(position.x, window.innerWidth - 170)}px`,
            top: `${Math.min(position.y, window.innerHeight - 200)}px`,
          }}
        >
          <button className="w-full px-3 py-2 text-left flex items-center hover:bg-muted" onClick={handleCut}>
            <Scissors className="mr-2 h-4 w-4" />
            <span>Cut</span>
          </button>
          <button className="w-full px-3 py-2 text-left flex items-center hover:bg-muted" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy</span>
          </button>
          <button className="w-full px-3 py-2 text-left flex items-center hover:bg-muted" onClick={handlePaste}>
            <Clipboard className="mr-2 h-4 w-4" />
            <span>Paste</span>
          </button>
          <div className="border-t my-1"></div>
          <button className="w-full px-3 py-2 text-left flex items-center hover:bg-muted" onClick={handleAbout}>
            <Info className="mr-2 h-4 w-4" />
            <span>About</span>
          </button>
        </div>
      )}

      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About Awesome Timer</DialogTitle>
            <DialogDescription>
              A customizable timer application with shell command execution capabilities
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Clock className="h-16 w-16 text-primary" />
              <h2 className="text-xl font-bold">Awesome Timer</h2>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>

            <p className="text-center">This application is open source and available on GitHub.</p>

            <div className="flex justify-center">
              <Button
                variant="outline"
                className="space-x-2"
                onClick={() => window.open("https://github.com/decryptable/awesome-timer", "_blank")}
              >
                <Github className="h-4 w-4" />
                <span>GitHub Repository</span>
              </Button>
            </div>

            <Separator />

            <div className="text-center space-y-2">
              <p className="font-medium">Created by</p>
              <p>decryptable</p>
              <p className="text-sm text-muted-foreground">Developer from Indonesia</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {notification.show && (
        <div
          className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-md shadow-md z-50 ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
          }`}
        >
          {notification.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{notification.message}</span>
          <button
            className="ml-2 text-current opacity-70 hover:opacity-100"
            onClick={() => setNotification({ ...notification, show: false })}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </>
  )
}

