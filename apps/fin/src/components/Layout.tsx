import { NavLink, Outlet } from 'react-router-dom'
import { signOut } from '@/hooks/useAuth'
import styles from './Layout.module.css'

const NAV_ITEMS = [
  { to: '/dashboard',     label: 'dashboard' },
  { to: '/dividas',       label: 'dívidas ativas' },
  { to: '/antigas',       label: 'dívidas antigas' },
  { to: '/gastos',        label: 'gastos' },
  { to: '/investimentos', label: 'investimentos' },
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
