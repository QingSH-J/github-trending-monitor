/**
 * App.jsx — router shell and auth guard.
 *
 * Real-project equivalent:
 *   <BrowserRouter>
 *     <Routes>
 *       <Route path="/login" element={<LoginPage />} />
 *       ...
 *     </Routes>
 *   </BrowserRouter>
 *
 * We use HashRouter here so the prototype works from a static file:// or
 * any single-page host without needing a fallback rewrite rule.
 */
const { HashRouter, Routes, Route, Navigate, useLocation } = window.ReactRouterDOM;
const { ConfigProvider } = window.antd;

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0969da",
          colorLink: "#0969da",
          borderRadius: 6,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
        },
      }}
    >
      <HashRouter>
        <Routes>
          <Route path="/login" element={<window.LoginPage />} />
          <Route path="/register" element={<window.RegisterPage />} />
          <Route path="/oauth/callback" element={<window.OAuthCallbackPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <window.HomePage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
}

window.App = App;
