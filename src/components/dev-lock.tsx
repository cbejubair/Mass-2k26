"use client"

import { useEffect, useState } from "react"
import { ExternalLink, X, Image, FileText, Download } from "lucide-react"

export function DeveloperProtection() {
  const [contextMenu, setContextMenu] = useState<{ 
    x: number; 
    y: number; 
    href: string | null;
    isImage: boolean;
    imageSrc: string | null;
  } | null>(null)

  useEffect(() => {
    // Custom right-click handler
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      // Check if clicked element is a link or inside a link
      let target = e.target as HTMLElement
      let href: string | null = null
      let isImage = false
      let imageSrc: string | null = null
      
      // Check if it's an image
      if (target.tagName === 'IMG') {
        isImage = true
        imageSrc = (target as HTMLImageElement).src
      }
      
      // Traverse up to find an anchor tag or image
      let currentTarget = target
      while (currentTarget && currentTarget !== document.body) {
        if (currentTarget.tagName === 'A' && (currentTarget as HTMLAnchorElement).href) {
          href = (currentTarget as HTMLAnchorElement).href
          break
        }
        if (currentTarget.tagName === 'IMG' && !isImage) {
          isImage = true
          imageSrc = (currentTarget as HTMLImageElement).src
        }
        currentTarget = currentTarget.parentElement as HTMLElement
      }
      
      // Show context menu at click position
      setContextMenu({ x: e.clientX, y: e.clientY, href, isImage, imageSrc })
      
      return false
    }

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+I (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault()
        return false
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault()
        return false
      }

      // Cmd+Option+I (Mac)
      if (e.metaKey && e.altKey && e.key === "i") {
        e.preventDefault()
        return false
      }

      // Cmd+Option+J (Mac)
      if (e.metaKey && e.altKey && e.key === "j") {
        e.preventDefault()
        return false
      }

      // Cmd+Option+C (Mac)
      if (e.metaKey && e.altKey && e.key === "c") {
        e.preventDefault()
        return false
      }

      // Cmd+U (Mac View Source)
      if (e.metaKey && e.key === "u") {
        e.preventDefault()
        return false
      }
    }

    // Detect DevTools
    const detectDevTools = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      
      if (widthThreshold || heightThreshold) {
        // DevTools detected - you could redirect or show a message
        console.clear()
      }
    }

    // Disable text selection (optional - can be removed if it affects UX)
    const disableSelect = (e: Event) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || 
          (e.target as HTMLElement).tagName === "TEXTAREA" ||
          (e.target as HTMLElement).isContentEditable) {
        return true
      }
      // e.preventDefault() - Commented out to allow normal text selection
      // return false
    }

    // Disable copy (optional - can be removed if it affects UX)
    const disableCopy = (e: ClipboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || 
          (e.target as HTMLElement).tagName === "TEXTAREA" ||
          (e.target as HTMLElement).isContentEditable) {
        return true
      }
      // e.preventDefault() - Commented out to allow normal copying
      // return false
    }

    // Prevent console.log attempts from external scripts
    const clearConsole = () => {
      console.clear()
      console.log = () => {}
      console.warn = () => {}
      console.error = () => {}
      console.info = () => {}
      console.debug = () => {}
    }

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)
    // document.addEventListener("selectstart", disableSelect)
    // document.addEventListener("copy", disableCopy)

    // Close context menu on click outside
    const handleClickOutside = () => setContextMenu(null)
    document.addEventListener("click", handleClickOutside)
    
    // Close context menu on scroll
    const handleScroll = () => setContextMenu(null)
    document.addEventListener("scroll", handleScroll, true)

    // Check for DevTools periodically
    const devToolsInterval = setInterval(detectDevTools, 1000)

    // Clear console on load in production
    if (process.env.NODE_ENV === "production") {
      clearConsole()
    }

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      // document.removeEventListener("selectstart", disableSelect)
      // document.removeEventListener("copy", disableCopy)
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("scroll", handleScroll, true)
      clearInterval(devToolsInterval)
    }
  }, [])

  return (
    <>
      {contextMenu && (
        <div
          className="fixed z-[9999] bg-background/95 backdrop-blur-sm border-2 border-primary/20 rounded-lg shadow-2xl p-2 min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            left: `${Math.min(contextMenu.x, window.innerWidth - 220)}px`,
            top: `${Math.min(contextMenu.y, window.innerHeight - 150)}px`,
            transform: 'translate(0, 0)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-1">
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/50">
              <span className="text-xs font-semibold text-muted-foreground">Quick Action</span>
              <button
                onClick={() => setContextMenu(null)}
                className="hover:bg-accent rounded p-0.5 transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            
            {/* Open Link Button */}
            {contextMenu.href && (
              <a
                href={contextMenu.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary/10 rounded-md transition-all duration-200 group"
                onClick={() => setContextMenu(null)}
              >
                <div className="bg-primary/10 rounded-full p-1.5 group-hover:bg-primary/20 transition-colors">
                  <ExternalLink className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Open Link</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {contextMenu.href}
                  </p>
                </div>
              </a>
            )}

            {/* Image Options */}
            {/* {contextMenu.isImage && contextMenu.imageSrc && (
              <>
                <a
                  href={contextMenu.imageSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-500/10 rounded-md transition-all duration-200 group"
                  onClick={() => setContextMenu(null)}
                >
                  <div className="bg-blue-500/10 rounded-full p-1.5 group-hover:bg-blue-500/20 transition-colors">
                    <Image className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">View Image</p>
                    <p className="text-xs text-muted-foreground">Open in new tab</p>
                  </div>
                </a>

                <a
                  href={contextMenu.imageSrc}
                  download
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-green-500/10 rounded-md transition-all duration-200 group"
                  onClick={() => setContextMenu(null)}
                >
                  <div className="bg-green-500/10 rounded-full p-1.5 group-hover:bg-green-500/20 transition-colors">
                    <Download className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Save Image</p>
                    <p className="text-xs text-muted-foreground">Download to device</p>
                  </div>
                </a>

                <button
                  onClick={() => {
                    if (contextMenu.imageSrc) {
                      navigator.clipboard.writeText(contextMenu.imageSrc)
                    }
                    setContextMenu(null)
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-purple-500/10 rounded-md transition-all duration-200 group w-full text-left"
                >
                  <div className="bg-purple-500/10 rounded-full p-1.5 group-hover:bg-purple-500/20 transition-colors">
                    <FileText className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Copy Image URL</p>
                    <p className="text-xs text-muted-foreground">Copy to clipboard</p>
                  </div>
                </button>
              </>
            )} */}

            {/* No Action Available */}
            {!contextMenu.href && !contextMenu.isImage && (
              <div className="px-3 py-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">No actions available</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Booked to use</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
