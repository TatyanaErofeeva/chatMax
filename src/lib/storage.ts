import type { Message, Session } from '../types.ts'

const STORAGE_KEY = 'max-chat-session'

const emptySession: Session = {
  credentials: null,
  chats: [],
  messages: [],
  activeChatId: null,
}

export function loadSession(): Session {
  const storage = getStorage()
  if (!storage) return emptySession

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return emptySession
    const parsed = JSON.parse(raw) as Partial<Session>
    return {
      credentials: parsed.credentials ?? null,
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
      messages: Array.isArray(parsed.messages)
        ? parsed.messages.map(markInterrupted)
        : [],
      activeChatId: parsed.activeChatId ?? null,
    }
  } catch {
    return emptySession
  }
}

export function saveSession(session: Session): void {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function markInterrupted(message: Message): Message {
  if (message.status !== 'sending') return message
  return {
    ...message,
    status: 'error',
    error: 'Отправка прервана',
  }
}

function getStorage(): Storage | null {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage
}
