import { Button, Result, Spin } from 'antd'
import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      return
    }

    localStorage.setItem('token', token)

    if (!localStorage.getItem('username')) {
      localStorage.setItem('username', 'github-user')
    }

    navigate('/', { replace: true })
  }, [navigate, token])

  if (!token) {
    return (
      <main className="callback-page">
        <Result
          status="error"
          title="OAuth callback failed"
          subTitle="No token provided in callback URL"
          extra={
            <Link to="/login">
              <Button type="primary">Back to sign in</Button>
            </Link>
          }
        />
      </main>
    )
  }

  return (
    <main className="callback-page">
      <Spin size="large" description="Signing you in..." />
    </main>
  )
}

export default OAuthCallback
