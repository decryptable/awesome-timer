export function formatTime(seconds: number, showMilliseconds = true): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const milliseconds = Math.floor((seconds % 1) * 10)

  let timeString = ""

  if (hours > 0) {
    timeString += `${hours.toString().padStart(2, "0")}:`
  }

  timeString += `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`

  if (showMilliseconds) {
    timeString += `.${milliseconds}`
  }

  return timeString
}

