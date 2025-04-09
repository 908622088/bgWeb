<script setup>
import { ref, reactive, onMounted, getCurrentInstance, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const { proxy } = getCurrentInstance();
// 表格数据
const mallList = ref([]);
const total = ref(0);
const loading = ref(false);
const multipleSelection = ref([]);

// 查询参数
const config = reactive({
    name: '',
    category: '',
    brand: '',
    status: '',
    page: 1,
    pageSize: 15
});

// 类别和品牌选项
const categoryOptions = ref([]);
const brandOptions = ref([]);

// 加载商品数据
const loadMallList = async () => {
    loading.value = true;
    const res = await proxy.$api.getMallList(config);
    mallList.value = res.list;
    total.value = res.count;
    if (mallList.value) loading.value = false
};

// 加载类别和品牌
const loadOptions = async () => {
    const [categoryRes, brandRes] = await Promise.all([
        proxy.$api.getCategories(),
        proxy.$api.getBrands()
    ]);
    categoryOptions.value = categoryRes;
    brandOptions.value = brandRes;

};

// 查询操作
const handleQuery = () => {
    config.page = 1;
    loadMallList();
};

// 重置查询
const resetQuery = () => {
    config.name = '';
    config.category = '';
    config.brand = '';
    config.status = '';
    handleQuery();
};

// 多选框选中数据
const handleSelectionChange = (selection) => {
    multipleSelection.value = selection;
};

// 分页
const handleCurrentChange = (page) => {
    config.page = page;
    loadMallList();
};

// 表单相关
const dialogVisible = ref(false);
const dialogType = ref('add');
const formRef = ref(null);
const formData = reactive({
    id: '',
    name: '',
    category: '',
    brand: '',
    price: 0,
    stock: 0,
    status: 1,
    description: ''
});

// 表单验证规则
const rules = {
    name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
    category: [{ required: true, message: '请选择商品类别', trigger: 'change' }],
    brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
    price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
    stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
    status: [{ required: true, message: '请选择商品状态', trigger: 'change' }]
};
// 重置表单
const resetForm = () => {
    if (formRef.value) {
        formRef.value.resetFields();
    }
    Object.assign(formData, {
        id: '',
        name: '',
        category: '',
        brand: '',
        price: 0,
        stock: 0,
        status: 1,
        description: ''
    });
};
// 打开添加对话框
const handleAdd = () => {
    dialogType.value = 'add';
    resetForm(); // 添加前重置表单
    dialogVisible.value = true;
};

// 打开编辑对话框
const handleEdit = (row) => {
    dialogType.value = 'edit';
    // 先重置表单
    resetForm();
    // 使用nextTick确保表单已重置后再填充数据
    nextTick(() => {
        Object.assign(formData, row);
        dialogVisible.value = true;
    });
};

// 关闭对话框
const handleDialogClose = () => {
    dialogVisible.value = false;
    resetForm();
};

// 提交表单
const submitForm = () => {
    formRef.value.validate(async (valid) => {
        if (valid) {
            let res = null
            if (dialogType.value === 'add') {
                res = await proxy.$api.addMall(formData);
            } else {
                res = await proxy.$api.editMall(formData);
            }
            console.log(res)
            if (res) {
                dialogVisible.value = false;
                //清空表单内容
                resetForm();
                ElMessage.success(dialogType.value === 'add' ? '添加成功' : '编辑成功')
                loadMallList();
            }
            else {
                ElMessage.error(dialogType.value === 'add' ? '添加失败' : '编辑失败')

            }

        }
    }
    );
};

// 删除商品
const handleDelete = (row) => {
    ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        let res = null
        res = await proxy.$api.deleteMall({ id: row.id });
        if (res) {
            ElMessage.success('删除成功');
            loadMallList();
        }

    })
};

// 批量删除
const handleBatchDelete = () => {
    if (multipleSelection.value.length === 0) {
        ElMessage.warning('请选择要删除的商品');
        return;
    }
    const ids = multipleSelection.value.map(item => item.id);
    ElMessageBox.confirm(`确定要删除选中的 ${ids.length} 个商品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        await proxy.$api.batchDeleteMall({ ids });
        ElMessage.success(`成功删除 ${ids.length} 个商品`);
        loadMallList();
    }
    )
};

// 修改商品状态
const handleStatusChange = (row) => {
    const statusText = row.status === 0 ? '上架' : '下架';
    const newStatus = row.status === 0 ? 1 : 0;

    ElMessageBox.confirm(`确定要${statusText}该商品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        await proxy.$api.updateMallStatus({
            id: row.id,
            status: newStatus
        });
        ElMessage.success(`${statusText}成功`);
        loadMallList();
    }
    )
};

onMounted(() => {
    loadOptions();
    loadMallList();
});
</script>
<template>
    <div class="mall-container">
        <!-- 顶部搜索区域 -->
        <div class="search-header">
            <div class="left-buttons">
                <el-button type="primary" @click="handleAdd">新增商品</el-button>
                <el-button type="danger" :disabled="!multipleSelection.length"
                    @click="handleBatchDelete">批量删除</el-button>
            </div>
            <div class="right-search">
                <el-form :inline="true" :model="config" class="search-form">
                    <el-form-item>
                        <el-input v-model="config.name" placeholder="商品名称" clearable></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-select v-model="config.category" placeholder="商品类别" clearable>
                            <el-option v-for="item in categoryOptions" :key="item.name" :label="item.name"
                                :value="item.name"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-select v-model="config.brand" placeholder="品牌" clearable>
                            <el-option v-for="item in brandOptions" :key="item.name" :label="item.name"
                                :value="item.name"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-select v-model="config.status" placeholder="状态" clearable>
                            <el-option :label="'上架'" :value="1"></el-option>
                            <el-option :label="'下架'" :value="0"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleQuery">搜索</el-button>
                        <el-button @click="resetQuery">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>

        <!-- 数据表格 -->
        <el-table v-loading="loading" :data="mallList" border @selection-change="handleSelectionChange"
            style="width: 100%; margin-top: 20px;">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="name" label="商品名称" min-width="120"></el-table-column>
            <el-table-column prop="category" label="类别" width="100"></el-table-column>
            <el-table-column prop="brand" label="品牌" width="100"></el-table-column>
            <el-table-column prop="price" label="价格" width="100">
                <template #default="scope">
                    <span>¥{{ scope.row.price }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="80"></el-table-column>
            <el-table-column prop="sales" label="销量" width="80"></el-table-column>
            <el-table-column prop="status" label="状态" width="80">
                <template #default="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                        {{ scope.row.status === 1 ? '上架' : '下架' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
            <el-table-column fixed="right" label="操作" width="200">
                <template #default="scope">
                    <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button link :type="scope.row.status === 0 ? 'success' : 'warning'" size="small"
                        @click="handleStatusChange(scope.row)">
                        {{ scope.row.status === 0 ? '上架' : '下架' }}
                    </el-button>
                    <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
            <el-pagination v-model:current-page="config.page" v-model:page-size="config.pageSize"
                 layout="prev, pager, next" :total="total"
                @current-change="handleCurrentChange"></el-pagination>
        </div>

        <!-- 添加/编辑商品对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增商品' : '编辑商品'" width="600px"
            :before-close="handleDialogClose">
            <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
                <el-form-item label="商品名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入商品名称"></el-input>
                </el-form-item>
                <el-form-item label="商品类别" prop="category">
                    <el-select v-model="formData.category" placeholder="请选择商品类别" style="width: 100%;">
                        <el-option v-for="item in categoryOptions" :key="item.name" :label="item.name"
                            :value="item.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="品牌" prop="brand">
                    <el-select v-model="formData.brand" placeholder="请选择品牌" style="width: 100%;">
                        <el-option v-for="item in brandOptions" :key="item.name" :label="item.name"
                            :value="item.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="价格" prop="price">
                            <el-input-number v-model="formData.price" :min="0" :precision="2" :step="10"
                                style="width: 100%;"></el-input-number>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="库存" prop="stock">
                            <el-input-number v-model="formData.stock" :min="0" :precision="0" :step="10"
                                style="width: 100%;"></el-input-number>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="商品状态" prop="status">
                    <el-radio-group v-model="formData.status">
                        <el-radio :label="1">上架</el-radio>
                        <el-radio :label="0">下架</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="商品描述" prop="description">
                    <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入商品描述"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<style scoped lang="less">
.mall-container {
    padding: 20px;

    .search-header {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 15px;

        .left-buttons {
            display: flex;
            gap: 10px;
        }

        .right-search {
            flex: 1;
            display: flex;
            justify-content: flex-end;

            .search-form {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
        }
    }

    .pagination-container {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
    }
}

@media screen and (max-width: 992px) {
    .search-header {
        flex-direction: column;

        .right-search {
            width: 100%;
        }
    }
}
</style>