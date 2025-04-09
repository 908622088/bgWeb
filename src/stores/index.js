import { defineStore } from 'pinia'
import { ref, watch } from 'vue';

// 从localStorage加载初始状态
function getStoredState() {
    const storedData = JSON.parse(localStorage.getItem('store'));
    return storedData || initState();
}

function initState() {
    return {
        isCollapse: false,
        // 存储当前tags
        tags: [
            {
                name: 'home',
                path: '/home',
                label: '首页',
                icon: 'home'
            }
        ],
        currentMenu: '',
        menuList: [],
        token: '',
        refreshToken: '',
        routerList: [],
        userData: {}
    }
}

export const useAllDataStore = defineStore('allData', () => {
    // ref state属性
    const state = ref(getStoredState());

    //当 state 中任何数据变化时（如用户登录、权限更新），自动将整个应用状态保存到localStorage
    watch(state, (newObj) => {
        if (!newObj.token) return;
        // 持久化存储
        localStorage.setItem("store", JSON.stringify(newObj))
    }, { deep: true })

    // 统一管理token
    const setTokens = (accessToken, refreshToken, expiresIn) => {
        // 保存到store状态
        state.value.token = accessToken;
        state.value.refreshToken = refreshToken;
        // 单独保存token到localStorage
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        // 保存token过期时间
        if (expiresIn) {
            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
            localStorage.setItem('tokenInfo', JSON.stringify({
                expiresAt: expiresAt.toISOString()
            }));
        }
    };

    // 清除token的方法
    const clearTokens = () => {
        state.value.token = '';
        state.value.refreshToken = '';
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tokenInfo");
    };

    // 更新菜单选中状态
    const selectMenu = (val) => {
        if (val.name === 'home') {
            state.value.currentMenu = null
        } else {
            state.value.currentMenu = val
            // 检查要跳转的菜单是否已存在于 tags 中
            let index = state.value.tags.findIndex((item) => item.name === val.name)
            // 如果不存在（新页面），则添加到 tags 数组
            index === -1 ? state.value.tags.push(val) : "";
        }
    }

    // 移除标签
    const updateTags = (tag) => {
        let index = state.value.tags.findIndex((item) => item.name === tag.name)
        state.value.tags.splice(index, 1)
    }

    // 更新用户菜单
    const updateMenuList = (val) => {
        state.value.menuList = val
    }

    const addMenu = (router, type) => {
        // 刷新页面时
        if (type === "refresh") {
            // 从持久化存储恢复状态 
            const storedData = JSON.parse(localStorage.getItem("store")) // 获取本地存储数据
            if (storedData) {
                state.value = storedData;
                state.value.routerList = [];
            }
            else return; // 无存储数据
        }
        // 获取菜单数据
        const menu = state.value.menuList;
        // 动态导入所有Vue组件文件（懒加载）
        // 生成类似 { '../views/a.vue': () => import('../views/a.vue'), ... } 的对象
        const module = import.meta.glob("../views/**/*.vue");
        const routerArr = [];
        // 遍历菜单数据
        menu.forEach((item) => {
            if (item.children) {
                // 处理有子菜单的情况
                item.children.forEach((val) => {
                    // 构建组件路径（如：../views/user/index.vue）
                    let url = `../views/${val.url}.vue`;
                    // 将动态导入函数赋值给组件
                    val.component = module[url];
                    // 将子菜单项加入路由数组（注意：这里会重复添加）
                    routerArr.push(...item.children);
                });
            } else {
                // 处理没有子菜单的情况
                let url = `../views/${item.url}.vue`;
                item.component = module[url];
                routerArr.push(item);
            }
        });
        // 清理旧路由
        state.value.routerList = [];    // 清空状态中的路由列表
        let routers = router.getRoutes()  // 获取当前所有路由
        routers.forEach((item) => {
            if (item.name === 'main' || item.name === 'login' || item.name === '404') return
            else {
                router.removeRoute(item.name) // 移除其他所有路由
            }
        })
        // 添加新路由
        if (state.value.token) {
            state.value.routerList.push(router.addRoute("main", {
                path: '/userProfile',
                name: 'userProfile',
                component: () => import('@/views/UserProfile.vue')
            }))
        }
        routerArr.forEach((item) => {
            // 添加到名为"main"的路由下，并保存到状态管理
            state.value.routerList.push(router.addRoute("main", item));
        })
    }

    // 退出登录清理登录数据
    const clean = () => {
        // 清理动态路由：返回romoveRoute (router.addRoute() 返回的是一个移除该路由的函数)
        state.value.routerList.forEach((item) => {
            if (item) item();
        })
        state.value = initState();
        // 清理token
        clearTokens();
        // 清理本地缓存
        localStorage.removeItem("store")
    }

    return {
        state,
        setTokens,
        clearTokens,
        selectMenu,
        updateTags,
        updateMenuList,
        addMenu,
        clean
    };
})