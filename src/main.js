import Vue from 'vue'
import App from './App.vue'
import {initRouter} from './router'
import './theme/index.less'
import Antd from 'ant-design-vue'
import Viser from 'viser-vue'
import store from './store'
import 'animate.css/source/animate.css'
import Plugins from '@/plugins'
import {initI18n} from '@/utils/i18n'
import bootstrap from '@/bootstrap'
import 'moment/locale/zh-cn'

const router = initRouter(store.state.setting.asyncRoutes)
const i18n = initI18n('CN', 'US')

Vue.use(Antd)
Vue.config.productionTip = false
Vue.use(Viser)
Vue.use(Plugins)

bootstrap({router, store, i18n, message: Vue.prototype.$message})

// 自定义对象数组去重方法
function unique(arr, key) {
	let obj = {};
	let res = [];
	res = arr.reduce(function(item, next) {
		obj[next[key]] ? "" : obj[next[key]] = true && item.push(next);
		return item
	}, []);
	return res;
}

Vue.prototype.$unique = unique;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app')
