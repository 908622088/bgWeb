# 基于 vue3+vite+pinia+element-plus+apifox+mock+axios 的通用后台管理网站

- 使用 Vue 3 组合式 API
- 基于 Element Plus 的 UI 组件库
- 使用 Pinia 进行状态管理
- 支持 Mock 数据
- 使用 Less 预处理器
- 集成 ECharts 图表库

## 项目结构

```
src/
├── api/          # API 接口定义
├── assets/       # 静态资源
├── components/   # 公共组件
├── config/       # 配置文件
├── hooks/        # Vue 组合式函数
├── router/       # 路由配置
├── stores/       # Pinia 状态管理
└── views/        # 页面组件
```
页面包括首页、用户管理、商品管理、测试页面、个人中心等，个人中心用户头像支持本地上传，用户登录采取token无感刷新

测试页面为测试大文件上传、虚拟列表、封装hooks函数实现图片懒加载
