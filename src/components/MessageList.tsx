import { useEffect, useRef } from 'react'
import type { Message } from '../types.ts'

type MessageListProps = {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const ordered = [...messages].sort((left, right) => left.timestamp - right.timestamp)
  const lastMessage = ordered.at(-1)
  const lastMessageId = lastMessage?.id
  const lastMessageStatus = lastMessage?.status

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [ordered.length, lastMessageId, lastMessageStatus])

  return (
    <div className="message-list">
      {ordered.length === 0 && <p className="thread-empty">Напишите первое сообщение</p>}
      {ordered.map((message) => (
        <article
          key={message.id}
          className={message.direction === 'out' ? 'bubble outgoing' : 'bubble incoming'}
        >
          <p>{message.text}</p>
          <footer>
            <time>
              {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
            {message.status === 'sending' && <span>отправляется</span>}
            {message.status === 'error' && (
              <span className="bubble-error">{message.error ?? 'Не отправлено'}</span>
            )}
          </footer>
        </article>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
