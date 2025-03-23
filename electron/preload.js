const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electron", {
  // Shell.js commands
  shellExecute: (command) => ipcRenderer.invoke("execute-shell-command", command),
  detectProcesses: (processNames) => ipcRenderer.invoke("detect-processes", processNames),
  killProcesses: (processNames) => ipcRenderer.invoke("kill-processes", processNames),
  openApplication: (appName) => ipcRenderer.invoke("open-application", appName),

  // Window controls
  windowControls: {
    minimize: () => ipcRenderer.send("window-minimize"),
    maximize: () => ipcRenderer.send("window-maximize"),
    close: () => ipcRenderer.send("window-close"),
    isMaximized: () => ipcRenderer.invoke("window-is-maximized"),
  },
})

