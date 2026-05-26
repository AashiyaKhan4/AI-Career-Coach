import axios from "axios";

const API = axios.create({ baseURL: "/api", withCredentials: true });

API.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("accessToken");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

let refreshing = false;
let queue = [];

const flush = (err, token) => {
  queue.forEach((p) => (err ? p.reject(err) : p.resolve(token)));
  queue = [];
};

API.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config;
    if (
      err.response?.status === 401 &&
      err.response?.data?.code === "TOKEN_EXPIRED" &&
      !orig._retry
    ) {
      if (refreshing) {
        return new Promise((res, rej) => queue.push({ resolve: res, reject: rej })).then(
          (t) => { orig.headers.Authorization = `Bearer ${t}`; return API(orig); }
        );
      }
      orig._retry = true;
      refreshing = true;
      try {
        const { data } = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
        localStorage.setItem("accessToken", data.accessToken);
        flush(null, data.accessToken);
        orig.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(orig);
      } catch (e) {
        flush(e, null);
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default API;
