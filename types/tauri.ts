// This declares the @tauri-apps/api module
declare module '@tauri-apps/api' {
  export * from '@tauri-apps/api/tauri';
  export * from '@tauri-apps/api/window';
  export * from '@tauri-apps/api/shell';
  export * from '@tauri-apps/api/notification';
  export * from '@tauri-apps/api/dialog';
  export * from '@tauri-apps/api/path';
  export * from '@tauri-apps/api/fs';
  export * from '@tauri-apps/api/os';
  export * from '@tauri-apps/api/app';
  export * from '@tauri-apps/api/process';
}

// This declares the window.__TAURI__ object
interface Window {
  __TAURI__: {
    tauri: {
      invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T>;
    };
    window: {
      appWindow: {
        minimize(): Promise<void>;
        maximize(): Promise<void>;
        unmaximize(): Promise<void>;
        toggleMaximize(): Promise<void>;
        close(): Promise<void>;
        isMaximized(): Promise<boolean>;
        isMinimized(): Promise<boolean>;
        isFullscreen(): Promise<boolean>;
        isDecorated(): Promise<boolean>;
        isResizable(): Promise<boolean>;
        isVisible(): Promise<boolean>;
        center(): Promise<void>;
        setTitle(title: string): Promise<void>;
        setDecorations(decorations: boolean): Promise<void>;
        setResizable(resizable: boolean): Promise<void>;
        setMaximizable(maximizable: boolean): Promise<void>;
        setMinimizable(minimizable: boolean): Promise<void>;
        setClosable(closable: boolean): Promise<void>;
        setFullscreen(fullscreen: boolean): Promise<void>;
        setFocus(): Promise<void>;
        setIcon(icon: string): Promise<void>;
        setSkipTaskbar(skip: boolean): Promise<void>;
        setIgnoreCursorEvents(ignore: boolean): Promise<void>;
        startDragging(): Promise<void>;
        onResized(handler: () => void): Promise<() => void>;
        onMoved(handler: () => void): Promise<() => void>;
        onCloseRequested(handler: (event: { preventDefault: () => void }) => void): Promise<() => void>;
        onFocusChanged(handler: (focused: boolean) => void): Promise<() => void>;
        onScaleChanged(handler: (factor: number) => void): Promise<() => void>;
        onThemeChanged(handler: (theme: string) => void): Promise<() => void>;
      };
    };
    shell: {
      open(path: string): Promise<void>;
    };
    notification: {
      show(options: { title: string; body: string; icon?: string }): Promise<void>;
      requestPermission(): Promise<string>;
      isPermissionGranted(): Promise<boolean>;
    };
    dialog: {
      open(options?: { directory?: boolean; multiple?: boolean; filters?: { name: string; extensions: string[] }[] }): Promise<string | string[] | null>;
      save(options?: { filters?: { name: string; extensions: string[] }[] }): Promise<string | null>;
      message(message: string, options?: { title?: string; type?: 'info' | 'warning' | 'error' }): Promise<void>;
      ask(message: string, options?: { title?: string; type?: 'info' | 'warning' | 'error' }): Promise<boolean>;
      confirm(message: string, options?: { title?: string; type?: 'info' | 'warning' | 'error' }): Promise<boolean>;
    };
    process: {
      exit(exitCode?: number): Promise<never>;
      relaunch(): Promise<void>;
    };
    os: {
      type(): Promise<string>;
      arch(): Promise<string>;
      version(): Promise<string>;
      platform(): Promise<string>;
      tempdir(): Promise<string>;
    };
  };
}
