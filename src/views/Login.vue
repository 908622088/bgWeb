<script setup>
import { getCurrentInstance, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAllDataStore } from '@/stores'
import { ElMessage } from 'element-plus';

const router = useRouter();
const { proxy } = getCurrentInstance();
const store = useAllDataStore();
const loginForm = reactive({
    username:'',
    password:''
})
const handleLogin = async (loginForm) => {
    const res = await proxy.$api.getMenu(loginForm)
    console.log(res)
    // 保存用户信息
    store.state.userData = res.userData
    // 根据用户身份信息跳转到对应管理页面
    store.updateMenuList(res.menuList)
    // 使用统一的方法管理token
    store.setTokens(res.token, res.refreshToken, res.expiresIn)
    // 添加动态路由
    store.addMenu(router)
    // 跳转到首页
    router.push('/home')
    ElMessage.success('登录成功')
}
</script>
<template>
    <div class="body-login">
        <el-form :model="loginForm" class="login-container">
            <h1>欢迎登陆</h1>
            <el-form-item>
                <el-input type="input" placeholder="请输入用户名" v-model="loginForm.username"></el-input>
            </el-form-item>
            <el-form-item>
                <el-input type="password" placeholder="请输入密码" v-model="loginForm.password"></el-input>

            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleLogin(loginForm)">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<style lang="less" scoped>
.body-login {
    width: 100%;
    height: 100vh;
    background-image: url(../assets/images/bg.png);
    background-size:100%;
    overflow: hidden;
}
.login-container {
    width: 450px;
    background-color: #ffffffac;
    margin: 350px auto;
    border-radius: 15px;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #eaeaea;
    padding: 35px 35px 10px 35px;
    h1 {
        margin-bottom: 20px;
        text-align: center;
    }
    :deep(.el-form-item__content) {
        justify-content: center;
    }
}
</style>
