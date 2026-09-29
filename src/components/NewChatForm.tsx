import { useState, type FormEvent } from 'react'

type NewChatFormProps = {
  onCreate: (phone: string) => Promise<void>
}

export function NewChatForm({ onCreate }: NewChatFormProps) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onCreate(phone)
      setPhone('')
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Не удалось создать чат')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="new-chat" onSubmit={(event) => void handleSubmit(event)}>
      <input
        name="phone"
        type="tel"
        placeholder="Номер телефона"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        disabled={loading}
        aria-label="Номер телефона получателя"
      />
      <button type="submit" disabled={loading || phone.trim().length === 0}>
        {loading ? '...' : 'Создать'}
      </button>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}
