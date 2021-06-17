// 视图组件
const view = {
    tabs: () => import('@/layouts/tabs'),
    blank: () => import('@/layouts/BlankView'),
    page: () => import('@/layouts/PageView')
}

// 路由组件注册
const routerMap = {
    login: {
        name: "登录",
        authority: '*',
        path: '/login',
        component: () => import('@/pages/login')
    },
    exp403: {
        authority: '*',
        name: 'exp403',
        path: '403',
        component: () => import('@/pages/exception/403')
    },
    exp404: {
        name: 'exp404',
        path: '404',
        component: () => import('@/pages/exception/404')
    },
    exp500: {
        name: 'exp500',
        path: '500',
        component: () => import('@/pages/exception/500')
    },
    root: {
        path: '/',
        name: '首页',
        redirect: '/login',
        component: view.tabs,
    },

    // 自定义路由，根据后端匹配
    dashboard: {
        path: 'dashboard',
        name: "仪表盘",
        component: view.page,
    },
    workplace: {
        path: 'workplace',
        name: "工作台",
        component: () => import("@/pages/dashboard/workplace"),
    },
    teacher: {
        path: "teacher",
        name: "教师日报",
        meta: {
            authority: {
                role: 'teacher'
            }
        },
        component: view.page
    },
    dailySubmit: {
        path: "dailySubmit",
        name: "填写日报",
        meta: {
            authority: {
                role: 'teacher'
            }
        },
        component: () => import('@/pages/teacher/submit'),
    },
    "dailyEdit/:id": {
        path: "dailyEdit/:id",
        name: "编辑日报",
        meta: {
            authority: {
                role: 'teacher',
            },
        },
        invisible: true,
        component: () => import('@/pages/teacher/edit'),
    },
    dailyList: {
        path: 'dailyList',
        name: "查看日报",
        meta: {
            authority: {
                role: 'teacher'
            }
        },
        component: () => import('@/pages/teacher/list'),
    },
    teacherConf: {
        path: 'teacherConf',
        name: '我的配置',
        meta: {
            authority: {
                role: 'teacher'
            }
        },
        component: () => import('@/pages/teacher/conf'),
    },
    system: {
        path: "system",
        name: "系统管理",
        meta: {
            authority: {
                role: 'superadmin'
            }
        },
        component: view.page
    },
    menuManage:{
        path: "menuManage",
        name: "菜单管理",
        meta: {
            authority: {
                role: 'superadmin'
            }
        },
        component: () => import('@/pages/system/menumanage'),
    },
    userManage: {
        path: "userManage",
        name: "用户管理",
        meta: {
            authority: {
                role: 'superadmin'
            }
        },
        component: () => import('@/pages/system/usermanage'),
    },
    authManage: {
        path: "authManage",
        name: "权限管理",
        meta: {
            authority: {
                role: 'superadmin'
            }
        },
        component: () => import('@/pages/system/authmanage'),
    },
    dataManage: {
        path: "dataManage",
        name: "数据管理",
        meta: {
            authority: {
                role: 'superadmin'
            }
        },
        component: view.blank
    },
    dailyDataManage: {
        path: "dailyDataManage",
        name: "日报数据",
        meta: {
            authority: {
                role: 'superadmin'
            }
        },
        component: () => import('@/pages/system/datamanage/dailydata'),
    },
    studentDataManage: {
        path: "studentDataManage",
        name: "学生数据",
        meta: {
            authority: {
                role: 'superadmin'
            }
        },
        component: () => import('@/pages/system/datamanage/studentdata'),
    },
    departmentDataManage: {
        path: "departmentDataManage",
        name: "部门数据",
        meta: {
            authority: {
                role: 'superadmin'
            }
        },
        component: () => import('@/pages/system/datamanage/department'),
    },
    userCenter: {
        path: "userCenter",
        name: "个人中心",
        component: () => import('@/pages/user/usercenter'),
    }
}
export default routerMap
