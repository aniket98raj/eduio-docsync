import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
      <Link href="/dashboard" className="text-brand-600 hover:underline">Go to Dashboard</Link>
    </div>
  )
}
