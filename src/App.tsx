import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { fetchPublicStoreSettings } from '@/services/storeSettingsStore'
import { Wrench } from 'lucide-react'

export default function App() {
  const [maintenance, setMaintenance] = useState(false)
  const [storeName, setStoreName] = useState('Bareo Cosmetics')

  useEffect(() => {
    fetchPublicStoreSettings().then((s) => {
      setMaintenance(Boolean(s.maintenanceMode))
      setStoreName(s.storeName || 'Bareo Cosmetics')
    })
  }, [])

  // Check if current path is admin
  const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')

  if (maintenance && !isAdminPath) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#111111] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full rounded-2xl border border-[#E5E7EB] bg-white p-8 space-y-4 shadow-2xs">
          <div className="size-12 rounded-full bg-[#FAF7F2] border border-[#E5E7EB] flex items-center justify-center mx-auto text-[#111111]">
            <Wrench className="size-6" />
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#111111] tracking-tight">{storeName}</h1>
          <p className="text-sm font-medium text-[#111111]">Storefront Maintenance</p>
          <p className="text-xs text-[#6B7280] font-light leading-relaxed">
            Our storefront is currently undergoing scheduled updates to refine our formulations. Please return shortly.
          </p>
          <div className="pt-4 border-t border-[#E5E7EB]">
            <a
              href="/admin/login"
              className="text-xs font-semibold text-[#111111] hover:underline"
            >
              Admin Operations Portal →
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <RouterProvider router={router} />
}
