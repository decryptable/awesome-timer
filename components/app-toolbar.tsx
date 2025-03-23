"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Info, Github, Coffee, Moon, Sun, Maximize2, Minimize2, HelpCircle, X, Clock, Save, FolderOpen } from 'lucide-react'
import { useTheme } from "next-themes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { TimerPreset } from "@/types/shell-types"
import { TimerSettings } from "@/types/timer-types"
import { savePreset, getPresets, createPreset } from "@/lib/storage-utils"

interface AppToolbarProps {
  currentSettings?: TimerSettings
  currentActions?: TimerPreset["actions"]
  hasChanges?: boolean
  onLoadPreset?: (preset: TimerPreset) => void
}

export default function AppToolbar({ 
  currentSettings, 
  currentActions, 
  hasChanges = false,
  onLoadPreset
}: AppToolbarProps) {
  const { theme, setTheme } = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [presetDescription, setPresetDescription] = useState("")
  const { toast } = useToast()
  
  // Tauri API references
  const [tauriDialog, setTauriDialog] = useState<any>(null)
  const [fs, setFs] = useState<any>(null)
  const [path, setPath] = useState<any>(null)
  const [tauriAvailable, setTauriAvailable] = useState(false)

  // Load Tauri APIs
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkTauri = async () => {
        try {
          // Check if Tauri is available
          if (window.__TAURI__) {
            setTauriAvailable(true);
            
            // Import Tauri modules
            const dialogModule = await import("@tauri-apps/api/dialog");
            const fsModule = await import("@tauri-apps/api/fs");
            const pathModule = await import("@tauri-apps/api/path");
            
            setTauriDialog(dialogModule);
            setFs(fsModule);
            setPath(pathModule);
          }
        } catch (err) {
          console.error("Failed to load Tauri APIs:", err);
        }
      };
      
      checkTauri();
    }
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }

  const handleSavePreset = async () => {
    if (!presetName.trim() || !currentSettings || !currentActions) {
      toast({
        title: "Error",
        description: "Please provide a name for your preset and ensure timer settings are configured.",
        variant: "destructive"
      });
      return;
    }

    // Create preset object
    const preset = createPreset(
      presetName,
      presetDescription,
      currentSettings,
      currentActions
    );

    // Save to local storage
    savePreset(preset);
    
    // Reset form
    setPresetName("");
    setPresetDescription("");
    setSaveDialogOpen(false);
    
    toast({
      title: "Preset Saved",
      description: `"${presetName}" has been saved successfully.`
    });
  }

  const handleSavePresetToFile = async () => {
    if (!currentSettings || !currentActions) {
      toast({
        title: "Error",
        description: "Cannot save preset to file. Missing settings or actions.",
        variant: "destructive"
      });
      return;
    }

    // Create preset object with current settings
    const preset = createPreset(
      presetName || "Unnamed Preset",
      presetDescription,
      currentSettings,
      currentActions
    );

    // Convert preset to JSON string
    const presetJson = JSON.stringify(preset, null, 2);

    if (tauriAvailable && tauriDialog && fs && path) {
      try {
        // Open save dialog
        const filePath = await tauriDialog.save({
          filters: [{
            name: 'Timer Preset',
            extensions: ['json']
          }],
          defaultPath: await path.downloadDir()
        });

        if (filePath) {
          // Write to file
          await fs.writeTextFile(filePath, presetJson);
          
          toast({
            title: "Preset Exported",
            description: "Preset has been saved to file successfully."
          });
        }
      } catch (error) {
        console.error("Failed to save preset to file:", error);
        toast({
          title: "Export Failed",
          description: "Failed to save preset to file. " + (error as Error).message,
          variant: "destructive"
        });
      }
    } else {
      // Fallback for web: download as file
      try {
        const blob = new Blob([presetJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${presetName || 'timer-preset'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Preset Exported",
          description: "Preset has been downloaded as a file."
        });
      } catch (error) {
        console.error("Failed to download preset:", error);
        toast({
          title: "Export Failed",
          description: "Failed to download preset file.",
          variant: "destructive"
        });
      }
    }
  }

  const handleOpenPresetFromFile = async () => {
    if (!onLoadPreset) {
      toast({
        title: "Error",
        description: "Cannot load preset. Missing load handler.",
        variant: "destructive"
      });
      return;
    }

    if (tauriAvailable && tauriDialog && fs) {
      try {
        // Open file dialog
        const filePaths = await tauriDialog.open({
          filters: [{
            name: 'Timer Preset',
            extensions: ['json']
          }],
          multiple: false
        });

        if (filePaths && typeof filePaths === 'string') {
          // Read file content
          const fileContent = await fs.readTextFile(filePaths);
          
          try {
            // Parse JSON
            const preset = JSON.parse(fileContent);
            
            // Validate preset structure
            if (!preset.settings || !preset.actions) {
              throw new Error("Invalid preset file format");
            }
            
            // Load preset
            onLoadPreset(preset);
            
            toast({
              title: "Preset Loaded",
              description: `"${preset.name}" has been loaded successfully.`
            });
          } catch (parseError) {
            console.error("Failed to parse preset file:", parseError);
            toast({
              title: "Invalid File",
              description: "The selected file is not a valid timer preset.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("Failed to open preset file:", error);
        toast({
          title: "Import Failed",
          description: "Failed to open preset file. " + (error as Error).message,
          variant: "destructive"
        });
      }
    } else {
      // Fallback for web: file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const preset = JSON.parse(event.target?.result as string);
            
            // Validate preset structure
            if (!preset.settings || !preset.actions) {
              throw new Error("Invalid preset file format");
            }
            
            // Load preset
            onLoadPreset(preset);
            
            toast({
              title: "Preset Loaded",
              description: `"${preset.name}" has been loaded successfully.`
            });
          } catch (error) {
            console.error("Failed to parse preset file:", error);
            toast({
              title: "Invalid File",
              description: "The selected file is not a valid timer preset.",
              variant: "destructive"
            });
          }
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    }
  }

  return (
    <div className="app-toolbar bg-card border-b border-border px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Clock className="h-5 w-5 text-primary" />
        <span className="font-medium">Awesome Timer</span>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button 
          variant="ghost" 
          size="icon" 
          title="Save Preset"
          onClick={() => setSaveDialogOpen(true)}
          className="relative"
        >
          <Save className="h-4 w-4" />
          {hasChanges && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          title="Open Preset"
          onClick={handleOpenPresetFromFile}
        >
          <FolderOpen className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="About">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
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
              
              <p className="text-center">
                This application is open source and available on GitHub.
              </p>
              
              <div className="flex justify-center">
                <Button variant="outline" className="space-x-2" onClick={() => window.open("https://github.com/decryptable/awesome-timer", "_blank")}>
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
              
              <div className="flex justify-center">
                <Button variant="ghost" className="space-x-2" onClick={() => window.open("https://github.com/decryptable", "_blank")}>
                  <Coffee className="h-4 w-4" />
                  <span>Support Developer</span>
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Help">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Help & Documentation</DialogTitle>
              <DialogDescription>
                Learn how to use Awesome Timer effectively
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Timer Controls</h3>
                <p className="text-sm">Use the Start, Pause, and Reset buttons to control the timer. You can also set custom durations using the time inputs.</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Shell Commands</h3>
                <p className="text-sm">Add shell commands that will execute when the timer completes. You can choose from templates or create your own custom commands.</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Customization</h3>
                <p className="text-sm">Customize the appearance of your timer including colors, fonts, and other visual elements.</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Presets</h3>
                <p className="text-sm">Save your timer configurations as presets for quick access later.</p>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
            <DialogDescription>
              Save your current timer settings and actions as a preset
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., Pomodoro Timer"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preset-description">Description (Optional)</Label>
              <Textarea
                id="preset-description"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="Describe what this preset is for"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleSavePresetToFile}
              className="sm:order-1 w-full sm:w-auto"
            >
              Export to File
            </Button>
            <DialogClose asChild className="sm:order-2">
              <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSavePreset} 
              disabled={!presetName.trim()}
              className="sm:order-3 w-full sm:w-auto"
            >
              Save to Library
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
