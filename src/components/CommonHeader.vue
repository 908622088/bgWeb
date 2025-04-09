<template>
    <div class="header">
        <!-- 左侧内容 -->
        <div class="l-content">
            <!-- 折叠功能 -->
            <el-button size="small" @click="handleCollapse">
                <component class="icons" is="menu"></component>
            </el-button>
            <!-- 面包屑 -->
            <el-breadcrumb separator="/" class="bread">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-if="current" :to="current.path">{{ current.label }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <!-- 右侧内容 -->
        <div class="r-content">
            <!-- 用户头像下拉 -->
            <el-dropdown>
                <span class="el-dropdown-link">
                    <img :src="userAvatar" class="user" />
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="handleToUserProfile">个人中心</el-dropdown-item>
                        <el-dropdown-item @click="handleLoginOut">退出</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAllDataStore } from '@/stores';
import router from '../router';

// 从IndexedDB读取数据的辅助函数
const getFromIndexedDB = (key) => {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            return resolve(null);
        }
        
        const request = indexedDB.open('userProfileDB', 1);
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('userData')) {
                db.createObjectStore('userData', { keyPath: 'key' });
            }
        };
        
        request.onsuccess = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('userData')) {
                db.close();
                return resolve(null);
            }
            
            const transaction = db.transaction(['userData'], 'readonly');
            const store = transaction.objectStore('userData');
            const storeRequest = store.get(key);
            
            storeRequest.onsuccess = () => {
                if (storeRequest.result) {
                    resolve(storeRequest.result.value);
                } else {
                    resolve(null);
                }
            };
            
            storeRequest.onerror = () => {
                console.error('从IndexedDB读取失败');
                resolve(null);
            };
            
            transaction.oncomplete = () => db.close();
        };
        
        request.onerror = () => {
            console.error('打开IndexedDB失败');
            resolve(null);
        };
    });
};

const getImageUrl = (user) => {
    return new URL(`../assets/images/${user}.png`, import.meta.url).href
}

const store = useAllDataStore();
const avatarFromIndexedDB = ref('');

// 计算用户头像，优先使用自定义头像，没有则使用默认头像
const userAvatar = computed(() => {
    return store.state.userData?.avatar || avatarFromIndexedDB.value || getImageUrl('user');
});

onMounted(async () => {
    if (!store.state.userData?.avatar) {
        try {
            // 尝试从IndexedDB获取头像
            const userData = await getFromIndexedDB('userData');
            if (userData?.avatar) {
                avatarFromIndexedDB.value = userData.avatar;
                console.log('头部组件从IndexedDB获取到头像:', userData.avatar);
            }
        } catch (error) {
            console.error('头部组件读取头像失败:', error);
        }
    }
});

const handleCollapse = () => {
    store.state.isCollapse = !store.state.isCollapse
}
const handleToUserProfile = () => {
    // 跳转到个人中心
    router.push('/userProfile')
    // 创建个人中心菜单项，用于标签页显示
    const profileMenu = {
        name: 'userProfile',
        path: '/userProfile',
        label: '个人中心',
        url: 'UserProfile'
    }
    // 更新选中的菜单，将个人中心添加到标签页
    store.selectMenu(profileMenu)
}
const handleLoginOut = () => {
    store.clean()
    router.push('/login')
}
const current = computed(() => store.state.currentMenu)
</script>
<style scoped lang="less">
.icons {
    width: 20px;
    height: 20px;
}
.header {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #333;
    // padding: 10px 0;
    .l-content {
        display: flex;
        align-items: center;
        .el-button {
            margin-right: 20px;
        }
    }
    .r-content {
        display: flex;
        justify-content: center;
        align-items: center;
        .user {
            width: 40px;
            height: 40px;
            border-radius: 50%
        }
    }
}
:deep(.bread span) {
    cursor: pointer !important;
    color: #fff !important; 
}
</style>