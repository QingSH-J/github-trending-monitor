import { App, Button, Card, Form, Input, Typography } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../api/axios.js'

const { Text, Title } = Typography

function Register() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)

    try {
      const { data } = await api.post('/api/auth/register', values)
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      localStorage.setItem('email', data.email)
      message.success(`Account created. Welcome, ${data.username}!`)
      navigate('/', { replace: true })
    } catch (error) {
      const msg = error?.response?.data?.error || 'Registration failed. Please try again.'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <GithubOutlined />
          </div>
          <Title level={3}>Create your account</Title>
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
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Not a valid email' },
            ]}
          >
            <Input placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please choose a username' },
              { min: 3, message: 'At least 3 characters' },
              {
                pattern: /^[a-zA-Z0-9_-]+$/,
                message: 'Letters, numbers, _ and - only',
              },
            ]}
          >
            <Input placeholder="octocat" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 8, message: 'At least 8 characters' },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item className="auth-submit">
            <Button type="primary" htmlType="submit" block loading={loading}>
              Create account
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-switch">
          <Text type="secondary">Already have an account? </Text>
          <Link to="/login">Sign in</Link>
        </div>
      </Card>
    </main>
  )
}

export default Register
