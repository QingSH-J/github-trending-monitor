import {
  Alert,
  App,
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Layout,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import {
  BranchesOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  FireOutlined,
  GithubOutlined,
  LinkOutlined,
  LogoutOutlined,
  ReloadOutlined,
  RiseOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

const { Header, Content } = Layout
const { Paragraph, Text, Title } = Typography

const languageOptions = [
  { value: '', label: 'All languages' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'Python', label: 'Python' },
  { value: 'Java', label: 'Java' },
  { value: 'Go', label: 'Go' },
  { value: 'Rust', label: 'Rust' },
]

const rangeOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const languageToneMap = {
  JavaScript: 'yellow',
  TypeScript: 'blue',
  Python: 'green',
  Java: 'orange',
  Go: 'cyan',
  Rust: 'red',
}

const compactNumber = (value) =>
  new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0)

const fullNumber = (value) => new Intl.NumberFormat('en').format(value || 0)

const formatScrapedAt = (value) => {
  if (!value) {
    return 'Not synced yet'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function Home() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const username = localStorage.getItem('username') || 'user'
  const email = localStorage.getItem('email') || ''
  const [language, setLanguage] = useState('')
  const [range, setRange] = useState('daily')
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const requestParams = useMemo(
    () => ({
      since: range,
      language,
    }),
    [language, range],
  )

  const loadTrending = useCallback(
    async ({ refresh = false, signal } = {}) => {
      setError('')
      if (refresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      try {
        const endpoint = refresh ? '/api/trending/refresh' : '/api/trending'
        const { data } = await api.get(endpoint, {
          params: requestParams,
          signal,
        })
        setRepositories(Array.isArray(data) ? data : [])

        if (refresh) {
          message.success('Trending data refreshed')
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return
        }

        const fallback = 'Unable to load trending repositories'
        setError(err.response?.data?.error || err.message || fallback)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [message, requestParams],
  )

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      loadTrending({ signal: controller.signal })
    }, 0)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [loadTrending])

  const metrics = useMemo(() => {
    const totalStarsToday = repositories.reduce((sum, repo) => sum + (repo.starsToday || 0), 0)
    const averageGrowth =
      repositories.length === 0
        ? 0
        : repositories.reduce((sum, repo) => {
            const previousStars = Math.max((repo.stars || 0) - (repo.starsToday || 0), 1)
            return sum + ((repo.starsToday || 0) / previousStars) * 100
          }, 0) / repositories.length
    const latestScrapedAt = repositories
      .map((repo) => repo.scrapedAt)
      .filter(Boolean)
      .sort()
      .at(-1)

    return {
      averageGrowth,
      latestScrapedAt,
      totalStarsToday,
      trackedRepos: repositories.length,
    }
  }, [repositories])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('email')
    navigate('/login', { replace: true })
  }

  const menuItems = [
    {
      key: 'profile',
      label: (
        <div className="profile-menu">
          <strong>{username}</strong>
          {email && <Text type="secondary">{email}</Text>}
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Sign out',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <Layout className="app-shell">
      <Header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <GithubOutlined />
          </span>
          <span className="brand-name">Trending Monitor</span>
        </div>

        <Space size="middle">
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
            <button className="user-trigger" type="button">
              <Avatar size={28} className="user-avatar">
                {username.slice(0, 1).toUpperCase()}
              </Avatar>
              <span>{username}</span>
            </button>
          </Dropdown>
          <Button ghost icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </Space>
      </Header>

      <Content className="dashboard">
        <section className="dashboard-header">
          <div>
            <Tag color="processing" icon={<FireOutlined />}>
              Live watchlist
            </Tag>
            <Title>GitHub Trending Dashboard</Title>
            <Paragraph type="secondary">
              Repositories gaining attention across languages, ranked by recent star velocity.
            </Paragraph>
          </div>

          <div className="filters">
            <Select value={language} options={languageOptions} onChange={setLanguage} />
            <Select value={range} options={rangeOptions} onChange={setRange} />
            <Button
              icon={<ReloadOutlined />}
              loading={refreshing}
              onClick={() => loadTrending({ refresh: true })}
            >
              Refresh
            </Button>
          </div>
        </section>

        <Row gutter={[16, 16]} className="metric-row">
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Tracked repositories"
                value={metrics.trackedRepos}
                prefix={<GithubOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Recent stars"
                value={metrics.totalStarsToday}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Average growth"
                value={metrics.averageGrowth}
                precision={1}
                suffix="%"
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <div className="sync-bar">
          <span>
            <DatabaseOutlined />
            {language || 'All languages'}
          </span>
          <span>
            <ClockCircleOutlined />
            {range}
          </span>
          <span>Last sync: {formatScrapedAt(metrics.latestScrapedAt)}</span>
        </div>

        {error && <Alert className="dashboard-alert" type="error" message={error} showIcon />}

        <section className="repo-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Card className="repo-card" key={`loading-${index}`}>
                  <Skeleton active paragraph={{ rows: 4 }} title={{ width: '70%' }} />
                </Card>
              ))
            : repositories.map((repo) => (
                <Card className="repo-card" key={repo.id || repo.repoName}>
                  <div className="repo-card-header">
                    <span className={`language-dot ${languageToneMap[repo.language] || 'gray'}`} />
                    <Tag>{repo.language || 'Unknown'}</Tag>
                  </div>

                  <Title level={4}>
                    <a
                      href={`https://github.com/${repo.repoName}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {repo.repoName}
                      <LinkOutlined />
                    </a>
                  </Title>
                  <Paragraph type="secondary">
                    {repo.description || 'No description provided.'}
                  </Paragraph>

                  <div className="repo-stats">
                    <span>
                      <StarOutlined />
                      {compactNumber(repo.stars)}
                    </span>
                    <span>
                      <BranchesOutlined />
                      {compactNumber(repo.forks)}
                    </span>
                    <strong>+{fullNumber(repo.starsToday)}</strong>
                  </div>
                </Card>
              ))}
        </section>

        {!loading && !error && repositories.length === 0 && (
          <Empty className="repo-empty" description="No trending repositories found" />
        )}
      </Content>
    </Layout>
  )
}

export default Home
