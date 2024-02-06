import { useEffect, useRef, useState } from "react";
import { emit } from '@tauri-apps/api/event';
import { ArrowUpToLine, FileInput, PowerOff, X } from "lucide-react";
import { writeText as writeToClipboard } from '@tauri-apps/api/clipboard';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';

import { MenuItem } from "./components/menu-item";
import { Separator } from "./components/separator";
import { useDropzone } from "react-dropzone";
import { ProgressBar } from "./components/progress-bar";
import { api } from "./lib/api";
import { getNextCloserTen } from "./util/get-closer-ten";

export function App() {
  const abortRef = useRef<AbortController>()

  const [uploadQueue, setUploadQueue] = useState<File[]>([])
  const [progress, setProgress] = useState(0)
  
  const { 
    getRootProps, 
    getInputProps, 
    isDragActive,
    open,
  } = useDropzone({
    onDrop: handleStartUpload,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  })

  useEffect(() => {
    isPermissionGranted().then((permissionGranted) => {
      if (!permissionGranted) {
        requestPermission()
      }
    });
  }, [])

  function emitUploadProgress(progress: number) {
    emit('progress', {
      progress,
    })
  }

  async function handleStartUpload(files: File[]) {
    setProgress(0)
    setUploadQueue(files)

    const [file] = files

    const createUploadURLResponse = await api.post<{
      signedUrl: string
      downloadUrl: string
    }>('/uploads', {
      name: file.name,
      contentType: file.type,
    })

    const { signedUrl, downloadUrl } = createUploadURLResponse.data

    const abortUpload = new AbortController()

    abortRef.current = abortUpload

    await api.put(signedUrl, file, {
      signal: abortUpload.signal,
      onUploadProgress(progressEvent) {
        if (!progressEvent.progress) {
          return
        }

        const progressPercent = Math.round(progressEvent.progress * 100)
        const closerTen = getNextCloserTen(progressPercent)

        emitUploadProgress(closerTen)
        setProgress(progressPercent)
      },
    })

    await writeToClipboard(downloadUrl)

    const permissionGranted = await isPermissionGranted();

    if (permissionGranted) {
      sendNotification({ 
        title: 'Upload succeeded!', 
        body: 'The file URL was copied to your clipboard!', 
      });
    }

    setUploadQueue([])
  }

  function handleCancelUpload() {
    if (abortRef.current) {
      abortRef.current.abort()
    }

    emitUploadProgress(0)
    setUploadQueue([])
  }

  function handleQuitApp() {
    emit('quit')
  }

  const status = uploadQueue.length > 0 ? 'accept'
    : isDragActive ? 'active' 
    : 'pending'

  return (
    <div className="space-y-1">
      <div 
        {...getRootProps()} 
        data-status={status}
        className="text-white/80 m-4 px-4 h-24 flex items-center border border-dashed rounded justify-center data-[status=active]:border-white/40 data-[status=active]:animate-pulse data-[status=accept]:border-violet-300/50"
      >
        <input {...getInputProps()} />

        {status === 'active' && 'Start upload...' }

        {status === 'accept' && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              {uploadQueue.length > 1 ? (
                <p className="animate-pulse">
                  Uploading {uploadQueue.length} file(s)...
                </p>
              ) : (
                <p className="animate-pulse">
                  Uploading {uploadQueue[0].name.length > 14 
                    ? uploadQueue[0].name.substring(0, 14).concat('...')
                    : uploadQueue[0].name}
                </p>
              )}

              <button onClick={handleCancelUpload} title="Cancel upload" className="text-red-300">
                <X className="w-3 h-3" />
              </button>
            </div>

            <ProgressBar progress={progress} />
          </div>
        )}

        {status === 'pending' && (
          <div className="flex items-center gap-2">
            <ArrowUpToLine className="w-3 h-3 stroke-[1.5px]" />
            <p>Drag files here...</p>
          </div>
        )}
      </div>

      <Separator />

      <nav className="px-1.5"> 
        <MenuItem onClick={open} hotkey="mod+o">
          <FileInput className="w-4 h-4 stroke-[1.5px]" />
          Select file
        </MenuItem>

        <MenuItem onClick={handleQuitApp} hotkey="mod+q" className="py-1">
          <PowerOff className="w-4 h-4 stroke-[1.5px]" />
          Quit
        </MenuItem>
      </nav>
    </div>
  );
}
