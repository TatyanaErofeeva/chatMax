import { useState, type FormEvent } from 'react'

type LoginScreenProps = {
  onLogin: (idInstance: string, apiTokenInstance: string) => Promise<void>
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const id = idInstance.trim()
    const token = apiTokenInstance.trim()

    if (!id || !token) {
      setError('Введите idInstance и apiTokenInstance')
      return
    }
    if (!/^\d+$/.test(id)) {
      setError('idInstance должен состоять из цифр')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await onLogin(id, token)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={(event) => void handleSubmit(event)}>
        <div className="brand-mark" aria-hidden="true">
          M
        </div>
        <h1>MAX</h1>
        <p className="login-lead">Вход по данным инстанса GREEN-API</p>

        <label className="field">
          <span>idInstance</span>
          <input
            name="idInstance"
            value={idInstance}
            onChange={(event) => setIdInstance(event.target.value)}
            autoComplete="username"
            inputMode="numeric"
            disabled={loading}
          />
        </label>

        <label className="field">
          <span>apiTokenInstance</span>
          <input
            name="apiTokenInstance"
            type="password"
            value={apiTokenInstance}
            onChange={(event) => setApiTokenInstance(event.target.value)}
            autoComplete="current-password"
            disabled={loading}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </main>
  )
}
