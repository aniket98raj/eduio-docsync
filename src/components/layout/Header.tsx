import React from 'react'
interface HeaderProps { title: string; subtitle?: string; actions?: React.ReactNode }
export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
