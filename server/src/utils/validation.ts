/**
 * Utility function to validate whether a string is a 24-character hexadecimal MongoDB ObjectId.
 */
export function isValidObjectId(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false
  return /^[0-9a-fA-F]{24}$/.test(id)
}
