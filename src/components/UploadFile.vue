<script setup>
import { ref, getCurrentInstance } from 'vue';
import { ElMessage } from 'element-plus';

const { proxy } = getCurrentInstance();
const file = ref(null);
const progress = ref(0);
const uploading = ref(false);
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB分片
const format = (percentage) => (percentage === 100 ? '完成' : `${percentage}%`);

const handleFileChange = (uploadFile) => {
  file.value = uploadFile.raw;
  progress.value = 0;
};
const uploadFile = async () => {
    if (!file.value) return
    uploading.value = true;
    try {
        // 生成文件唯一标识，用于识别分片所属文件
        const fileId = Date.now() + '-' + file.value.name;
        // 计算当前上传文件的分片数量
        const chunkCount = Math.ceil(file.value.size / CHUNK_SIZE)
        // 通过循环分片上传
        for (let i = 0; i < chunkCount; i++) {
            const start = i * CHUNK_SIZE
            const end = Math.min(start + CHUNK_SIZE, file.value.size)
            // 当前分片位置
            const chunk = file.value.slice(start, end)
            const formData = new FormData();
            formData.append('file', chunk);
            formData.append('filename', file.value.name);
            formData.append('fileId', fileId);
            formData.append('chunkCount', chunkCount);
            formData.append('chunkIndex', i);
            formData.append('fileSize', file.value.size);
            // 上传
            const res = await proxy.$api.uploadFileChunk(formData)
            console.log(res)
            // 更新进度
            progress.value = Math.round(((i + 1) / chunkCount) * 100)

        }
        // 所有分片上传完成，请求合并分片
        const mergeResponse = await proxy.$api.mergeFileChunks({
            filename: file.value.name,
            fileId: fileId,
            chunkCount: chunkCount,
            fileSize: file.value.size
        });
        ElMessage.success('文件上传成功')
        progress.value = 100
        return mergeResponse
    }
    catch {
        ElMessage.error("文件上传失败")
        progress.value = 0
    }
    finally {
        uploading.value = false
    }



}
</script>
<template>
    <div class="upload-container">
        <div class="upload">
            <el-upload class="upload-demo" drag :auto-upload="false" :on-change="handleFileChange" :show-file-list="true"
            :disabled="uploading">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
                <div class="el-upload__tip">
                    支持大文件上传(自动分片)
                </div>
            </template>
        </el-upload>

        <el-button type="primary" :disabled="!file || uploading" :loading="uploading" @click="uploadFile"
            style="margin-top: 20px;">
            {{ uploading ? `上传中 (${progress}%)` : '开始上传' }}
        </el-button>

        <el-progress v-if="progress > 0" :percentage="progress" :format="format"
            :status="progress === 100 ? 'success' : ''" style="margin-top: 20px;" />
        </div>
    </div>
</template>
<style lang="less" scoped>
.upload-container {
    margin-top: 20px;
    flex-direction: column;
    align-items: center;
}
.upload {
    margin: 0 300px;
    position: relative;
    text-align: center;
}
.el-upload__tip {
    display: flex;
}
.el-button {
    height: 30px;
    width: 150px;
}

.progress .el-progress--line {
    margin-bottom: 15px;
    width: 300px;
}
</style>