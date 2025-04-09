import { createApp } from 'vue';
import App from './App.vue';
import "@/assets/less/index.less";
import router from './router';
import { ElMessage } from 'element-plus';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia';
import "@/api/mock.js";
import api from './api/api';
import { useAllDataStore } from "@/stores"
// 检查页面是否存在于路由
const isRoute = (to) => {
  return router.getRoutes().filter(item => item.path === to.path).length > 0
}
router.beforeEach((to, from) => {
  if (to.path !== '/login' && !store.state.token) {
    ElMessage({
      type: 'error',
      message: '请先登录！',
      showClose: true
    })
    return { name: 'login' };
  }
  if (!isRoute(to)) {
    return { name: '404' };
  }
});
const pinia = createPinia();
const app = createApp(App);
app.config.globalProperties.$api = api;
app.use(ElementPlus);
app.use(pinia);
const store = useAllDataStore();
store.addMenu(router, "refresh") // 刷新页面
app.use(router).mount('#app');
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
