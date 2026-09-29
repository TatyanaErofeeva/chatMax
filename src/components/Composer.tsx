import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

type ComposerProps = {
  onSend: (text: string) => void
}

export function Composer({ onSend }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState('')

  function submit(): void {
    if (text.trim().length === 0) return
    const value = text
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    onSend(value)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    submit()
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        value={text}
        placeholder="Сообщение"
        rows={1}
        maxLength={4000}
        onChange={(event) => {
          setText(event.target.value)
          resize(event.target)
        }}
        onKeyDown={handleKeyDown}
        aria-label="Текст сообщения"
      />
      <button type="submit" disabled={text.trim().length === 0} aria-label="Отправить">
        <SendIcon />
      </button>
    </form>
  )
}

function resize(element: HTMLTextAreaElement): void {
  element.style.height = 'auto'
  element.style.height = `${Math.min(element.scrollHeight, 120)}px`
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h12" />
      <path d="M12 6l6 6-6 6" />
    </svg>
  )
}
