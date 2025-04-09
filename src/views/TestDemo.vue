<script setup>
import VirtualList from '@/components/VirtualList.vue';
import UploadFile from '../components/UploadFile.vue';
import { useLazyLoad } from '../hooks/useLazyLoad';
import { ref } from 'vue';

const longList = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    text: `列表项 ${i + 1}`
}))
const imgRef = ref([])
useLazyLoad(imgRef)
</script>
<template>
    <div class="container">
        <p>虚拟列表渲染</p>
        <VirtualList :items="longList" :item-height="50" class="Virtual-container" />
        <p>大文件上传</p>
        <UploadFile></UploadFile>
        <p>图片懒加载</p>
        <div class="imgLoad">
            <div v-for="(_, idx) in new Array(200).fill(11)" style="width: 100%; height: 500px;" class="imgData">
                <img :ref="el => imgRef[idx] = el" src="../assets/images/load.png" :data-src="`https://picsum.photos/200/${180 + idx}`" 
                     style="width: 500px; height: 500px;">
            </div>
        </div>

    </div>

</template>
<style>
.container {
    flex-direction: column;
}

.Virtual-container {
    background-color: #ffffffb4;
    margin-bottom: 20px;
}

p {
    text-align: center;
    font-size: 33px;
    margin: 20px 0;
}

.imgData {
    text-align: center;
}
</style>