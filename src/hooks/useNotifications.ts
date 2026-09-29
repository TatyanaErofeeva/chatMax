import { useEffect, useRef } from 'react'
import { deleteNotification, receiveNotification } from '../api/greenApi.ts'
import type { Credentials, Notification } from '../types.ts'

type Options = {
  credentials: Credentials | null
  onNotification: (notification: Notification) => void
  onConnectionError: (message: string | null) => void
}

export function useNotifications({
  credentials,
  onNotification,
  onConnectionError,
}: Options): void {
  const onNotificationRef = useRef(onNotification)
  const onConnectionErrorRef = useRef(onConnectionError)

  useEffect(() => {
    onNotificationRef.current = onNotification
    onConnectionErrorRef.current = onConnectionError
  }, [onConnectionError, onNotification])

  const idInstance = credentials?.idInstance
  const apiTokenInstance = credentials?.apiTokenInstance

  useEffect(() => {
    if (!idInstance || !apiTokenInstance) return

    const current: Credentials = { idInstance, apiTokenInstance }
    const controller = new AbortController()
    let stopped = false

    async function loop(): Promise<void> {
      while (!stopped) {
        try {
          const notification = await receiveNotification(current, controller.signal)
          if (stopped) return
          onConnectionErrorRef.current(null)
          if (!notification) continue

          try {
            onNotificationRef.current(notification)
          } finally {
            await deleteNotification(current, notification.receiptId, controller.signal)
          }
        } catch (error) {
          if (stopped || isAbortError(error)) return
          const message = error instanceof Error ? error.message : 'Не удалось получить сообщения'
          onConnectionErrorRef.current(message)
          try {
            await sleep(2000, controller.signal)
          } catch {
            return
          }
        }
      }
    }

    void loop()

    return () => {
      stopped = true
      controller.abort()
    }
  }, [apiTokenInstance, idInstance])
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => resolve(), ms)
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    if (signal.aborted) {
      onAbort()
      return
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}
