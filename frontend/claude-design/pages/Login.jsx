/**
 * Login page — /login
 * Centered card with email + password, "Login with GitHub" button, link to /register.
 */
const { Form, Input, Button, Card, Typography, message, Divider, Space } = window.antd;
const { Title, Text } = Typography;
const { Link, useNavigate } = window.ReactRouterDOM;

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { data } = await window.api.post("/api/auth/login", values);
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("email", data.email);
      message.success(`Welcome back, ${data.username}`);
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed. Check your credentials.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onGithubLogin = () => {
    // In production this would hit /api/auth/github and redirect to GitHub OAuth
    window.location.href = "#/oauth/callback?token=mock.github.jwt.demo";
  };

  return (
    <div style={loginStyles.wrap}>
      <Card style={loginStyles.card} bodyStyle={{ padding: 32 }}>
        <div style={loginStyles.header}>
          <div style={loginStyles.logo}>
            <svg height="36" viewBox="0 0 16 16" width="36" fill="#24292e">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          </div>
          <Title level={3} style={{ margin: "12px 0 4px" }}>GitHub Trending Monitor</Title>
          <Text type="secondary">Sign in to track what's hot on GitHub</Text>
        </div>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
          size="large"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Not a valid email" },
            ]}
          >
            <Input placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <Divider plain style={{ color: "#8c8c8c", fontSize: 12 }}>OR</Divider>

        <Button
          block
          size="large"
          onClick={onGithubLogin}
          icon={
            <svg height="16" viewBox="0 0 16 16" width="16" fill="#fff" style={{ verticalAlign: "-3px" }}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          }
          style={{
            background: "#24292e",
            color: "#fff",
            borderColor: "#24292e",
          }}
        >
          Sign in with GitHub
        </Button>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Text type="secondary">Don't have an account? </Text>
          <Link to="/register">Create one</Link>
        </div>
      </Card>
      <Text type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
        Demo mode — any email/password will sign you in
      </Text>
    </div>
  );
}

const loginStyles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f6f8fa",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 408,
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(140, 149, 159, 0.2)",
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
  },
  logo: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#f6f8fa",
    border: "1px solid #d0d7de",
  },
};

window.LoginPage = LoginPage;
