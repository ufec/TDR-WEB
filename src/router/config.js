// import TabsView from '@/layouts/tabs/TabsView'
// // import BlankView from '@/layouts/BlankView'
// import PageView from '@/layouts/PageView'

// // 路由配置
// const options = {
// 	routes: [
// 		{
// 			path: '/login',
// 			name: '登录',
// 			component: () => import('@/pages/login')
// 		},
// 		{
// 			path: '*',
// 			name: '404',
// 			component: () => import('@/pages/exception/404'),
// 		},
// 		{
// 			path: '/403',
// 			name: '403',
// 			component: () => import('@/pages/exception/403'),
// 		},
// 		{
// 			path: '/',
// 			name: '首页',
// 			component: TabsView,
// 			redirect: '/login',
// 			children: [
// 				{
// 					path: 'dashboard',
// 					name: "仪表盘",
// 					meta: {
// 						icon: 'dashboard',
// 					},
// 					component: PageView,
// 					children: [
// 						{
// 							path: 'workplace',
// 							name: "工作台",
// 							meta: {
// 								icon: 'workplace',
// 							},
// 							component: () => import("@/pages/dashboard/workplace"),
// 						}
// 					],
// 				},
// 				{
// 					path: 'teacher',
// 					name: '教师日报',
// 					component: PageView,
// 					meta: {
// 						icon: 'file'
// 					},
// 					children: [
// 						{
// 							path: 'dailySubmit',
// 							name: '填写日报',
// 							meta: {
// 								icon: 'file',
// 							},
// 							component: () => import('@/pages/teacher/submit')
// 						},
// 						{
// 							path: 'dailyList',
// 							name: '查看日报',
// 							meta: {
// 								icon: 'file',
// 							},
// 							component: () => import('@/pages/teacher/list')
// 						},
// 						{
// 							path: 'teacherConf',
// 							name: '个人设置',
// 							meta: {
// 								icon: 'file',
// 							},
// 							component: () => import('@/pages/teacher/conf')
// 						}
// 					]
// 				}
// 			]
// 		}
// 	]
// }

// export default options
