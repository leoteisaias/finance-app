import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from '@/components/PrivateRoute'
import { Layout } from '@/components/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { CadastroPage } from '@/pages/CadastroPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DividasPage } from '@/pages/DividasPage'
import { AntigasPage } from '@/pages/AntigasPage'
import { GastosPage } from '@/pages/GastosPage'
import { InvestimentosPage } from '@/pages/InvestimentosPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard"      element={<DashboardPage />} />
            <Route path="/dividas"        element={<DividasPage />} />
            <Route path="/antigas"        element={<AntigasPage />} />
            <Route path="/gastos"         element={<GastosPage />} />
            <Route path="/investimentos"  element={<InvestimentosPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
