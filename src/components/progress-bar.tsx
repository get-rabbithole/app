export interface ProgressBarProps {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div 
      role="progressbar" 
      aria-valuemax={100} 
      aria-valuenow={progress} 
      className="h-2 rounded-sm bg-white/10 w-40"
    >
      <div 
        className="h-2 rounded-sm bg-violet-300" 
        style={{ width: `${progress}%` }} 
      />
    </div>
  )
}