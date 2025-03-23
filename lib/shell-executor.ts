"use client"

import type { ShellAction } from "@/types/shell-types"

// Check if we're running in a Tauri environment
const isTauriAvailable = (): boolean => {
  return typeof window !== "undefined" && window.__TAURI__ !== undefined
}

// This is the client-side interface that will communicate with Tauri
export function executeShellCommands(actions: ShellAction[]): void {
  if (isTauriAvailable()) {
    const { invoke } = window.__TAURI__!.tauri

    actions.forEach((action) => {
      if (action.enabled) {
        console.log(`Executing command: ${action.name}`)
        invoke("execute_shell_command", { command: action.command })
          .then((result: any) => {
            console.log(`Command "${action.name}" executed:`, result)
            if (!result.success) {
              console.error(`Error executing "${action.name}":`, result.stderr || result.error)
            }
          })
          .catch((error: any) => {
            console.error(`Failed to execute command "${action.name}":`, error)
          })
      }
    })
  } else {
    console.log("Tauri not available, commands would execute:", actions)
  }
}

// Function to detect running processes
export async function detectRunningProcesses(processNames: string[]): Promise<string[]> {
  if (isTauriAvailable()) {
    try {
      const { invoke } = window.__TAURI__!.tauri
      const result = await invoke<{
        success: boolean
        processes: string[]
        error?: string
      }>("detect_processes", { processNames })

      if (result.success) {
        return result.processes
      }
      console.error("Error detecting processes:", result.error)
      return []
    } catch (error) {
      console.error("Failed to detect processes:", error)
      return []
    }
  }
  console.log("Tauri not available, would detect processes:", processNames)
  return []
}

// Function to kill specific processes
export async function killProcesses(processNames: string[]): Promise<boolean> {
  if (isTauriAvailable()) {
    try {
      const { invoke } = window.__TAURI__!.tauri
      const result = await invoke<{
        success: boolean
        error?: string
      }>("kill_processes", { processNames })
      return result.success
    } catch (error) {
      console.error("Failed to kill processes:", error)
      return false
    }
  }
  console.log("Tauri not available, would kill processes:", processNames)
  return false
}

// Function to open applications
export async function openApplication(appName: string): Promise<boolean> {
  if (isTauriAvailable()) {
    try {
      const { invoke } = window.__TAURI__!.tauri
      const result = await invoke<{
        success: boolean
        error?: string
      }>("open_application", { appName })
      return result.success
    } catch (error) {
      console.error("Failed to open application:", error)
      return false
    }
  }
  console.log("Tauri not available, would open application:", appName)
  return false
}

