<script setup>
import { ElMessage } from 'element-plus';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router'
const router = useRouter()

onMounted(() => {
    ElMessage({
        type: 'warning',
        message: '三秒后自动跳转回上一个页面',
        duration: 3000,
    })
    setTimeout(() => {
        //go方法：按指定方向访问历史。如果是正数则是路由记录向前跳转，如果是负数则是向后回退
        //这里回退两个页面到跳转前的页面
        router.go(-2)
    }, 3000)
})
</script>
<template>
    <div class="exception">
        <img src="../assets/images/404.png" />
    </div>
</template>
<style lang="less">
.exception {
    position: relative;

    img {
        width: 100%;
        height: 100vh;
    }

}
</style>