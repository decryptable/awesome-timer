import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import DynamicTitleBar from "@/components/dynamic-title-bar"
import ContextMenuProvider from "@/components/context-menu"
import { Github, Clock } from "lucide-react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Awesome Timer</title>
        <meta name="description" content="Customizable timer with shell actions" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ContextMenuProvider>
            <div className="electron-window">
              <DynamicTitleBar />
              <div className="electron-content">{children}</div>
              <footer className="bg-card border-t border-border p-4 text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Awesome Timer</span>
                  <span>•</span>
                  <span>© 2025 decryptable</span>
                  <span>•</span>
                  <a
                    href="https://github.com/decryptable/awesome-timer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    <Github className="h-4 w-4 mr-1" />
                    <span>Open Source</span>
                  </a>
                </div>
              </footer>
            </div>
          </ContextMenuProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

