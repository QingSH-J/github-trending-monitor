import {
  App,
  Avatar,
  Button,
  InputNumber,
  Layout,
  Skeleton,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd'
import {
  ArrowLeftOutlined,
  BellOutlined,
  GithubOutlined,
  MailOutlined,
  SaveOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

const { Header, Content } = Layout
const { Paragraph, Text, Title } = Typography

function SubscriptionSettings() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const username = localStorage.getItem('username') || 'user'
  const email = localStorage.getItem('email') || ''
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [formState, setFormState] = useState({
    enabled: false,
    dailyCount: 5,
  })

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)

      try {
        const { data } = await api.get('/api/subscriptions', { signal: controller.signal })
        const next = {
          enabled: Boolean(data.enabled),
          dailyCount: data.dailyCount || 5,
        }
        setSubscription(data)
        setFormState(next)
      } catch (error) {
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          return
        }

        message.error(error.response?.data?.error || 'Unable to load subscription settings')
      } finally {
        setLoading(false)
      }
    }, 0)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [message])

  const isDirty = useMemo(() => {
    if (!subscription) {
      return false
    }

    return (
      Boolean(subscription.enabled) !== formState.enabled ||
      Number(subscription.dailyCount || 5) !== Number(formState.dailyCount)
    )
  }, [formState, subscription])

  const saveSubscription = async () => {
    setSaving(true)

    try {
      const { data } = await api.put('/api/subscriptions', {
        enabled: formState.enabled,
        dailyCount: formState.dailyCount,
      })
      setSubscription(data)
      setFormState({
        enabled: Boolean(data.enabled),
        dailyCount: data.dailyCount || 5,
      })
      message.success('Subscription settings saved')
    } catch (error) {
      message.error(error.response?.data?.error || 'Unable to save subscription settings')
    } finally {
      setSaving(false)
    }
  }

  const disableSubscription = async () => {
    setSaving(true)

    try {
      const { data } = await api.put('/api/subscriptions', {
        enabled: false,
        dailyCount: formState.dailyCount,
      })
      setSubscription(data)
      setFormState({
        enabled: Boolean(data.enabled),
        dailyCount: data.dailyCount || 5,
      })
      message.success('Daily digest unsubscribed')
    } catch (error) {
      message.error(error.response?.data?.error || 'Unable to unsubscribe')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout className="app-shell github-shell">
      <Header className="topbar github-topbar">
        <button className="brand brand-button" type="button" onClick={() => navigate('/')}>
          <span className="brand-mark">
            <GithubOutlined />
          </span>
          <span className="brand-name">Repo Radar</span>
        </button>

        <Space size="middle">
          <Button ghost icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            Back
          </Button>
          <span className="settings-user">
            <Avatar size={28} className="user-avatar">
              {username.slice(0, 1).toUpperCase()}
            </Avatar>
            <span>{username}</span>
          </span>
        </Space>
      </Header>

      <Content className="github-main settings-main">
        <section className="github-repo-header">
          <div className="repo-title-line">
            <SettingOutlined />
            <Title level={1}>Settings</Title>
            <Tag>Account</Tag>
          </div>
          <Paragraph>{email || 'Signed in user'}</Paragraph>
        </section>

        <div className="settings-layout">
          <aside className="settings-sidebar" aria-label="Settings navigation">
            <button className="active" type="button">
              <MailOutlined />
              Subscriptions
            </button>
            <button type="button" disabled>
              <BellOutlined />
              Notifications
            </button>
          </aside>

          <section className="settings-panel">
            <div className="settings-panel-header">
              <div>
                <Title level={2}>Email Subscriptions</Title>
                <Text type="secondary">Daily GitHub trending digest</Text>
              </div>
              {subscription && (
                <Tag color={formState.enabled ? 'green' : 'default'}>
                  {formState.enabled ? 'Enabled' : 'Disabled'}
                </Tag>
              )}
            </div>

            {loading ? (
              <div className="settings-loading">
                <Skeleton active paragraph={{ rows: 4 }} title={{ width: '40%' }} />
              </div>
            ) : (
              <div className="subscription-form">
                <div className="setting-row">
                  <div>
                    <Text strong>Daily digest</Text>
                    <Paragraph type="secondary">Send trending repositories to your inbox.</Paragraph>
                  </div>
                  <Switch
                    checked={formState.enabled}
                    onChange={(enabled) => setFormState((current) => ({ ...current, enabled }))}
                  />
                </div>

                <div className="setting-row">
                  <div>
                    <Text strong>Repositories per email</Text>
                    <Paragraph type="secondary">Choose 3 to 15 repositories for each digest.</Paragraph>
                  </div>
                  <InputNumber
                    min={3}
                    max={15}
                    value={formState.dailyCount}
                    onChange={(dailyCount) =>
                      setFormState((current) => ({ ...current, dailyCount: dailyCount || 3 }))
                    }
                  />
                </div>

                <div className="settings-actions">
                  <Button onClick={() => navigate('/')}>Cancel</Button>
                  <Button
                    danger
                    disabled={!formState.enabled}
                    loading={saving}
                    onClick={disableSubscription}
                  >
                    Unsubscribe
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    disabled={!isDirty}
                    onClick={saveSubscription}
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </Content>
    </Layout>
  )
}

export default SubscriptionSettings
