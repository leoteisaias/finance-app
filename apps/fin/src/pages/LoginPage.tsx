import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn } from '@/hooks/useAuth'
import styles from './AuthPage.module.css'

export function LoginPage() {
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
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>fin.</h1>
        <p className={styles.subtitle}>controle financeiro pessoal</p>
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
            placeholder="senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'entrando...' : 'entrar'}
          </button>
        </form>
        <p className={styles.link}>
          não tem conta? <Link to="/cadastro">cadastre-se</Link>
        </p>
      </div>
    </div>
  )
}
