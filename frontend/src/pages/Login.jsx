import { App, Button, Card, Divider, Form, Input, Typography } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api, { API_BASE_URL } from '../api/axios.js'

const { Text, Title } = Typography

function Login() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)

    try {
      const { data } = await api.post('/api/auth/login', values)
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      localStorage.setItem('email', data.email)
      message.success(`Welcome back, ${data.username}`)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (error) {
      const msg = error?.response?.data?.error || 'Login failed. Check your credentials.'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const onGithubLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/github`
  }

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <GithubOutlined />
          </div>
          <Title level={3}>GitHub Trending Monitor</Title>
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
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Not a valid email' },
            ]}
          >
            <Input placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item className="auth-submit">
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>OR</Divider>

        <Button
          block
          size="large"
          onClick={onGithubLogin}
          icon={<GithubOutlined />}
          className="github-button"
        >
          Sign in with GitHub
        </Button>

        <div className="auth-switch">
          <Text type="secondary">Don't have an account? </Text>
          <Link to="/register">Create one</Link>
        </div>
      </Card>
    </main>
  )
}

export default Login
