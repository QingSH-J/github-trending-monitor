/**
 * OAuth callback — /oauth/callback
 * Reads ?token= from the URL, persists to localStorage, redirects to /.
 * Shows a brief spinner while doing so.
 */
const OAuthCallbackPage = (() => {
  const { Spin, Result, Button } = window.antd;
  const { useNavigate, useLocation, Link } = window.ReactRouterDOM;

  return function OAuthCallbackPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      // HashRouter: query lives in location.search OR after the hash path.
      // useLocation().search reflects the hash-side query when using HashRouter.
      const params = new URLSearchParams(location.search || window.location.search);
      const token = params.get("token");

      if (!token) {
        setError("No token provided in callback URL");
        return;
      }

      localStorage.setItem("token", token);
      // Best-effort: stash a default username from the token for the navbar
      if (!localStorage.getItem("username")) {
        localStorage.setItem("username", "github-user");
      }
      navigate("/", { replace: true });
    }, [location.search, navigate]);

    if (error) {
      return (
        <div style={oauthStyles.wrap}>
          <Result
            status="error"
            title="OAuth callback failed"
            subTitle={error}
            extra={
              <Link to="/login">
                <Button type="primary">Back to sign in</Button>
              </Link>
            }
          />
        </div>
      );
    }

    return (
      <div style={oauthStyles.wrap}>
        <Spin size="large" tip="Signing you in..." />
      </div>
    );
  };
})();

const oauthStyles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f6f8fa",
  },
};

window.OAuthCallbackPage = OAuthCallbackPage;
