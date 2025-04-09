<script setup>
import { ref, getCurrentInstance, onMounted, reactive, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
const { proxy } = getCurrentInstance();
const tableData = ref([])
// 管理用户列表的查询参数和分页信息
const config = reactive({
    name: '', //存储搜索框输入的用户名
    //分页信息
    page: 1,
    total: 0,
    pageSize: 15
})
const loading = ref(false);
const getUserData = async () => {
    loading.value = true;
    let data = await proxy.$api.getUserData(config)
    tableData.value = data.list.map(item => ({
        ...item,
        sexLabel: item.sex === '0' ? '女' : '男'
    }))
    config.total = data.count
    if (tableData.value) loading.value = false
    
}
const tableLabel = reactive([
    {
        prop: 'name',
        label: '姓名'
    },
    {
        prop: 'age',
        label: '年龄'
    },
    {
        prop: 'sexLabel',
        label: '性别'
    },
    {
        prop: 'birth',
        label: '出生日期',
        width: 230
    },
    {
        prop: 'addr',
        label: '地址',
        width: 480

    }
])
// 搜索框查询内容
const formInline = reactive({
    keyWord: ''
})
// 搜索
const handleSearch = () => {
    config.name = formInline.keyWord
    getUserData();
}
// 分页功能
const handlePage = (page) => {
    config.page = page;
    getUserData();
}
// 删除功能
const hanleDelete = (val) => {
    ElMessageBox.confirm('你确定要删除吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        title: '删除提示',
        type: 'warning',
    }).then(async () => {
        await proxy.$api.deleteUser({ id: val.id })
        ElMessage({
            message: '删除成功',
            type: 'success',
            showClose: true
        })
        getUserData()
    })
}
// 新建/编辑
// formUser：存储表单数据    userForm:表单实例引用（操作表单、ref引用）   
const formUser = reactive({
    sex: '1'
})
const action = ref('add') //区分新建和编辑
const dialogVisible = ref(false)
//表单校验规则
const rules = reactive({
    name: [{ required: true, message: "姓名是必填项", trigger: "blur" }],
    age: [
        { required: true, message: "年龄是必填项", trigger: "blur" },
        { type: "number", message: "年龄必须是数字" },
    ],
    sex: [{ required: true, message: "性别是必选项", trigger: "change" }],
    birth: [{ required: true, message: "出生日期是必选项" }],
    addr: [{ required: true, message: '地址是必填项' }]
})
const handleClose = () => {
    dialogVisible.value = false;
    //清空表单内容
    proxy.$refs.userForm.resetFields()
}
const handleCancel = () => {
    dialogVisible.value = false;
    //清空表单内容
    proxy.$refs.userForm.resetFields()
}
const handleEdit = (val) => {
    action.value = 'edit'
    dialogVisible.value = true
    // 确保弹窗内的表单已渲染，再填充数据（防止污染新增表单内容）
    nextTick(() => {
        // 浅拷贝原来表单内容
        Object.assign(formUser,{...val,sex:'' + val.sex})
    })
}
const handleAdd = () => {
    action.value = 'add'
    dialogVisible.value = true
}
const onSubmit = () => {
    // 先进行表单验证（验证rules）
    proxy.$refs.userForm.validate(async (valid) => {
        if (valid) {
            let res = null
            // 添加
            if (action.value === 'add') {
                res = await proxy.$api.addUser(formUser)
            }
            // 编辑
            else if (action.value === 'edit') {
                res = await proxy.$api.editUser(formUser)
            }
            //接口调用成功
            if (res) {
                //关闭对话框，重置表单，重新请求用户数据
                dialogVisible.value = false
                //清空表单内容
                proxy.$refs.userForm.resetFields()
                ElMessage({
                    type: 'success',
                    message: action.value === 'add' ? '添加成功' : '编辑成功',
                    showClose: true
                })
                getUserData()
            }
            else {
                ElMessage({
                    type: 'error',
                    message: action.value === 'add' ? '添加失败' : '编辑失败',
                    showClose: true
                })
            }
        }
        else {
            ElMessage({
                type: 'error',
                message: '请输入正确的内容',
                showClose: true

            })
        }

    })


}
onMounted(() => {
    getUserData()
})
</script>

<template>
    <div class="user-header">
        <el-button type="primary" @click="handleAdd">+新增</el-button>
        <el-form :inline="true" :model="formInline">
            <el-form-item label="请输入">
                <el-input placeholder="请输入用户名" v-model="formInline.keyWord"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
            </el-form-item>
        </el-form>
    </div>
    <div class="table">
        <el-table :data="tableData" style="width: 100%" v-loading="loading">
            <el-table-column v-for="item in tableLabel" :key="item.prop" :label="item.label"
                :width="item.width ? item.width : 125" :prop="item.prop" />
            <el-table-column fixed="right" label="Operations" width="150">
                <template #="scope">
                    <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                        编辑
                    </el-button>
                    <el-button type="danger" size="small" @click="hanleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination class="pager" background layout="prev, pager, next" :total="config.total"
            :page-size="config.pageSize" @current-change="handlePage" />

    </div>
    <el-dialog v-model="dialogVisible" :title="action == 'add' ? '新增用户' : '编辑用户'" width="35%"
        :before-close="handleClose">
        <!--需要注意的是设置了:inline="true"，
		会对el-select的样式造成影响，我们通过给他设置一个class=select-clearn
		在css进行处理-->
        <el-form :inline="true" :model="formUser" :rules="rules" ref="userForm">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="姓名" prop="name">
                        <el-input v-model="formUser.name" placeholder="请输入姓名" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="年龄" prop="age">
                        <el-input v-model.number="formUser.age" placeholder="请输入年龄" type="number" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item class="select-clearn" label="性别" prop="sex">
                        <el-select v-model="formUser.sex" placeholder="请选择">
                            <el-option label="男" value="1" />
                            <el-option label="女" value="0" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="出生日期" prop="birth">
                        <el-date-picker v-model="formUser.birth" type="date" placeholder="请输入" style="width: 100%"
                            format="YYYY/MM/DD" value-format="YYYY-MM-DD" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-form-item label="地址" prop="addr">
                    <el-input v-model="formUser.addr" placeholder="请输入地址" />
                </el-form-item>
            </el-row>
            <el-row style="justify-content: flex-end">
                <el-form-item>
                    <el-button type="primary" @click="handleCancel">取消</el-button>
                    <el-button type="primary" @click="onSubmit">确定</el-button>
                </el-form-item>
            </el-row>
        </el-form>
    </el-dialog>

</template>

<style scoped lang="less">
.user-header {
    display: flex;
    justify-content: space-between;
}

.table {
    position: relative;
    height: 700px;

    .pager {
        position: absolute;
        right: 30px;
        bottom: 10px;
    }

    .el-table {
        height: 100%;
        width: 100%;
    }
}

.select-clearn {
    display: flex;
}
</style>
