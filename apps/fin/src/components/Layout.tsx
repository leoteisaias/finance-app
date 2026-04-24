import { NavLink, Outlet } from 'react-router-dom'
import { signOut } from '@/hooks/useAuth'
import styles from './Layout.module.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'DASHBOARD' },
  { to: '/rendas/fixas', label: 'Rendas fixas' },
  { to: '/rendas/variaveis', label: 'Rendas variáveis' },
  { to: '/dividas', label: 'Dívidas ativas' },
  { to: '/antigas', label: 'Dívidas antigas' },
  { to: '/gastos', label: 'Gastos' },
  { to: '/investimentos', label: 'Investimentos' },

]

export function Layout() {
  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar}>
        <span className={styles.logo}>fin.</span>
        <ul className={styles.navList}>
          {NAV_ITEMS.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <button className={styles.signout} onClick={() => void signOut()}>
          sair
        </button>
      </nav>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
