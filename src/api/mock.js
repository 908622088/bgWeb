import Mock from 'mockjs';
import homeApi from './mockData/home'
import userApi from './mockData/user'
import permissionApi from './mockData/permission';
import mallApi from './mockData/mall'
// 1.拦截的路径 2.方法 3.制造出的假数据
Mock.mock(/api\/home\/getTableData/,"get",homeApi.getTableData)
Mock.mock(/api\/home\/getCountData/,"get",homeApi.getCountData)
Mock.mock(/api\/home\/getChartData/,"get",homeApi.getChartData)
Mock.mock(/api\/user\/getUserData/,"get",userApi.getUserList)
Mock.mock(/api\/user\/deleteUser/,"get",userApi.deleteUser)
Mock.mock(/api\/user\/addUser/,"post",userApi.createUser)
Mock.mock(/api\/user\/editUser/,"post",userApi.updateUser)
Mock.mock(/api\/permission\/getMenu/,"get",permissionApi.getMenu)
Mock.mock(/api\/auth\/refresh/,"post",permissionApi.refreshToken)
Mock.mock(/api\/mall\/getMallList/,"get",mallApi.getMallList)
Mock.mock(/api\/mall\/getCategories/,"get",mallApi.getCategories)
Mock.mock(/api\/mall\/getBrands/,"get",mallApi.getBrands)
Mock.mock(/api\/mall\/deleteMall/,"get",mallApi.deleteMall)
Mock.mock(/api\/mall\/batchDelete/,"post",mallApi.batchDelete)
Mock.mock(/api\/mall\/addMall/,"post",mallApi.createMall)
Mock.mock(/api\/mall\/editMall/,"post",mallApi.updateMall)
Mock.mock(/api\/mall\/updateStatus/,"post",mallApi.updateStatus)
Mock.mock(/api\/user\/updateProfile/,"post",userApi.updateProfile)
Mock.mock(/api\/user\/changePassword/,"post",userApi.changePassword)
Mock.mock(/api\/user\/getLoginLogs/,"get",userApi.getLoginLogs)
Mock.mock(/api\/user\/uploadAvatar/,"post",userApi.uploadAvatar)

// 大文件上传相关接口
import uploadApi from './mockData/upload'
Mock.mock(/api\/upload\/chunk/,"post",uploadApi.uploadChunk)
Mock.mock(/api\/upload\/merge/,"post",uploadApi.mergeChunks)






