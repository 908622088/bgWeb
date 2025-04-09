// 整个项目api统一管理
import request from "./request";

//请求首页左侧的表格数据
 export default {
    getTableData() {
        return request ({
            url:"/home/getTableData",
            method:"get",
        });
    },
    getCountData() {
        return request ({
            url:"/home/getCountData",
            method:"get",
        });
    },
    getChartData() {
        return request ({
            url:"/home/getChartData",
            method:"get",
        });
    },
    getUserData(data) {
        return request ({
            url:"/user/getUserData",
            method:"get",
            data
        });
    },
    deleteUser(data) {
        return request ({
            url:"/user/deleteUser",
            method:"get",
            data
        });
    },
    addUser(data) {
        return request ({
            url:"/user/addUser",
            method:"post",
            data
        });
    },
    editUser(data) {
        return request ({
            url:"/user/editUser",
            method:"post",
            data
        });
    },
    getMenu(data) {
        return request ({
            url:"/permission/getMenu",
            method:"get",
            data
        });
    },
    // 商品管理接口
    getMallList(data) {
        return request ({
            url: "/mall/getMallList",
            method: "get",
            data
        });
    },
    getCategories() {
        return request ({
            url: "/mall/getCategories",
            method: "get"
        });
    },
    getBrands() {
        return request ({
            url: "/mall/getBrands",
            method: "get"
        });
    },
    deleteMall(data) {
        return request ({
            url: "/mall/deleteMall",
            method: "get",
            data
        });
    },
    batchDeleteMall(data) {
        return request ({
            url: "/mall/batchDelete",
            method: "post",
            data
        });
    },
    addMall(data) {
        return request ({
            url: "/mall/addMall",
            method: "post",
            data
        });
    },
    editMall(data) {
        return request ({
            url: "/mall/editMall",
            method: "post",
            data
        });
    },
    updateMallStatus(data) {
        return request ({
            url: "/mall/updateStatus",
            method: "post",
            data
        });
    },
    
    // 个人中心接口
    updateUserProfile(data) {
        return request ({
            url: "/user/updateProfile",
            method: "post",
            data
        });
    },
    changePassword(data) {
        return request ({
            url: "/user/changePassword",
            method: "post",
            data
        });
    },
    getLoginLogs() {
        return request ({
            url: "/user/getLoginLogs",
            method: "get"
        });
    },
    // 上传用户头像
    uploadAvatar(data) {
        return request ({
            url: "/user/uploadAvatar",
            method: "post",
            data,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    refreshToken(data) {
        return request ({
            url: "/auth/refresh",
            method: "post",
            data
        });
    },
    // 上传文件分片
    uploadFileChunk(data) {
        return request ({
            url: "/upload/chunk",
            method: "post",
            data,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        });
    },
    // 请求合并分片
    mergeFileChunks(data) {
        return request ({
            url: "/upload/merge",
            method: "post",
            data,
        });
    }
 };