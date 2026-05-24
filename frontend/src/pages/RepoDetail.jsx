import {
  Alert,
  Avatar,
  Button,
  Empty,
  Layout,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  ArrowLeftOutlined,
  BookOutlined,
  BranchesOutlined,
  BulbOutlined,
  GithubOutlined,
  LogoutOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import remarkGfm from 'remark-gfm'
import api from '../api/axios.js'
import { resolveReadmeImage, resolveReadmeLink } from '../utils/readmeLinks.js'

const { Header, Content } = Layout
const { Paragraph, Title } = Typography

const compactNumber = (value) =>
  new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0)

const readmeSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a || []), 'target'],
    div: [...(defaultSchema.attributes?.div || []), 'align'],
    h1: [...(defaultSchema.attributes?.h1 || []), 'align'],
    h2: [...(defaultSchema.attributes?.h2 || []), 'align'],
    h3: [...(defaultSchema.attributes?.h3 || []), 'align'],
    img: [
      ...(defaultSchema.attributes?.img || []),
      'align',
      'height',
      'loading',
      'style',
      'width',
    ],
    p: [...(defaultSchema.attributes?.p || []), 'align'],
    span: [...(defaultSchema.attributes?.span || []), 'align'],
  },
}

const markdownRehypePlugins = [rehypeRaw, [rehypeSanitize, readmeSanitizeSchema]]

const createMarkdownComponents = (repoName) => ({
  a: ({ href, children, ...props }) => (
    <a
      {...props}
      href={resolveReadmeLink(href, repoName)}
      target={href?.startsWith('#') ? undefined : '_blank'}
      rel={href?.startsWith('#') ? undefined : 'noreferrer'}
    >
      {children}
    </a>
  ),
  img: ({ src, alt, ...props }) => (
    <img {...props} src={resolveReadmeImage(src, repoName)} alt={alt || ''} loading="lazy" />
  ),
})

function RepoDetail() {
  const { owner = '', repo = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'user'
  const repoName = `${decodeURIComponent(owner)}/${decodeURIComponent(repo)}`
  const repoMeta = location.state?.repo
  const markdownComponents = useMemo(() => createMarkdownComponents(repoName), [repoName])

  const [readme, setReadme] = useState('')
  const [summary, setSummary] = useState('')
  const [readmeLoading, setReadmeLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [readmeError, setReadmeError] = useState('')
  const [summaryError, setSummaryError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const encodedOwner = encodeURIComponent(decodeURIComponent(owner))
    const encodedRepo = encodeURIComponent(decodeURIComponent(repo))

    const loadReadme = async () => {
      setReadmeLoading(true)
      setReadme('')
      setReadmeError('')

      try {
        const { data } = await api.get(`/api/repos/${encodedOwner}/${encodedRepo}/readme`, {
          signal: controller.signal,
        })
        setReadme(data?.readme || '')
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return
        }

        setReadmeError(err.response?.data?.error || 'Unable to load README')
      } finally {
        setReadmeLoading(false)
      }
    }

    const loadSummary = async () => {
      setSummaryLoading(true)
      setSummary('')
      setSummaryError('')

      try {
        const { data } = await api.get(`/api/repos/${encodedOwner}/${encodedRepo}/summary`, {
          signal: controller.signal,
        })
        setSummary(data?.summary || '')
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return
        }

        setSummaryError('AI summary is not available yet')
      } finally {
        setSummaryLoading(false)
      }
    }

    loadReadme()
    loadSummary()

    return () => controller.abort()
  }, [owner, repo])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('email')
    navigate('/login', { replace: true })
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
          <button className="user-trigger" type="button">
            <Avatar size={28} className="user-avatar">
              {username.slice(0, 1).toUpperCase()}
            </Avatar>
            <span>{username}</span>
          </button>
          <Button ghost icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </Space>
      </Header>

      <Content className="github-main repo-detail-main">
        <section className="github-repo-header repo-detail-header">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            Back
          </Button>

          <div className="repo-title-line">
            <GithubOutlined />
            <Title level={1}>{repoName}</Title>
            <Tag>Public</Tag>
          </div>

          <Paragraph>{repoMeta?.description || 'Repository details from GitHub.'}</Paragraph>

          <div className="repo-meta repo-detail-meta">
            <span>
              <StarOutlined />
              {compactNumber(repoMeta?.stars)} stars
            </span>
            <span>
              <BranchesOutlined />
              {compactNumber(repoMeta?.forks)} forks
            </span>
            <span>{repoMeta?.language || 'Unknown language'}</span>
            <a href={`https://github.com/${repoName}`} target="_blank" rel="noreferrer">
              View on GitHub
            </a>
          </div>
        </section>

        <section className="ai-summary-panel">
          <div className="section-heading">
            <BulbOutlined />
            <Title level={2}>AI Summary</Title>
          </div>

          {summaryLoading && <Skeleton active paragraph={{ rows: 3 }} title={{ width: '35%' }} />}

          {!summaryLoading && summaryError && (
            <Alert type="warning" title={summaryError} showIcon />
          )}

          {!summaryLoading && !summaryError && summary && (
            <article className="summary-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={markdownRehypePlugins}
                components={markdownComponents}
              >
                {summary}
              </ReactMarkdown>
            </article>
          )}
        </section>

        <section className="readme-panel">
          <div className="section-heading">
            <BookOutlined />
            <Title level={2}>README</Title>
          </div>

          {readmeLoading && <Skeleton active paragraph={{ rows: 12 }} title={{ width: '45%' }} />}

          {!readmeLoading && readmeError && <Alert type="error" title={readmeError} showIcon />}

          {!readmeLoading && !readmeError && !readme && (
            <Empty description="README not found" />
          )}

          {!readmeLoading && !readmeError && readme && (
            <article className="readme-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={markdownRehypePlugins}
                components={markdownComponents}
              >
                {readme}
              </ReactMarkdown>
            </article>
          )}
        </section>
      </Content>
    </Layout>
  )
}

export default RepoDetail
