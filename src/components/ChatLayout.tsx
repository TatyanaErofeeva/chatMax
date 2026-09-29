import { useState } from 'react'
import { avatarColor, initials } from '../lib/avatar.ts'
import { formatPhone } from '../lib/phone.ts'
import type { Chat, Message } from '../types.ts'
import { ChatList } from './ChatList.tsx'
import { Composer } from './Composer.tsx'
import { MessageList } from './MessageList.tsx'
import { NewChatForm } from './NewChatForm.tsx'

type ChatLayoutProps = {
  chats: Chat[]
  messages: Message[]
  activeChatId: string | null
  connectionError: string | null
  onLogout: () => void
  onSelectChat: (chatId: string) => void
  onCreateChat: (phone: string) => Promise<void>
  onSend: (text: string) => void
}

export function ChatLayout({
  chats,
  messages,
  activeChatId,
  connectionError,
  onLogout,
  onSelectChat,
  onCreateChat,
  onSend,
}: ChatLayoutProps) {
  const [mobilePane, setMobilePane] = useState<'list' | 'dialog'>('list')
  const activeChat = chats.find((chat) => chat.chatId === activeChatId) ?? null
  const dialogMessages = messages.filter((message) => message.chatId === activeChatId)
  const subtitle = chatSubtitle(activeChat)

  function selectChat(chatId: string): void {
    onSelectChat(chatId)
    setMobilePane('dialog')
  }

  async function createChat(phone: string): Promise<void> {
    await onCreateChat(phone)
    setMobilePane('dialog')
  }

  return (
    <div className="app-shell">
      {connectionError && <div className="connection-error">{connectionError}</div>}
      <div className="workspace" data-pane={mobilePane}>
        <aside className="sidebar">
          <header className="sidebar-header">
            <h1>Чаты</h1>
            <button type="button" className="text-button" onClick={onLogout}>
              Выйти
            </button>
          </header>
          <NewChatForm onCreate={createChat} />
          <ChatList
            chats={chats}
            messages={messages}
            activeChatId={activeChatId}
            onSelect={selectChat}
          />
        </aside>

        <section className="dialog">
          {activeChat ? (
            <>
              <header className="dialog-header">
                <button type="button" className="back-button" onClick={() => setMobilePane('list')}>
                  Назад
                </button>
                <span
                  className="avatar small"
                  style={{ background: avatarColor(activeChat.chatId) }}
                >
                  {initials(activeChat)}
                </span>
                <div>
                  <h2>{activeChat.title}</h2>
                  {subtitle && <p>{subtitle}</p>}
                </div>
              </header>
              <MessageList messages={dialogMessages} />
              <Composer onSend={onSend} />
            </>
          ) : (
            <div className="empty-dialog">
              <h2>Выберите чат</h2>
              <p>Создайте диалог по номеру телефона или откройте существующий.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function chatSubtitle(chat: Chat | null): string | null {
  if (!chat?.phone) return null
  const formatted = formatPhone(chat.phone)
  if (formatted === chat.title) return null
  return formatted
}
