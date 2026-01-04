import axios from "axios";
import { ElMessage } from "element-plus";
import "element-plus/es/components/message/style/css";
import { useUserStore } from "@/stores/user";
import router from "@/router";
const httpInstance = axios.create({
  baseURL: "http://pcapi-xiaotuxian-front-devtest.itheima.net",
  timeout: 5000,
});

// axios请求拦截器
httpInstance.interceptors.request.use(
  (config) => {
    // 1. 从pinia中获取token
    const userStore = useUserStore();
    const token = userStore.userInfo.token;
    // 2. 添加到请求头中 格式为 Authorization: Bearer token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (e) => Promise.reject(e)
);
// axios响应拦截器
httpInstance.interceptors.response.use(
  (res) => res.data,
  (e) => {
    const userStore = useUserStore();
    ElMessage({
      type: "warning",
      message: e.response.data.message,
    });
    // 401 状态码 退出登录 跳转到登录页
    if (e.response.status === 401) {
      userStore.clearUserInfo();
      router.push("/login");
    }
    return Promise.reject(e);
  }
);
export default httpInstance;
