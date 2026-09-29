import { useCallback, useEffect, useState } from 'react'
import { checkAccount, configureHttpApi, getStateInstance, sendMessage } from './api/greenApi.ts'
import { ChatLayout } from './components/ChatLayout.tsx'
import { LoginScreen } from './components/LoginScreen.tsx'
import { useNotifications } from './hooks/useNotifications.ts'
import { nextChats, nextMessages } from './lib/messages.ts'
import { formatPhone, normalizePhone } from './lib/phone.ts'
import { loadSession, saveSession } from './lib/storage.ts'
import type { Chat, Credentials, Message, Notification } from './types.ts'

const STATE_LABELS: Record<string, string> = {
  notAuthorized: 'не авторизован',
  blocked: 'заблокирован',
  sleepMode: 'в спящем режиме',
  starting: 'запускается',
  yellowCard: 'ограничен',
}

export default function App() {
  const [session] = useState(loadSession)
  const [credentials, setCredentials] = useState<Credentials | null>(session.credentials)
  const [chats, setChats] = useState<Chat[]>(session.chats)
  const [messages, setMessages] = useState<Message[]>(session.messages)
  const [activeChatId, setActiveChatId] = useState<string | null>(session.activeChatId)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    saveSession({ credentials, chats, messages, activeChatId })
  }, [activeChatId, chats, credentials, messages])

  const onNotification = useCallback((notification: Notification) => {
    setMessages((current) => nextMessages(current, notification))
    setChats((current) => nextChats(current, notification))
  }, [])

  useNotifications({
    credentials,
    onNotification,
    onConnectionError: setConnectionError,
  })

  async function login(idInstance: string, apiTokenInstance: string): Promise<void> {
    const nextCredentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    }
    const state = await getStateInstance(nextCredentials)
    if (state !== 'authorized') {
      const label = STATE_LABELS[state] ?? state
      throw new Error(`Инстанс не авторизован в MAX. Текущий статус: ${label}.`)
    }
    await configureHttpApi(nextCredentials)
    setCredentials(nextCredentials)
    setConnectionError(null)
  }

  function logout(): void {
    setCredentials(null)
    setChats([])
    setMessages([])
    setActiveChatId(null)
    setConnectionError(null)
  }

  async function createChat(phoneInput: string): Promise<void> {
    if (!credentials) return

    const phone = normalizePhone(phoneInput)
    if (!phone) {
      throw new Error('Введите номер РФ (7...) или Беларуси (375...)')
    }

    const existingByPhone = chats.find((chat) => chat.phone === phone)
    if (existingByPhone) {
      setActiveChatId(existingByPhone.chatId)
      return
    }

    const account = await checkAccount(credentials, Number(phone))
    if (!account.exist || !account.chatId) {
      throw new Error('На этом номере нет аккаунта MAX')
    }

    const existingById = chats.find((chat) => chat.chatId === account.chatId)
    if (existingById) {
      setActiveChatId(existingById.chatId)
      return
    }

    const chat: Chat = {
      chatId: account.chatId,
      phone,
      title: formatPhone(phone),
      createdAt: Date.now(),
    }
    setChats((current) => [chat, ...current])
    setActiveChatId(chat.chatId)
  }

  async function send(text: string): Promise<void> {
    const trimmed = text.trim()
    if (!trimmed || !credentials || !activeChatId) return

    const localId = crypto.randomUUID()
    const pending: Message = {
      id: localId,
      chatId: activeChatId,
      text: trimmed,
      direction: 'out',
      timestamp: Date.now(),
      status: 'sending',
    }
    setMessages((current) => [...current, pending])

    try {
      const idMessage = await sendMessage(credentials, activeChatId, trimmed)
      setMessages((current) =>
        current.map((message) =>
          message.id === localId ? { ...message, id: idMessage, status: 'sent' } : message,
        ),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось отправить сообщение'
      setMessages((current) =>
        current.map((item) =>
          item.id === localId ? { ...item, status: 'error', error: message } : item,
        ),
      )
    }
  }

  if (!credentials) {
    return <LoginScreen onLogin={login} />
  }

  return (
    <ChatLayout
      chats={chats}
      messages={messages}
      activeChatId={activeChatId}
      connectionError={connectionError}
      onLogout={logout}
      onSelectChat={setActiveChatId}
      onCreateChat={createChat}
      onSend={send}
    />
  )
}
