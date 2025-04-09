<template>
    <div class="tags">
        <el-tag v-for="(tag, index) in tags" :key="tag.name" :closable="tag.name !== 'home' ? true : false"
            :effect="route.name === tag.name ? 'dark' : 'plain'" @click="hanleMenu(tag)"
            @close="handleClose(tag, index)">
            {{ tag.label }}
        </el-tag>
    </div>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useAllDataStore } from '@/stores'
import { computed } from 'vue';
const store = useAllDataStore();
const tags = computed(() => store.state.tags)
const route = useRoute();
const router = useRouter();
const hanleMenu = (tag) => {
    store.selectMenu(tag)
    router.push(tag.name)
}
const handleClose = (tag, index) => {
    // 移除标签
    store.updateTags(tag)
    // 如果关闭的页面不是当前页面,直接返回结束
    if (tag.name !== route.name) return
    // 如果关闭的是最后一个标签，就跳转到前一个
    if (index === store.state.tags.length) {
        // 更新菜单选中状态
        store.selectMenu(tags.value[index - 1])
        router.push(tags.value[index - 1].name)
    } else {
        // 否则跳转到下一个标签
        store.selectMenu(tags.value[index])
        router.push(tags.value[index].name)
    }
    // 没有标签时跳转到首页
    if(store.state.tags.length === 0){
        router.push('/home')
        return
    }

}
</script>
<style lang="less" scoped>
.tags {
    margin: 20px 0 0 20px;
}

.el-tag {
    margin-right: 10px;
    cursor: pointer;
}
</style>