// Address book service — shared by checkout and the profile section.

import type { ShippingAddress } from '@/types'
import { mockError, mockFetch } from './mockApi'
import { uid } from '@/utils'

let addresses: ShippingAddress[] = [
  {
    id: 'addr-1',
    fullName: 'Aarav Malhotra',
    phone: '+91 98765 43210',
    email: 'aarav@example.com',
    line1: '204, Palm Residency, MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    landmark: 'Near Metro Pillar 42',
    isDefault: true,
    label: 'home',
  },
  {
    id: 'addr-2',
    fullName: 'Aarav Malhotra',
    phone: '+91 98765 43210',
    email: 'aarav@example.com',
    line1: '4th Floor, WeWork Galaxy, Residency Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560025',
    isDefault: false,
    label: 'work',
  },
]

export function addressService() {
  return {
    async getAddresses(): Promise<ShippingAddress[]> {
      return mockFetch(addresses, { delay: 400 }).then((r) => r.data)
    },

    async addAddress(input: Omit<ShippingAddress, 'id'>): Promise<ShippingAddress> {
      if (!input.line1 || !input.city || input.pincode.length !== 6) {
        mockError('Please complete all required address fields', 422)
      }
      const address: ShippingAddress = { ...input, id: uid('addr') }
      addresses = [address, ...addresses]
      return mockFetch(address).then((r) => r.data)
    },

    async updateAddress(id: string, patch: Partial<ShippingAddress>): Promise<ShippingAddress> {
      const index = addresses.findIndex((a) => a.id === id)
      if (index === -1) mockError('Address not found', 404)
      addresses[index] = { ...addresses[index], ...patch, id }
      return mockFetch(addresses[index]).then((r) => r.data)
    },

    async deleteAddress(id: string): Promise<{ deleted: boolean }> {
      addresses = addresses.filter((a) => a.id !== id)
      return mockFetch({ deleted: true }).then((r) => r.data)
    },

    async setDefault(id: string): Promise<ShippingAddress[]> {
      addresses = addresses.map((a) => ({ ...a, isDefault: a.id === id }))
      return mockFetch(addresses).then((r) => r.data)
    },
  }
}
