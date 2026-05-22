/**
 * Home page — /
 * Protected. Navbar with app name, username, avatar, logout.
 * Main body is a placeholder for the trending dashboard.
 */
const HomePage = (() => {
  const { Layout, Avatar, Dropdown, Button, Typography, Space, Tag } = window.antd;
  const { Header, Content } = Layout;
  const { Title, Text, Paragraph } = Typography;
  const { useNavigate } = window.ReactRouterDOM;

  return function HomePage() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "user";
    const email = localStorage.getItem("email") || "";

    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      navigate("/login", { replace: true });
    };

    const initial = username.slice(0, 1).toUpperCase();

    const menuItems = [
      { key: "profile", label: (<div><div style={{ fontWeight: 600 }}>{username}</div>{email && <Text type="secondary" style={{ fontSize: 12 }}>{email}</Text>}</div>), disabled: true },
      { type: "divider" },
      { key: "logout", label: "Sign out", onClick: handleLogout },
    ];

    return (
      <Layout style={{ minHeight: "100vh", background: "#fff" }}>
        <Header style={homeStyles.header}>
          <div style={homeStyles.brand}>
            <svg height="28" viewBox="0 0 16 16" width="28" fill="#fff">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            <span style={homeStyles.brandText}>Trending Monitor</span>
          </div>
          <Space size="middle">
            <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={["click"]}>
              <div style={homeStyles.userTrigger}>
                <Avatar size={28} style={{ background: "#0969da", verticalAlign: "middle" }}>{initial}</Avatar>
                <span style={{ color: "#fff", fontSize: 14 }}>{username}</span>
              </div>
            </Dropdown>
            <Button ghost onClick={handleLogout} style={{ borderColor: "#444c56", color: "#fff" }}>
              Logout
            </Button>
          </Space>
        </Header>

        <Content style={homeStyles.content}>
          <div style={homeStyles.placeholder}>
            <Tag color="processing" style={{ marginBottom: 16 }}>Coming soon</Tag>
            <Title level={2} style={{ marginTop: 0 }}>GitHub Trending Dashboard</Title>
            <Paragraph type="secondary" style={{ fontSize: 16, maxWidth: 520, textAlign: "center" }}>
              We'll show you the repositories climbing the GitHub trending list,
              broken down by language and time window, with alerts when something
              you care about takes off.
            </Paragraph>

            <div style={homeStyles.skeletonGrid}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={homeStyles.skeletonCard}>
                  <div style={{ ...homeStyles.skelLine, width: "60%" }} />
                  <div style={{ ...homeStyles.skelLine, width: "90%" }} />
                  <div style={{ ...homeStyles.skelLine, width: "40%", marginTop: "auto" }} />
                </div>
              ))}
            </div>
          </div>
        </Content>
      </Layout>
    );
  };
})();

const homeStyles = {
  header: {
    background: "#24292e",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    height: 64,
    borderBottom: "1px solid #1b1f23",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  brandText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: 0.2,
  },
  userTrigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    padding: "4px 10px",
    borderRadius: 6,
    background: "rgba(255,255,255,0.06)",
  },
  content: {
    background: "#fff",
    padding: "48px 24px",
  },
  placeholder: {
    maxWidth: 1080,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  skeletonGrid: {
    marginTop: 40,
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  },
  skeletonCard: {
    background: "#f6f8fa",
    border: "1px solid #d0d7de",
    borderRadius: 8,
    height: 140,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  skelLine: {
    height: 10,
    borderRadius: 4,
    background: "linear-gradient(90deg, #e1e4e8 0%, #f1f3f5 50%, #e1e4e8 100%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.6s linear infinite",
  },
};

window.HomePage = HomePage;
