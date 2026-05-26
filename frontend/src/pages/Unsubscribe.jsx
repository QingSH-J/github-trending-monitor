import { Button, Result, Spin } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import api from '../api/axios.js'

function Unsubscribe() {
  const { token: tokenParam } = useParams()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => tokenParam || searchParams.get('token') || '', [searchParams, tokenParam])
  const [status, setStatus] = useState(token ? 'loading' : 'missing')

  useEffect(() => {
    if (!token) {
      return undefined
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const { data } = await api.post('/api/unsubscribe', { token }, { signal: controller.signal })
        setStatus(data.success ? 'success' : 'invalid')
      } catch (error) {
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          return
        }

        setStatus('error')
      }
    }, 0)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [token])

  if (status === 'loading') {
    return (
      <main className="callback-page">
        <Spin size="large" description="Updating your subscription..." />
      </main>
    )
  }

  const resultMap = {
    success: {
      status: 'success',
      title: 'You have been unsubscribed',
      subTitle: 'Daily Repo Radar digest emails have been disabled for this address.',
      buttonText: 'Back to Repo Radar',
      link: '/',
    },
    invalid: {
      status: 'warning',
      title: 'This unsubscribe link is no longer valid',
      subTitle: 'The token may be expired, already removed, or copied incorrectly.',
      buttonText: 'Manage settings',
      link: '/settings/subscriptions',
    },
    missing: {
      status: 'error',
      title: 'Unsubscribe token missing',
      subTitle: 'Open the unsubscribe link from your email, or manage your subscription settings after signing in.',
      buttonText: 'Manage settings',
      link: '/settings/subscriptions',
    },
    error: {
      status: 'error',
      title: 'Unable to unsubscribe',
      subTitle: 'Something went wrong while updating your email subscription. Please try again later.',
      buttonText: 'Back to Repo Radar',
      link: '/',
    },
  }

  const result = resultMap[status] || resultMap.error

  return (
    <main className="callback-page">
      <Result
        status={result.status}
        title={result.title}
        subTitle={result.subTitle}
        extra={
          <Link to={result.link}>
            <Button type="primary">{result.buttonText}</Button>
          </Link>
        }
      />
    </main>
  )
}

export default Unsubscribe
