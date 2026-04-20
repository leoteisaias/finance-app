import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp } from '@/hooks/useAuth'
import styles from './AuthPage.module.css'

export function CadastroPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUp(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>fin.</h1>
        <p className={styles.subtitle}>criar nova conta</p>
        <form onSubmit={(e) => { void handleSubmit(e) }} className={styles.form}>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="senha (mín. 6 caracteres)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'criando conta...' : 'criar conta'}
          </button>
        </form>
        <p className={styles.link}>
          já tem conta? <Link to="/login">entrar</Link>
        </p>
      </div>
    </div>
  )
}
