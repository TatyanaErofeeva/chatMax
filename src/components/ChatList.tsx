import { avatarColor, initials } from '../lib/avatar.ts'
import { formatPhone } from '../lib/phone.ts'
import type { Chat, Message } from '../types.ts'

type ChatListProps = {
  chats: Chat[]
  messages: Message[]
  activeChatId: string | null
  onSelect: (chatId: string) => void
}

export function ChatList({ chats, messages, activeChatId, onSelect }: ChatListProps) {
  const ordered = [...chats].sort((left, right) => lastActivity(right, messages) - lastActivity(left, messages))

  if (ordered.length === 0) {
    return <p className="chat-empty">Чатов пока нет. Введите номер и создайте диалог.</p>
  }

  return (
    <ul className="chat-list">
      {ordered.map((chat) => {
        const last = lastMessage(chat.chatId, messages)
        const active = chat.chatId === activeChatId
        return (
          <li key={chat.chatId}>
            <button
              type="button"
              className={active ? 'chat-item active' : 'chat-item'}
              onClick={() => onSelect(chat.chatId)}
            >
              <span className="avatar" style={{ background: avatarColor(chat.chatId) }}>
                {initials(chat)}
              </span>
              <span className="chat-item-body">
                <span className="chat-item-row">
                  <span className="chat-item-title">{chat.title}</span>
                  {last && <time>{formatListTime(last.timestamp)}</time>}
                </span>
                <span className="chat-item-preview">
                  {last ? last.text : formatPhone(chat.phone)}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function lastMessage(chatId: string, messages: Message[]): Message | undefined {
  return messages.reduce<Message | undefined>((latest, message) => {
    if (message.chatId !== chatId) return latest
    if (!latest || message.timestamp >= latest.timestamp) return message
    return latest
  }, undefined)
}

function lastActivity(chat: Chat, messages: Message[]): number {
  return lastMessage(chat.chatId, messages)?.timestamp ?? chat.createdAt
}

function formatListTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
