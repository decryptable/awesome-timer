"use client"

import type { ShellAction } from "@/types/shell-types"

// Safely import Tauri API
let tauriInvoke: ((cmd: string, args?: any) => Promise<any>) | null = null
let notificationApi: any = null

// Only import Tauri in the browser
if (typeof window !== "undefined") {
  // Use dynamic imports to prevent SSR issues
  Promise.all([
    import("@tauri-apps/api/tauri").then(({ invoke }) => {
      tauriInvoke = invoke
    }),
    import("@tauri-apps/api/notification").then((api) => {
      notificationApi = api
    }),
  ]).catch((err) => {
    console.error("Failed to load Tauri APIs:", err)
  })
}

// Check if Tauri invoke is available
const isTauriAvailable = (): boolean => {
  return tauriInvoke !== null
}

// This is the client-side interface that will communicate with Tauri
export async function executeShellCommands(actions: ShellAction[]): Promise<void> {
  if (!isTauriAvailable()) {
    console.log("Tauri not available, commands would execute:", actions)
    return
  }

  // Process each action sequentially
  for (const action of actions) {
    if (!action.enabled) continue

    try {
      console.log(`Executing command: ${action.name}`)

      const result = await tauriInvoke!("execute_shell_command", { command: action.command })

      console.log(`Command "${action.name}" executed:`, result)

      if (!result.success) {
        console.error(`Error executing "${action.name}":`, result.stderr || result.error)

        // Show notification for failed command if notification API is available
        if (notificationApi) {
          try {
            let permissionGranted = await notificationApi.isPermissionGranted()
            if (!permissionGranted) {
              const permission = await notificationApi.requestPermission()
              permissionGranted = permission === "granted"
            }

            if (permissionGranted) {
              await notificationApi.sendNotification({
                title: `Command Failed: ${action.name}`,
                body: result.stderr || result.error || "Unknown error",
              })
            }
          } catch (notificationError) {
            console.error("Failed to send notification:", notificationError)
          }
        }
      }
    } catch (error) {
      console.error(`Failed to execute command "${action.name}":`, error)
    }
  }
}

// Function to detect running processes
export async function detectRunningProcesses(processNames: string[]): Promise<string[]> {
  if (!isTauriAvailable()) {
    console.log("Tauri not available, would detect processes:", processNames)
    return []
  }

  try {
    const result = await tauriInvoke!("detect_processes", { processNames })

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

// Function to kill specific processes
export async function killProcesses(processNames: string[]): Promise<boolean> {
  if (!isTauriAvailable()) {
    console.log("Tauri not available, would kill processes:", processNames)
    return false
  }

  try {
    const result = await tauriInvoke!("kill_processes", { processNames })

    return result.success
  } catch (error) {
    console.error("Failed to kill processes:", error)
    return false
  }
}

// Function to open applications
export async function openApplication(appName: string): Promise<boolean> {
  if (!isTauriAvailable()) {
    console.log("Tauri not available, would open application:", appName)
    return false
  }

  try {
    const result = await tauriInvoke!("open_application", { appName })

    return result.success
  } catch (error) {
    console.error("Failed to open application:", error)
    return false
  }
}

