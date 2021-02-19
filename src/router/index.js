import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [
  // {
  //   path: '/redirect',
  //   component: Layout,
  //   hidden: true,
  //   children: [
  //     {
  //       path: '/redirect/:path*',
  //       component: () => import('@/views/redirect/index')
  //     }
  //   ]
  // },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/lots-manage/auctions'
  },
  {
    path: '/lots-manage',
    component: Layout,
    name: 'lots-manage',
    meta: {
      title: '拍卖品管理',
      icon: 'example'
    },
    children: [
      {
        path: 'auctions',
        component: () => import('@/views/lots-manage/auctions/index'),
        name: 'auctions',
        meta: { title: '拍卖场次', icon: 'edit', noCache: false }
      },
      {
        path: 'orders',
        component: () => import('@/views/lots-manage/order/index'),
        name: 'orders',
        meta: { title: '订单管理', icon: 'list', noCache: false }
      },
      {
        path: 'auction/:id(\\d+)',
        component: () => import('@/views/lots-manage/lot-list/index'),
        name: 'auction-list',
        // activeMenu: '/example/list'
        meta: { title: '拍卖品', noCache: false },
        hidden: true
      }
    ]
  }
  // {
  //   path: '/profile',
  //   component: Layout,
  //   redirect: '/profile/index',
  //   hidden: true,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/profile/index'),
  //       name: 'Profile',
  //       meta: { title: 'Profile', icon: 'user', noCache: false }
  //     }
  //   ]
  // },
]
export const asyncRoutes = [
  {
    path: '/dashboard',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/views/adver/index.vue'),
        name: 'Dashboard',
        meta: { title: '首页广告', icon: 'dashboard', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/manage-center',
    component: Layout,
    name: 'manage-center',
    meta: {
      title: '管理中心',
      icon: 'list',
      roles: ['admin']
    },
    children: [
      // {
      //   path: 'administrators',
      //   component: () => import('@/views/manage-center/administrators/index'),
      //   name: 'administrators',
      //   meta: { title: '管理员信息', icon: 'edit' }
      // },
      // {
      //   path: 'log',
      //   component: () => import('@/views/manage-center/log/index'),
      //   name: 'log',
      //   meta: { title: '操作日志', icon: 'list' }
      // },

      {
          path: 'auction-type',
          component: () => import('@/views/lots-manage/lot-type/index'),
          name: 'auction-type',
          meta: { title: '拍卖类型管理', icon: 'list' }
      },
      {
        path: 'find',
        component: () => import('@/views/manage-center/find/index'),
        name: 'find',
        meta: { title: '发现', icon: 'list', noCache: false, roles: ['admin'] }
      },
      {
        path: 'help',
        component: () => import('@/views/manage-center/help/index'),
        name: 'help',
        meta: { title: '玩转格古', icon: 'list', noCache: false, roles: ['admin'] }
      },
      {
        path: 'agreement',
        component: () => import('@/views/manage-center/agreement/index'),
        name: 'agreement',
        meta: { title: '协议', icon: 'list', noCache: false, roles: ['admin'] }
      },
      {
        path: 'userProblem',
        component: () => import('@/views/manage-center/userProblem/index'),
        name: 'userProblem',
        meta: { title: '用户反馈', icon: 'list', noCache: false, roles: ['admin'] }
      }
    ]
  },
  {
    path: '/users-manamge',
    component: Layout,
    name: 'users-manamge',
    meta: {
      title: '用户中心',
      icon: 'list',
      roles: ['admin']
    },
    children: [
      {
        path: 'info',
        component: () => import('@/views/users-manamge/info/index'),
        name: 'info',
        meta: { title: '用户信息', icon: 'edit', noCache: false, roles: ['admin'] }
      },
      {
        path: 'account',
        component: () => import('@/views/users-manamge/account/index'),
        name: 'auctions',
        meta: { title: '保证金', icon: 'list', noCache: false, roles: ['admin'] }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]
const createRouter = () => new VueRouter({
  routes: constantRoutes
})
const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
