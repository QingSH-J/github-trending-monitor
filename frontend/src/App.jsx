import { App as AntApp, ConfigProvider } from 'antd'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import OAuthCallback from './pages/OAuthCallback.jsx'
import RepoDetail from './pages/RepoDetail.jsx'
import Register from './pages/Register.jsx'
import SubscriptionSettings from './pages/SubscriptionSettings.jsx'
import Unsubscribe from './pages/Unsubscribe.jsx'
import './App.css'

function RequireAuth({ children }) {
  const location = useLocation()
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0969da',
          colorLink: '#0969da',
          borderRadius: 6,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
        },
        components: {
          Button: {
            controlHeightLG: 44,
          },
          Card: {
            borderRadiusLG: 8,
          },
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/unsubscribe/:token" element={<Unsubscribe />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route
              path="/repos/:owner/:repo"
              element={
                <RequireAuth>
                  <RepoDetail />
                </RequireAuth>
              }
            />
            <Route
              path="/settings/subscriptions"
              element={
                <RequireAuth>
                  <SubscriptionSettings />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  )
}

export default App
