import axios from "axios";
import { ElMessage } from 'element-plus';
import config from "../config";
import { useAllDataStore } from '@/stores';
import router from "../router";

const service = axios.create({
    baseURL: config.baseApi,
});
const refreshService = axios.create({
    baseURL: config.baseApi
})
const NETWORK_ERROR = '网络错误...';
// 判断token是否过期
const isTokenExpired = () => {
    const tokenInfo = JSON.parse(localStorage.getItem("tokenInfo"))
    if (!tokenInfo.expiresAt) return false;
    const now = new Date().getTime();
    const expiresAt = new Date(tokenInfo.expiresAt).getTime();
    return now >= expiresAt
}
// 判断token是否快过期（还剩5秒）
const isTokenExpiring = () => {
    const tokenInfo = JSON.parse(localStorage.getItem("tokenInfo"))
    if (!tokenInfo.expiresAt) return false;
    const now = new Date().getTime();
    const expiresAt = new Date(tokenInfo.expiresAt).getTime();
    return (expiresAt - now) < 5000  //过期时间小于5s时刷新
}
// 刷新token
const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken")
        const res = await refreshService({
            url: '/auth/refresh',
            method: 'post',
            data: { refreshToken },
            baseURL: config.mockApi // 确保使用mock API
        })
        if (res.data && res.data.code === 200) {
            const { token, refreshToken: newRefreshToken, expiresIn } = res.data.data
            // 计算新的过期时间
            const expiresAt = new Date();
            // 设置毫秒数
            expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn)
            console.log('Token刷新成功，新token有效期至:', expiresAt.toLocaleTimeString())
            const store = useAllDataStore()
            store.setTokens(token, newRefreshToken, expiresIn)
            return token
        }
    }
    catch {
        const store = useAllDataStore();
        store.clearTokens()
        setTimeout(() => {
            ElMessage.error('登录已过期，即将跳转到登录页');
            router.push('/login');
        }, 1500)
    }

}
let waitRequests = []
let isRefreshing = false
// 添加请求拦截器
service.interceptors.request.use(async function (config) {
    // 获取token
    const token = localStorage.getItem("token")
     // 如果是刷新token的请求，不需要添加token和检查过期
     if (config.url && config.url.includes('/auth/refresh')) {
        return config;
    }
    if (token) {
        // token过期
        if (isTokenExpired()) {
            console.log('Token已过期，准备刷新');
            // 判断是否正在刷新
            if (!isRefreshing) {
                isRefreshing = true
                try {
                    const newToken = await refreshToken()
                    config.headers.Authorization = `Bearer ${newToken}`
                    // 执行等待队列的请求
                    waitRequests.forEach(callback => callback(newToken))
                }
                catch {
                    // 刷新失败，拒绝所有等待的请求
                    waitRequests.forEach(callback => callback(null));
                    waitRequests = [];
                    return Promise.reject(error);
                }
                finally {
                    waitRequests = []
                    isRefreshing = false
                }
            }
            else {
                // 如果已经有一个刷新token的请求，则将当前请求加入等待队列
                return new Promise((resolve) => {
                    waitRequests.push(newToken => {
                        if (newToken) {
                            config.headers.Authorization = `Bearer ${newToken}`
                            return resolve(config)
                        }
                        else {
                            // token刷新失败，拒绝请求
                            resolve(Promise.reject('刷新失败'));
                        }
                    })
                })

            }

        }
        // 检查token是否即将过期，如果是则在后台静默刷新
        else if (isTokenExpiring()) {
            console.log('Token即将过期，后台静默刷新');
            if (!isRefreshing) {
                isRefreshing = true
                refreshToken().finally(() => {
                    console.log('后台刷新token成功');
                    isRefreshing = false
                })
            }

        }
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
service.interceptors.response.use(
    (res) => {
        // 检查是否是文件上传相关的请求
        const isFileUploadRequest = res.config.url && 
            (res.config.url.includes('/upload/chunk') || 
             res.config.url.includes('/upload/merge') ||
             res.config.url.includes('/uploadAvatar'));
        
        // 文件上传请求特殊处理
        if (isFileUploadRequest) {
            console.log('检测到文件上传响应:', res.config.url);
            
            // 如果响应数据为空，返回默认成功响应
            if (!res.data) {
                console.log('文件上传响应数据为空，返回默认成功响应');
                return {
                    success: true,
                    message: '操作成功'
                };
            }
            
            return res.data;  // 直接返回整个数据对象
        }

        // 标准API响应处理
        // 检查响应数据是否存在
        if (!res.data) {
            console.error('响应数据为空', res);
            return Promise.reject(new Error('响应数据格式错误'));
        }

        const { code, data, msg } = res.data;
        if (code === 200) {
            return data;
        }
        // Token无效，尝试刷新
        else if (code === 401 || code === 403) {
            if (!isRefreshing) {
                isRefreshing = true
                refreshToken()
                    .then(() => {
                        console.log('401/403错误后刷新token成功');

                    })
                    .catch(() => {
                        // Token过期或无效
                        ElMessage.error(msg || '登录已过期，请重新登录');
                        // 清除store中的token
                        const store = useAllDataStore()
                        store.clearTokens()
                        // 跳转到登录页
                        setTimeout(() => {
                            router.push('/login')
                        }, 1500);

                    })
                    .finally(() => {
                        isRefreshing = false
                    })
            }


        } else {
            ElMessage.error(msg || NETWORK_ERROR);
            return Promise.reject(msg || NETWORK_ERROR);
        }
    },
    (error) => {
        console.error('请求错误:', error);
        if (error.response) {
            if (!isRefreshing) {
                isRefreshing = true;
                refreshToken()
                    .then(() => {
                        console.log('响应错误后刷新token成功');
                        // 可以选择重试失败的请求
                    })
                    .catch(() => {
                        // 刷新失败，跳转登录页
                        ElMessage.error('登录已过期，请重新登录');

                        // 使用store的clearTokens方法统一清除token
                        const store = useAllDataStore();
                        store.clearTokens();

                        setTimeout(() => {
                            router.push('/login')
                        }, 1500);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            }
        } else {
            ElMessage.error(NETWORK_ERROR);
        }
        return Promise.reject(error);
    }

    //apifox
    // return res.data;
);
// 封装一个通用的 request 函数，用于发起请求。
function request(options) {
    options.method = options.method || "get";
    //关于get请求参数的调整
    if (options.method.toLowerCase() === 'get') {
        options.params = options.data;
    }
    //对mock开关做处理
    let isMock = config.mock;
    if (typeof options.mock !== "undefined") {
        isMock = options.mock;
    }
    //针对环境做一个处理
    if (config.env === 'prod') {
        //不能用mock
        service.defaults.baseURL = config.baseApi;
    } else {
        service.defaults.baseURL = isMock ? config.mockApi : config.baseApi;
    }

    // 在Mock环境下处理onUploadProgress
    if (isMock && options.onUploadProgress) {
        // 在Mock环境下，直接忽略onUploadProgress，防止错误
        delete options.onUploadProgress;
        
        // 不要修改transformResponse，避免引起额外的问题
        // 原先的代码尝试处理transformResponse可能导致错误
    }

    return service(options);
}
export default request;