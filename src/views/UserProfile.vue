<script setup>
import { ref, reactive, onMounted, getCurrentInstance, onUnmounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useAllDataStore } from '../stores';
const store = useAllDataStore();
const { proxy } = getCurrentInstance();
const router = useRouter();

// 用户信息
const userInfo = reactive({
    username: store.state.userData.username,
    realname: store.state.userData.status,
    avatar: store.state.userData.avatar || new URL(`../assets/images/user.png`, import.meta.url).href,
    phone: store.state.userData.phone,
    email: store.state.userData.email,
    position: store.state.userData.status
});

// 编辑状态控制
const isEditing = ref(false);
const startEditing = () => {
    isEditing.value = true;
    // 保存原始数据，用于取消时恢复
    Object.assign(originalUserInfo, userInfo);
};

const originalUserInfo = reactive({});

const cancelEditing = () => {
    isEditing.value = false;
    // 恢复原始数据
    Object.assign(userInfo, originalUserInfo);
};

const saveUserInfo = async () => {
    try {
        // 调用API保存用户信息
        await proxy.$api.updateUserProfile(userInfo);
        ElMessage({
            type: 'success',
            message: '个人信息保存成功',
            showClose: true
        });
        isEditing.value = false;
    } catch (error) {
        ElMessage({
            type: 'error',
            message: '保存失败，请稍后再试',
            showClose: true
        });
    }
};

// 头像上传相关变量
const avatarInput = ref(null);
const avatarDialogVisible = ref(false);
const avatarPreview = ref('');
const uploading = ref(false);
const selectedFile = ref(null);

// 修改头像
const handleChangeAvatar = () => {
    // 触发文件选择框点击
    avatarInput.value.click();
};

// 当文件被选择时
const onAvatarSelected = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        ElMessage({
            type: 'error',
            message: '请选择JPEG、PNG、GIF、SVG或WebP格式的图片',
            showClose: true
        });
        return;
    }
    // 验证文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
        ElMessage({
            type: 'error',
            message: '图片大小不能超过2MB',
            showClose: true
        });
        return;
    }
    selectedFile.value = file;
    // 创建预览 - 使用URL.createObjectURL更高效
    avatarPreview.value = URL.createObjectURL(file);
    avatarDialogVisible.value = true;
    console.log('预览头像图片:', file.name);
};

// 上传头像
const uploadAvatar = async () => {
    if (!selectedFile.value) {
        ElMessage({
            type: 'warning',
            message: '请先选择图片',
            showClose: true
        });
        return;
    }

    try {
        uploading.value = true;

        let avatarUrl = '';
        let message = '';

        if (import.meta.env.MODE === 'production') {
            // 生产环境：上传到服务器
            const formData = new FormData();
            formData.append('avatar', selectedFile.value);

            const res = await proxy.$api.uploadAvatar(formData);
            console.log('上传API响应:', res);

            if (!res || !res.avatarUrl) {
                throw new Error('上传响应数据格式错误');
            }

            avatarUrl = res.avatarUrl;
            message = res.message || '头像上传成功';
        } else {
            // 开发环境：直接使用本地文件的Data URL
            avatarUrl = await readFileAsDataURL(selectedFile.value);
            message = '头像已更新';
            console.log('使用本地文件作为头像');
        }
        // 更新用户头像
        userInfo.avatar = avatarUrl;
        store.state.userData.avatar = avatarUrl;

        ElMessage({
            type: 'success',
            message: message,
            showClose: true
        });

        // 清理
        avatarDialogVisible.value = false;
        if (avatarPreview.value && avatarPreview.value.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview.value);
        }
        avatarPreview.value = '';
        selectedFile.value = null;
    } catch (error) {
        console.error('头像上传失败:', error);
        ElMessage({
            type: 'error',
            message: error.message || '头像上传失败，请稍后再试',
            showClose: true
        });
    } finally {
        uploading.value = false;
    }
};

// 将文件转换为Data URL
const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('读取文件失败'));
        reader.readAsDataURL(file);
    });
};


// 修改密码相关
const passwordDialogVisible = ref(false);
const passwordFormRef = ref(null);
const passwordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const validateConfirmPassword = (rule, value, callback) => {
    if (value !== passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'));
    } else {
        callback();
    }
};

const passwordRules = {
    oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
};

const showChangePasswordDialog = () => {
    passwordDialogVisible.value = true;
    // 重置表单
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
};

const changePassword = () => {
    passwordFormRef.value.validate(async (valid) => {
        if (valid) {
            const res = await proxy.$api.changePassword({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            });

            if (res.code === 200) {
                ElMessage({
                    type: 'success',
                    message: '密码修改成功',
                    showClose: true
                });
                passwordDialogVisible.value = false;
            } else {
                ElMessage({
                    type: 'error',
                    message: res.message || '密码修改失败',
                    showClose: true
                });
            }
        }
    });
};

// 登录日志相关
const loginLogsDialogVisible = ref(false);
const loginLogs = ref([]);
// 获取登录日志
const getLoginLogs = async () => {
    const res = await proxy.$api.getLoginLogs();
    loginLogs.value = res;
};

const showLoginLogsDialog = () => {
    loginLogsDialogVisible.value = true;
};

// 修改手机号
const showChangePhoneDialog = () => {
    ElMessage({
        type: 'info',
        message: '修改手机号功能暂未实现',
        showClose: true
    });
};
onMounted(() => {
    getLoginLogs()
})
// 组件卸载时清理资源
onUnmounted(() => {
    // 释放任何可能存在的Object URL
    if (avatarPreview.value && avatarPreview.value.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview.value);
        console.log('释放预览图片URL');
    }
});
</script>
<template>
    <div class="user-profile">
        <el-card class="profile-card">
            <template #header>
                <div class="card-header">
                    <h3>个人信息</h3>
                </div>
            </template>
            <div class="info-container">
                <div class="avatar-container">
                    <el-avatar :size="120" :src="userInfo.avatar"></el-avatar>
                    <el-button class="change-avatar" type="primary" size="small"
                        @click="handleChangeAvatar">修改头像</el-button>
                    <!-- 隐藏的文件上传输入框 -->
                    <input type="file" ref="avatarInput" style="display: none" accept="image/jpeg,image/png,image/gif"
                        @change="onAvatarSelected" />
                </div>
                <div class="profile-info">
                    <el-form :model="userInfo" label-width="80px" :disabled="!isEditing">
                        <el-form-item label="用户名">
                            <el-input v-model="userInfo.username"></el-input>
                        </el-form-item>
                        <el-form-item label="真实姓名">
                            <el-input v-model="userInfo.realname"></el-input>
                        </el-form-item>
                        <el-form-item label="手机号码">
                            <el-input v-model="userInfo.phone"></el-input>
                        </el-form-item>
                        <el-form-item label="邮箱">
                            <el-input v-model="userInfo.email"></el-input>
                        </el-form-item>
                        <el-form-item label="职位">
                            <el-input v-model="userInfo.position"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" v-if="!isEditing" @click="startEditing">编辑信息</el-button>
                            <template v-else>
                                <el-button type="success" @click="saveUserInfo">保存</el-button>
                                <el-button @click="cancelEditing">取消</el-button>
                            </template>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </el-card>

        <el-card class="security-card">
            <template #header>
                <div class="card-header">
                    <h3>安全设置</h3>
                </div>
            </template>
            <div class="security-item">
                <div class="security-info">
                    <h4>账户密码</h4>
                    <p>定期修改密码可以保护账号安全</p>
                </div>
                <el-button @click="showChangePasswordDialog">修改密码</el-button>
            </div>
            <div class="security-item">
                <div class="security-info">
                    <h4>绑定手机</h4>
                    <p>已绑定：{{ userInfo.phone }}</p>
                </div>
                <el-button @click="showChangePhoneDialog">修改</el-button>
            </div>
            <div class="security-item">
                <div class="security-info">
                    <h4>登录日志</h4>
                    <p>查看近期登录记录，保障账号安全</p>
                </div>
                <el-button @click="showLoginLogsDialog">查看</el-button>
            </div>
        </el-card>

        <!-- 修改密码对话框 -->
        <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
            <el-form :model="passwordForm" label-width="100px" :rules="passwordRules" ref="passwordFormRef">
                <el-form-item label="原密码" prop="oldPassword">
                    <el-input v-model="passwordForm.oldPassword" type="password" show-password></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认新密码" prop="confirmPassword">
                    <el-input v-model="passwordForm.confirmPassword" type="password" show-password></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="passwordDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="changePassword">确认</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 登录日志对话框 -->
        <el-dialog v-model="loginLogsDialogVisible" title="登录日志" width="600px">
            <el-table :data="loginLogs" style="width: 100%">
                <el-table-column prop="time" label="登录时间" width="180"></el-table-column>
                <el-table-column prop="ip" label="IP地址" width="160"></el-table-column>
                <el-table-column prop="location" label="登录地点"></el-table-column>
                <el-table-column prop="device" label="设备"></el-table-column>
            </el-table>
        </el-dialog>

        <!-- 头像裁剪对话框 -->
        <el-dialog v-model="avatarDialogVisible" title="裁剪头像" width="500px">
            <div class="avatar-cropper-container">
                <img v-if="avatarPreview" :src="avatarPreview" alt="头像预览" class="avatar-preview" />
                <div v-else class="avatar-placeholder">请选择图片</div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="avatarDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="uploadAvatar" :loading="uploading">确认上传</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<style scoped lang="less">
.user-profile {
    padding: 20px;

    .profile-card,
    .security-card {
        margin-bottom: 20px;

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }

    .info-container {
        display: flex;
        align-items: flex-start;
        gap: 40px;

        @media (max-width: 768px) {
            flex-direction: column;
            align-items: center;
        }

        .avatar-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;

            .change-avatar {
                margin-top: 10px;
            }
        }

        .profile-info {
            flex: 1;
        }
    }

    .security-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
            border-bottom: none;
        }

        .security-info {
            h4 {
                margin: 0;
                font-size: 16px;
                color: #333;
            }

            p {
                margin: 5px 0 0;
                color: #999;
                font-size: 14px;
            }
        }
    }

    // 头像裁剪相关样式
    .avatar-cropper-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;

        .avatar-preview {
            max-width: 100%;
            max-height: 100%;
        }

        .avatar-placeholder {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            background-color: #f5f7fa;
            color: #909399;
            font-size: 14px;
        }
    }
}
</style>