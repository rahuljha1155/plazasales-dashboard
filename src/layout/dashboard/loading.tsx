import { Loader2Icon } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="h-[100vh] w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <Loader2Icon className="animate-spin text-primary" size={64} />
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Loading...</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we load your dashboard.</p>
        </div>
      </div>
    </div>
  )
}
