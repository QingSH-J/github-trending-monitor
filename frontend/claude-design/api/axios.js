/**
 * Axios instance for the GitHub Trending Monitor app.
 *
 * - baseURL: http://localhost:8080
 * - Automatically attaches `Authorization: Bearer <token>` from localStorage
 * - Includes a small mock fallback so the prototype runs without a backend.
 *   Remove the MOCK BLOCK section when wiring up your real API.
 *
 * In a Vite/CRA project, you would import this as:
 *   import api from './api/axios';
 *
 * In this in-browser prototype it is exposed as `window.api`.
 */
(function () {
  const api = window.axios.create({
    baseURL: "http://localhost:8080",
    timeout: 8000,
  });

  // Attach JWT to every request
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ---------- MOCK BLOCK (remove when backend is live) ----------
  // Intercepts /api/auth/login and /api/auth/register and returns a fake JWT
  // so the prototype is fully clickable. Falls through to a real network call
  // if the request fails (you'll see a normal error toast).
  const mockHandlers = {
    "POST /api/auth/login": (data) => {
      if (!data?.email || !data?.password) {
        throw { response: { status: 400, data: { message: "Email and password are required" } } };
      }
      return {
        token: "mock.jwt." + btoa(data.email).replace(/=+$/, ""),
        username: data.email.split("@")[0],
        email: data.email,
      };
    },
    "POST /api/auth/register": (data) => {
      if (!data?.email || !data?.username || !data?.password) {
        throw { response: { status: 400, data: { message: "All fields are required" } } };
      }
      return {
        token: "mock.jwt." + btoa(data.email).replace(/=+$/, ""),
        username: data.username,
        email: data.email,
      };
    },
  };

  api.interceptors.request.use(async (config) => {
    const key = `${config.method?.toUpperCase()} ${config.url}`;
    if (mockHandlers[key]) {
      // Simulate network latency
      await new Promise((r) => setTimeout(r, 500));
      try {
        const data = mockHandlers[key](config.data);
        // Short-circuit the request by returning a resolved adapter
        config.adapter = () =>
          Promise.resolve({
            data,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
          });
      } catch (err) {
        config.adapter = () => Promise.reject(err);
      }
    }
    return config;
  });
  // ---------- END MOCK BLOCK ----------

  window.api = api;
})();
