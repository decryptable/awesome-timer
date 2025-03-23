"use client"

import dynamic from "next/dynamic"

// Import the title bar component with SSR disabled
const TitleBar = dynamic(() => import("./title-bar-with-api"), {
  ssr: false,
  loading: () => <div className="title-bar-placeholder h-8"></div>,
})

export default function DynamicTitleBar() {
  return <TitleBar />
}

