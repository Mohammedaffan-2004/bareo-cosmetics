import { apiFetch } from './apiClient'

export interface PublicStoreSettings {
  storeName: string
  supportEmail: string
  supportPhone: string
  freeShippingThreshold: number
  gstRate: number
  lowStockThreshold: number
  maintenanceMode: boolean
  aiAssistantEnabled: boolean
}

const defaultSettings: PublicStoreSettings = {
  storeName: 'Bareo Cosmetics',
  supportEmail: 'care@bareo.in',
  supportPhone: '+91 1800 300 3000',
  freeShippingThreshold: 499,
  gstRate: 18,
  lowStockThreshold: 20,
  maintenanceMode: false,
  aiAssistantEnabled: true,
}

let currentSettings: PublicStoreSettings = { ...defaultSettings }

export function getActiveStoreSettings(): PublicStoreSettings {
  return currentSettings
}

export function setActiveStoreSettings(newSettings: Partial<PublicStoreSettings>) {
  currentSettings = { ...currentSettings, ...newSettings }
}

export async function fetchPublicStoreSettings(): Promise<PublicStoreSettings> {
  try {
    const res = await apiFetch<PublicStoreSettings>('/settings')
    if (res.data) {
      currentSettings = { ...res.data }
      return currentSettings
    }
  } catch (err) {
    console.warn('[Settings Store] Using default settings.', err)
  }
  return currentSettings
}
