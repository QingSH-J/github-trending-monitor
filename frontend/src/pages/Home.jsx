import {
  Alert,
  App,
  Avatar,
  Button,
  Dropdown,
  Empty,
  Layout,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  BookOutlined,
  BranchesOutlined,
  ClockCircleOutlined,
  FireOutlined,
  GithubOutlined,
  LogoutOutlined,
  ReloadOutlined,
  SettingOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { getRepoParts } from '../utils/readmeLinks.js'

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
  const [activeView, setActiveView] = useState('trending')
  const [repositories, setRepositories] = useState([])
  const [favoriteRepos, setFavoriteRepos] = useState(new Set())
  const [pendingFavorites, setPendingFavorites] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const requestParams = useMemo(
    () => ({
      since: range,
      language,
    }),
    [language, range],
  )

  const loadFavorites = useCallback(
    async ({ signal } = {}) => {
      setFavoritesLoading(true)

      try {
        const { data } = await api.get('/api/favorites', { signal })
        const repoNames = Array.isArray(data) ? data.map((favorite) => favorite.repoName) : []
        setFavoriteRepos(new Set(repoNames.filter(Boolean)))
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return
        }

        message.warning('Unable to load favorites')
      } finally {
        setFavoritesLoading(false)
      }
    },
    [message],
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
      loadFavorites({ signal: controller.signal })
    }, 0)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [loadFavorites, loadTrending])

  const metrics = useMemo(() => {
    const totalStarsToday = repositories.reduce((sum, repo) => sum + (repo.starsToday || 0), 0)
    const latestScrapedAt = repositories
      .map((repo) => repo.scrapedAt)
      .filter(Boolean)
      .sort()
      .at(-1)

    return {
      latestScrapedAt,
      totalStarsToday,
      trackedRepos: repositories.length,
    }
  }, [repositories])

  const visibleRepos = useMemo(() => {
    if (activeView === 'favorites') {
      return repositories.filter((repo) => favoriteRepos.has(repo.repoName))
    }

    return repositories
  }, [activeView, favoriteRepos, repositories])

  const toggleFavorite = async (repoName) => {
    const isFavorited = favoriteRepos.has(repoName)

    setPendingFavorites((current) => new Set(current).add(repoName))
    setFavoriteRepos((current) => {
      const next = new Set(current)
      if (isFavorited) {
        next.delete(repoName)
      } else {
        next.add(repoName)
      }
      return next
    })

    try {
      if (isFavorited) {
        await api.delete('/api/favorites', { params: { repoName } })
        message.success('Removed from favorites')
      } else {
        await api.post('/api/favorites', { repoName })
        message.success('Added to favorites')
      }
    } catch (err) {
      setFavoriteRepos((current) => {
        const next = new Set(current)
        if (isFavorited) {
          next.add(repoName)
        } else {
          next.delete(repoName)
        }
        return next
      })

      message.error(err.response?.data?.error || 'Favorite update failed')
    } finally {
      setPendingFavorites((current) => {
        const next = new Set(current)
        next.delete(repoName)
        return next
      })
    }
  }

  const openRepoDetail = (repo) => {
    const repoParts = getRepoParts(repo.repoName)

    if (!repoParts) {
      message.error('Invalid repository name')
      return
    }

    navigate(`/repos/${encodeURIComponent(repoParts.owner)}/${encodeURIComponent(repoParts.repo)}`, {
      state: { repo },
    })
  }

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
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: () => navigate('/settings/subscriptions'),
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
    <Layout className="app-shell github-shell">
      <Header className="topbar github-topbar">
        <div className="brand">
          <span className="brand-mark">
            <GithubOutlined />
          </span>
          <span className="brand-name">Repo Radar</span>
        </div>

        <Space size="middle">
          <Button ghost icon={<SettingOutlined />} onClick={() => navigate('/settings/subscriptions')}>
            Settings
          </Button>
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

      <Content className="github-main">
        <section className="github-repo-header">
          <div className="repo-title-line">
            <GithubOutlined />
            <Title level={1}>qingshiyuu / repo-radar</Title>
            <Tag>Public</Tag>
          </div>

          <Paragraph>
            GitHub Trending repositories, cached by the backend scheduler and saved to your personal
            favorites.
          </Paragraph>
        </section>

        <nav className="github-tabs">
          <button
            className={activeView === 'trending' ? 'active' : ''}
            type="button"
            onClick={() => setActiveView('trending')}
          >
            <FireOutlined />
            Trending
            <span>{metrics.trackedRepos}</span>
          </button>
          <button
            className={activeView === 'favorites' ? 'active' : ''}
            type="button"
            onClick={() => setActiveView('favorites')}
          >
            <StarFilled />
            Favorites
            <span>{favoriteRepos.size}</span>
          </button>
        </nav>

        <section className="github-panel">
          <div className="github-toolbar">
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

            <div className="sync-bar">
              <span>
                <ClockCircleOutlined />
                Last sync: {formatScrapedAt(metrics.latestScrapedAt)}
              </span>
              <span>{fullNumber(metrics.totalStarsToday)} stars gained</span>
            </div>
          </div>

          {error && <Alert className="dashboard-alert" type="error" title={error} showIcon />}

          <div className="repo-list">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div className="repo-row" key={`loading-${index}`}>
                    <Skeleton active paragraph={{ rows: 2 }} title={{ width: '55%' }} />
                  </div>
                ))
              : visibleRepos.map((repo) => {
                  const isFavorited = favoriteRepos.has(repo.repoName)
                  const isPending = pendingFavorites.has(repo.repoName)

                  return (
                    <article className="repo-row" key={repo.id || repo.repoName}>
                      <div className="repo-row-main">
                        <div className="repo-name-line">
                          <a
                            href={`https://github.com/${repo.repoName}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {repo.repoName}
                          </a>
                          <Tag>Public</Tag>
                        </div>

                        <Paragraph type="secondary">
                          {repo.description || 'No description provided.'}
                        </Paragraph>

                        <div className="repo-meta">
                          <span>
                            <span
                              className={`language-dot ${
                                languageToneMap[repo.language] || 'gray'
                              }`}
                            />
                            {repo.language || 'Unknown'}
                          </span>
                          <span>
                            <StarOutlined />
                            {compactNumber(repo.stars)}
                          </span>
                          <span>
                            <BranchesOutlined />
                            {compactNumber(repo.forks)}
                          </span>
                          <span className="stars-today">+{fullNumber(repo.starsToday)} today</span>
                        </div>
                      </div>

                      <div className="repo-actions">
                        <Button icon={<BookOutlined />} onClick={() => openRepoDetail(repo)}>
                          README
                        </Button>
                        <Button
                          icon={isFavorited ? <StarFilled /> : <StarOutlined />}
                          loading={isPending}
                          onClick={() => toggleFavorite(repo.repoName)}
                        >
                          {isFavorited ? 'Starred' : 'Star'}
                        </Button>
                      </div>
                    </article>
                  )
                })}
          </div>

          {!loading && !error && visibleRepos.length === 0 && (
            <Empty
              className="repo-empty"
              description={
                activeView === 'favorites'
                  ? 'No favorites in the current trending set'
                  : 'No trending repositories found'
              }
            />
          )}

          {favoritesLoading && <div className="favorites-loading">Syncing favorites...</div>}
        </section>
      </Content>
    </Layout>
  )
}

export default Home
