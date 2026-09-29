import type { CheckAccountResponse, Credentials, Notification } from '../types.ts'

const API_URL = import.meta.env.DEV ? '/green-api' : 'https://api.green-api.com'

export async function getStateInstance(credentials: Credentials): Promise<string> {
  const response = await fetch(methodUrl(credentials, 'getStateInstance'))
  if (!response.ok) throw new Error(await readError(response))

  const data = (await response.json()) as { stateInstance?: string }
  if (!data.stateInstance) throw new Error('Не удалось прочитать статус инстанса')
  return data.stateInstance
}

export async function configureHttpApi(credentials: Credentials): Promise<void> {
  const response = await fetch(methodUrl(credentials, 'setSettings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webhookUrl: '',
      incomingWebhook: 'yes',
      outgoingWebhook: 'yes',
    }),
  })
  if (!response.ok) throw new Error(await readError(response))
}

export async function checkAccount(
  credentials: Credentials,
  phoneNumber: number,
): Promise<CheckAccountResponse> {
  const response = await fetch(methodUrl(credentials, 'checkAccount'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  })
  if (!response.ok) throw new Error(await readError(response))

  const data = (await response.json()) as { exist?: boolean; chatId?: string | number }
  return {
    exist: Boolean(data.exist),
    chatId: data.chatId == null ? undefined : String(data.chatId),
  }
}

export async function sendMessage(
  credentials: Credentials,
  chatId: string,
  message: string,
): Promise<string> {
  const response = await fetch(methodUrl(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
  if (!response.ok) throw new Error(await readError(response))

  const data = (await response.json()) as { idMessage?: string }
  if (!data.idMessage) throw new Error('Сервер не вернул идентификатор сообщения')
  return data.idMessage
}

export async function receiveNotification(
  credentials: Credentials,
  signal: AbortSignal,
): Promise<Notification | null> {
  const url = `${methodUrl(credentials, 'receiveNotification')}?receiveTimeout=20`
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(await readError(response))

  const text = (await response.text()).trim()
  if (!text || text === 'null') return null

  const data = JSON.parse(text) as Notification | null
  if (!data || typeof data.receiptId !== 'number') return null
  return data
}

export async function deleteNotification(
  credentials: Credentials,
  receiptId: number,
  signal: AbortSignal,
): Promise<void> {
  const response = await fetch(`${methodUrl(credentials, 'deleteNotification')}/${receiptId}`, {
    method: 'DELETE',
    signal,
  })
  if (!response.ok) throw new Error(await readError(response))
}

function methodUrl(credentials: Credentials, method: string): string {
  const id = encodeURIComponent(credentials.idInstance)
  const token = encodeURIComponent(credentials.apiTokenInstance)
  return `${API_URL}/waInstance${id}/${method}/${token}`
}

async function readError(response: Response): Promise<string> {
  const text = await response.text()
  if (!text) return `Ошибка ${response.status}`

  try {
    const data = JSON.parse(text) as {
      message?: string
      description?: string
      error?: string
    }
    return data.message || data.description || data.error || text
  } catch {
    if (text.trimStart().startsWith('<')) return `Ошибка ${response.status}`
    return text
  }
}
