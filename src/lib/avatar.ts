import type { Chat } from '../types.ts'

const AVATAR_COLORS = ['#5b4dff', '#2f80ed', '#0f9d8a', '#d97706', '#db2777', '#7c3aed']

export function initials(chat: Chat): string {
  if (chat.title.startsWith('+') || chat.title === 'Неизвестный контакт') {
    return chat.phone.slice(-2) || '#'
  }
  const parts = chat.title.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  return chat.title.slice(0, 1).toUpperCase() || '#'
}

export function avatarColor(chatId: string): string {
  let hash = 0
  for (const char of chatId) hash = (hash + char.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[hash] ?? AVATAR_COLORS[0]
}
