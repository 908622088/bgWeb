<script setup>
import CommonAside from '@/components/CommonAside.vue'
import CommonHeader from '@/components/CommonHeader.vue'
import CommonTab from '@/components/CommonTab.vue'
</script>

<template>
    <div class="common-layout">
        <el-container class="lay-container">
            <!-- 自定义左侧组件 -->
            <common-aside />
            <!-- 右侧 -->
            <el-container>
                <el-header class="header">
                    <common-header />
                </el-header>
                <common-tab></common-tab>
                <el-main class="right-main">
                    <router-view />
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<style scoped lang="less">
   .lay-container{
      height:100%;
      display: flex;
   }
   .common-layout{
    height: 100vh;
    overflow: hidden;
   }
   .el-header{
      background-color:#333;
   }
   .right-main {
      height: calc(100vh - 60px);
      overflow: auto;
   }
</style>
