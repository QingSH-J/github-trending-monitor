/**
 * Register page — /register
 * Email + username + password, link back to /login.
 */
const RegisterPage = (() => {
  const { Form, Input, Button, Card, Typography, message } = window.antd;
  const { Title, Text } = Typography;
  const { Link, useNavigate } = window.ReactRouterDOM;

  return function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const onFinish = async (values) => {
      setLoading(true);
      try {
        const { data } = await window.api.post("/api/auth/register", values);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", data.email);
        message.success(`Account created. Welcome, ${data.username}!`);
        navigate("/");
      } catch (err) {
        const msg = err?.response?.data?.message || "Registration failed. Please try again.";
        message.error(msg);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={registerStyles.wrap}>
        <Card style={registerStyles.card} bodyStyle={{ padding: 32 }}>
          <div style={registerStyles.header}>
            <div style={registerStyles.logo}>
              <svg height="36" viewBox="0 0 16 16" width="36" fill="#24292e">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
            </div>
            <Title level={3} style={{ margin: "12px 0 4px" }}>Create your account</Title>
            <Text type="secondary">Start monitoring trending repos in seconds</Text>
          </div>

          <Form
            name="register"
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
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please choose a username" },
                { min: 3, message: "At least 3 characters" },
                { pattern: /^[a-zA-Z0-9_-]+$/, message: "Letters, numbers, _ and - only" },
              ]}
            >
              <Input placeholder="octocat" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter a password" },
                { min: 8, message: "At least 8 characters" },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 8, marginTop: 8 }}>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Create account
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Text type="secondary">Already have an account? </Text>
            <Link to="/login">Sign in</Link>
          </div>
        </Card>
        <Text type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
          By signing up you agree to the Terms and Privacy Policy
        </Text>
      </div>
    );
  };
})();

const registerStyles = {
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

window.RegisterPage = RegisterPage;
