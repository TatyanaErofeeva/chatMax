export type Credentials = {
  idInstance: string
  apiTokenInstance: string
}

export type Chat = {
  chatId: string
  phone: string
  title: string
  createdAt: number
}

export type MessageStatus = 'sending' | 'sent' | 'error'

export type Message = {
  id: string
  chatId: string
  text: string
  direction: 'in' | 'out'
  timestamp: number
  status: MessageStatus
  error?: string
}

export type CheckAccountResponse = {
  exist: boolean
  chatId?: string
}

export type NotificationBody = {
  typeWebhook?: string
  timestamp?: number
  idMessage?: string
  status?: string
  senderData?: {
    chatId?: string
    chatName?: string
    senderName?: string
    senderPhoneNumber?: number
  }
  messageData?: {
    typeMessage?: string
    textMessageData?: {
      textMessage?: string
    }
  }
}

export type Notification = {
  receiptId: number
  body?: NotificationBody
}

export type Session = {
  credentials: Credentials | null
  chats: Chat[]
  messages: Message[]
  activeChatId: string | null
}
