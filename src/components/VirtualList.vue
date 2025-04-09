<template>
    <!-- 外部容器，设置固定高度和滚动 -->
    <div class="virtual-list" @scroll="handleScroll" ref="container">
        <!-- 空白div撑开滚动条高度（总高度 = 项目数 × 每个项目高度） -->
        <div class="scroll-holder" :style="{ height: totalHeight + 'px' }"></div>

        <!-- 实际渲染的内容区域，通过transform调整位置 -->
        <div class="content" :style="{ transform: `translateY(${offset}px)` }">
            <div v-for="item in visibleItems" :key="item.id" class="item">
                {{ item.text }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [] // 关键修复
  },
  itemHeight: {
    type: Number,
    default: 50
  }
})

const container = ref(null)
const scrollTop = ref(0) // 当前滚动位置
const containerHeight = ref(0) // 容器可视高度

// 计算总高度（所有项目撑开的高度）
const totalHeight = computed(() => props.items.length * props.itemHeight)

// 计算当前应该显示哪些项目
const visibleItems = computed(() => {
  // 计算开始索引（滚动位置/项目高度） floor向下取整
  const startIndex = Math.floor(scrollTop.value / props.itemHeight)
  // 计算能显示多少个项目（容器高度/项目高度） ceil向上取整
  const visibleCount = Math.ceil(containerHeight.value / props.itemHeight)
  // 返回需要显示的项目切片（endIndex）
  return props.items.slice(startIndex, startIndex + visibleCount + 5) // +5是缓冲项
})

// 计算内容偏移量（让显示的项目出现在正确位置）
const offset = computed(() => {
  const startIndex = Math.floor(scrollTop.value / props.itemHeight)
  return startIndex * props.itemHeight
})

// 处理滚动事件
const handleScroll = () => {
  scrollTop.value = container.value.scrollTop
}

// 初始化时获取容器高度
onMounted(() => {
    // clientHeight : DOM 元素的可见高度
  containerHeight.value = container.value.clientHeight
})
</script>


<style>
.virtual-list {
    height: 500px;
    /* 固定高度 */
    overflow-y: auto;
    /* 允许滚动 */
    position: relative;
    /* 定位上下文 */
}

.scroll-holder {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    /* 高度由计算属性动态设置 */
}

.content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    /* transform由计算属性动态设置 */
}

.item {
    height: 50px;
    line-height: 50px;
    /* 每个项目固定高度 */
    border-bottom: 1px solid #eee;
}
</style>

  