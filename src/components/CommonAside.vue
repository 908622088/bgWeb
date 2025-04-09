<template>
    <el-aside :width="width">
        <el-menu
            background-color="#555c63"
            text-color="#fff"
            :collapse="isCollapse"
            :collapse-transition="false"
         >
            <h3 v-show="!isCollapse">通用后台管理</h3>
            <h3 v-show="isCollapse">后台</h3>            
            <!-- 遍历一级目录 -->
            <el-menu-item
                v-for="item in noChildren"
                :index="item.path"
                :key="item.path"
                @click="handleMenu(item)"
            >
                <component class="icons" :is="item.icon"></component>
                <span>{{ item.label }}</span>
            </el-menu-item>
            <!-- 遍历有二级目录菜单 -->
            <el-sub-menu 
                v-for="item in hasChildren" 
                :index="item.path" 
                :key="item.path"
            >
                <template #title>
                    <component class="icons" :is="item.icon"></component>
                    <span>{{ item.label }}</span>
                </template>
                <!-- 二级目录 -->
                <el-menu-item-group>
                    <el-menu-item 
                        v-for="(subItem,subIndex) in item.children"
                        :index="subItem.path"
                        :key="subItem.path"
                        @click="handleMenu(subItem)"
                        >
                        <component class="icons" :is="subItem.icon"></component>
                        <span>{{ subItem.label }}</span>
                    </el-menu-item>
                </el-menu-item-group>
            </el-sub-menu>
        </el-menu>
    </el-aside>
</template>
<script setup>
import { ref, computed } from 'vue';
import { useAllDataStore } from '@/stores'
import { useRoute, useRouter } from 'vue-router';
const store = useAllDataStore()
const route = useRoute();
const router = useRouter();
const list = computed(() => store.state.menuList)
const hasChildren = computed(() => list.value.filter(item => item.children))
const noChildren = computed(() => list.value.filter(item => !item.children))
const isCollapse = computed(() => store.state.isCollapse)
const width = computed(() => store.state.isCollapse ? '64px':'180px' )
const handleMenu = (item) => {
    router.push(item.name)
    store.selectMenu(item)
}
</script>
<style scoped lang="less">
.icons {
    width: 18px;
    height: 18px;
    margin-right: 5px;
}
.el-aside {
    background-color: #555c63;
    height: 100%;
    transition: width 0.3s ease;
    position: sticky;
    top: 0;
    left: 0;
    z-index: 999;
    flex-shrink: 0;
    overflow: auto;
}
.el-menu {
    border: none;
    overflow: auto;
    transition: width 0.3s ease;
    height: 100%;
    h3 {
        text-align: center;
        color: #fff;
        line-height: 48px;
    }
}
</style>
