import { formatPhone } from './phone.ts'
import type { Chat, Message, Notification, NotificationBody } from '../types.ts'

export function nextMessages(messages: Message[], notification: Notification): Message[] {
  const body = notification.body
  if (!body?.typeWebhook) return messages

  if (body.typeWebhook === 'outgoingMessageStatus') return applyStatus(messages, body)

  const incoming = readIncoming(body)
  if (!incoming) return messages
  if (messages.some((message) => message.id === incoming.id)) return messages
  return [...messages, incoming]
}

export function nextChats(chats: Chat[], notification: Notification): Chat[] {
  const body = notification.body
  if (body?.typeWebhook !== 'incomingMessageReceived') return chats

  const incoming = readIncoming(body)
  if (!incoming) return chats
  return upsertChat(chats, body, incoming.chatId)
}

function readIncoming(body: NotificationBody): Message | null {
  if (body.typeWebhook !== 'incomingMessageReceived') return null

  const text = body.messageData?.typeMessage === 'textMessage'
    ? body.messageData.textMessageData?.textMessage?.trim()
    : undefined
  const chatId = body.senderData?.chatId ? String(body.senderData.chatId) : ''
  if (!text || !chatId) return null

  return {
    id: body.idMessage || crypto.randomUUID(),
    chatId,
    text,
    direction: 'in',
    timestamp: toMillis(body.timestamp),
    status: 'sent',
  }
}

function applyStatus(messages: Message[], body: NotificationBody): Message[] {
  if (!body.idMessage) return messages
  if (body.status !== 'failed' && body.status !== 'noAccount') return messages

  const error = body.status === 'noAccount' ? 'Нет аккаунта MAX' : 'Не отправлено'
  return messages.map((message) =>
    message.id === body.idMessage ? { ...message, status: 'error', error } : message,
  )
}

function upsertChat(chats: Chat[], body: NotificationBody, chatId: string): Chat[] {
  const phone = body.senderData?.senderPhoneNumber
    ? String(body.senderData.senderPhoneNumber)
    : ''
  const name = body.senderData?.chatName || body.senderData?.senderName || ''
  const existing = chats.find((chat) => chat.chatId === chatId)

  if (!existing) {
    return [
      {
        chatId,
        phone,
        title: name || formatPhone(phone),
        createdAt: Date.now(),
      },
      ...chats,
    ]
  }

  const titleIsPhone = existing.title === formatPhone(existing.phone)
  if (!name || !titleIsPhone) {
    if (phone && !existing.phone) {
      return chats.map((chat) => (chat.chatId === chatId ? { ...chat, phone } : chat))
    }
    return chats
  }

  return chats.map((chat) =>
    chat.chatId === chatId ? { ...chat, title: name, phone: phone || chat.phone } : chat,
  )
}

function toMillis(timestamp: number | undefined): number {
  if (!timestamp) return Date.now()
  return timestamp < 1e12 ? timestamp * 1000 : timestamp
}
