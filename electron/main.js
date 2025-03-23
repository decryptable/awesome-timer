const { app, BrowserWindow, ipcMain, screen } = require("electron")
const path = require("path")
const shell = require("shelljs")
const os = require("os")
const isDev = process.env.NODE_ENV === "development"

let mainWindow

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width: Math.min(1200, width * 0.8),
    height: Math.min(800, height * 0.8),
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, "../build-resources/icon.png"),
    center: true,
    frame: false, // Frameless window for custom title bar
    transparent: true, // Required for rounded corners on Windows
    backgroundColor: "#00000000", // Transparent background
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  })

  // Load the app
  const startUrl = isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../out/index.html")}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// Get current OS
function getOS() {
  const platform = process.platform
  if (platform === "win32") return "windows"
  if (platform === "darwin") return "macos"
  if (platform === "linux") return "linux"
  return "unknown"
}

// Handle shell.js commands
ipcMain.handle("execute-shell-command", async (event, command) => {
  try {
    // Configure shell.js
    shell.config.silent = true

    // Execute the command
    const result = shell.exec(command)

    return {
      success: result.code === 0,
      stdout: result.stdout,
      stderr: result.stderr,
      code: result.code,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
})

// Detect running processes
ipcMain.handle("detect-processes", async (event, processNames) => {
  try {
    const currentOS = getOS()
    let command = ""

    if (currentOS === "windows") {
      // Windows: use tasklist to find processes
      const processFilters = processNames.map((proc) => `IMAGENAME eq ${proc}`).join(" || ")
      command = `tasklist /FI "${processFilters}" /NH`
    } else if (currentOS === "macos") {
      // macOS: use ps command
      const processPattern = processNames.join("|")
      command = `ps aux | grep -E "${processPattern}" | grep -v grep`
    } else if (currentOS === "linux") {
      // Linux: similar to macOS
      const processPattern = processNames.join("|")
      command = `ps aux | grep -E "${processPattern}" | grep -v grep`
    }

    const result = shell.exec(command, { silent: true })

    // Parse the output to determine which processes are running
    const runningProcesses = processNames.filter((proc) => {
      if (currentOS === "windows") {
        return result.stdout.toLowerCase().includes(proc.toLowerCase())
      } else {
        // For macOS and Linux, check if process name appears in output
        const regex = new RegExp(`\\b${proc}\\b`, "i")
        return regex.test(result.stdout)
      }
    })

    return {
      success: true,
      processes: runningProcesses,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      processes: [],
    }
  }
})

// Kill processes
ipcMain.handle("kill-processes", async (event, processNames) => {
  try {
    const currentOS = getOS()
    let command = ""
    let result

    if (currentOS === "windows") {
      // Windows: use taskkill
      const processArgs = processNames.map((proc) => `/IM ${proc}`).join(" ")
      command = `taskkill /F ${processArgs}`
      result = shell.exec(command, { silent: true })
    } else if (currentOS === "macos") {
      // macOS: use killall
      // Execute each process separately to handle errors better
      let success = true
      let stdoutAll = ""
      let stderrAll = ""

      for (const proc of processNames) {
        const procResult = shell.exec(`killall "${proc}"`, { silent: true })
        stdoutAll += procResult.stdout
        stderrAll += procResult.stderr
        if (procResult.code !== 0 && procResult.code !== 1) {
          // Code 1 means no process found
          success = false
        }
      }

      result = { code: success ? 0 : 1, stdout: stdoutAll, stderr: stderrAll }
    } else if (currentOS === "linux") {
      // Linux: use killall
      // Execute each process separately to handle errors better
      let success = true
      let stdoutAll = ""
      let stderrAll = ""

      for (const proc of processNames) {
        const procResult = shell.exec(`killall "${proc}"`, { silent: true })
        stdoutAll += procResult.stdout
        stderrAll += procResult.stderr
        if (procResult.code !== 0 && procResult.code !== 1) {
          // Code 1 means no process found
          success = false
        }
      }

      result = { code: success ? 0 : 1, stdout: stdoutAll, stderr: stderrAll }
    } else {
      return {
        success: false,
        error: "Unsupported operating system",
      }
    }

    return {
      success: result.code === 0,
      stdout: result.stdout,
      stderr: result.stderr,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
})

// Open application
ipcMain.handle("open-application", async (event, appName) => {
  try {
    const currentOS = getOS()
    let command = ""

    if (currentOS === "windows") {
      // Windows: use start command
      command = `start "" "${appName}"`
    } else if (currentOS === "macos") {
      // macOS: use open -a
      command = `open -a "${appName}"`
    } else if (currentOS === "linux") {
      // Linux: just run the command
      command = `${appName} &`
    } else {
      return {
        success: false,
        error: "Unsupported operating system",
      }
    }

    const result = shell.exec(command, { silent: true })

    return {
      success: result.code === 0,
      stdout: result.stdout,
      stderr: result.stderr,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
})

// Window control handlers
ipcMain.on("window-minimize", () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.on("window-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.on("window-close", () => {
  if (mainWindow) mainWindow.close()
})

ipcMain.handle("window-is-maximized", () => {
  return mainWindow ? mainWindow.isMaximized() : false
})

