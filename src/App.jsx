import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './views/LoginPage.jsx'
import AppLayout from './views/AppLayout.jsx'

function RequireAuth({ children }) {
  const user = JSON.parse(localStorage.getItem('ppo_user') || 'null')
  if (!user?.loggedIn) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <RequireAuth>
          <AppLayout />
        </RequireAuth>
      } />
    </Routes>
  )
}
