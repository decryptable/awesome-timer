import type { ShellAction } from "@/types/shell-types"

// Helper to determine the current OS
export const getOS = (): "windows" | "macos" | "linux" | "unknown" => {
  if (typeof window !== "undefined") {
    const userAgent = window.navigator.userAgent.toLowerCase()
    if (userAgent.indexOf("win") !== -1) return "windows"
    if (userAgent.indexOf("mac") !== -1) return "macos"
    if (userAgent.indexOf("linux") !== -1) return "linux"
  }
  return "unknown"
}

// Template categories
export const templateCategories = [
  { id: "system", name: "System Actions" },
  { id: "apps", name: "Application Control" },
  { id: "web", name: "Web & Network" },
  { id: "media", name: "Media & Notifications" },
  { id: "custom", name: "Custom Commands" },
]

// Action templates based on OS
export const getActionTemplates = (): Record<string, ShellAction[]> => {
  const os = getOS()

  const templates: Record<string, ShellAction[]> = {
    system: [
      {
        id: "sleep",
        name: "Sleep Computer",
        command:
          os === "windows"
            ? "rundll32.exe powrprof.dll,SetSuspendState 0,1,0"
            : os === "macos"
              ? "pmset sleepnow"
              : "systemctl suspend",
        enabled: true,
        category: "system",
        description: "Put the computer to sleep",
      },
      {
        id: "shutdown",
        name: "Shutdown Computer",
        command:
          os === "windows" ? "shutdown /s /t 60" : os === "macos" ? "sudo shutdown -h +1" : "sudo shutdown -h +1",
        enabled: false,
        category: "system",
        description: "Shutdown the computer in 1 minute",
      },
      {
        id: "lock",
        name: "Lock Screen",
        command:
          os === "windows"
            ? "rundll32.exe user32.dll,LockWorkStation"
            : os === "macos"
              ? "/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend"
              : "loginctl lock-session",
        enabled: true,
        category: "system",
        description: "Lock the screen",
      },
    ],
    apps: [
      {
        id: "kill-browser",
        name: "Close All Browsers",
        command:
          os === "windows"
            ? "taskkill /F /IM chrome.exe /IM firefox.exe /IM msedge.exe"
            : os === "macos"
              ? 'killall "Google Chrome" "Firefox" "Safari"'
              : "killall chrome firefox",
        enabled: false,
        category: "apps",
        description: "Force close all browser applications",
      },
      {
        id: "start-browser",
        name: "Start Default Browser",
        command:
          os === "windows"
            ? 'start "" "https://www.google.com"'
            : os === "macos"
              ? "open https://www.google.com"
              : "xdg-open https://www.google.com",
        enabled: true,
        category: "apps",
        description: "Open the default browser to Google",
      },
      {
        id: "start-music",
        name: "Start Music Player",
        command:
          os === "windows"
            ? 'start "" "spotify:user:spotify:playlist:37i9dQZF1DXcBWIGoYBM5M"'
            : os === "macos"
              ? "open -a Spotify"
              : "spotify",
        enabled: false,
        category: "apps",
        description: "Open Spotify or default music player",
      },
    ],
    web: [
      {
        id: "open-youtube",
        name: "Open YouTube",
        command:
          os === "windows"
            ? 'start "" "https://www.youtube.com"'
            : os === "macos"
              ? "open https://www.youtube.com"
              : "xdg-open https://www.youtube.com",
        enabled: true,
        category: "web",
        description: "Open YouTube in the default browser",
      },
      {
        id: "open-gmail",
        name: "Open Gmail",
        command:
          os === "windows"
            ? 'start "" "https://mail.google.com"'
            : os === "macos"
              ? "open https://mail.google.com"
              : "xdg-open https://mail.google.com",
        enabled: false,
        category: "web",
        description: "Open Gmail in the default browser",
      },
    ],
    media: [
      {
        id: "play-sound",
        name: "Play Completion Sound",
        command:
          os === "windows"
            ? 'powershell -c (New-Object Media.SoundPlayer "C:\\Windows\\Media\\chimes.wav").PlaySync()'
            : os === "macos"
              ? "afplay /System/Library/Sounds/Glass.aiff"
              : "paplay /usr/share/sounds/freedesktop/stereo/complete.oga",
        enabled: true,
        category: "media",
        description: "Play a sound when timer completes",
      },
      {
        id: "notification",
        name: "Show Notification",
        command:
          os === "windows"
            ? "powershell -command \"& {[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Timer completed!', 'Timer')}\""
            : os === "macos"
              ? 'osascript -e \'display notification "Timer completed!" with title "Timer"\''
              : 'notify-send "Timer" "Timer completed!"',
        enabled: true,
        category: "media",
        description: "Show a system notification",
      },
    ],
    custom: [],
  }

  return templates
}

// Function to get all templates as a flat array
export const getAllTemplates = (): ShellAction[] => {
  const templates = getActionTemplates()
  return Object.values(templates).flat()
}

// Function to get a template by ID
export const getTemplateById = (id: string): ShellAction | undefined => {
  return getAllTemplates().find((template) => template.id === id)
}

