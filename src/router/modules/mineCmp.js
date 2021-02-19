import Layout from '@/layout'
const mineCmpDemoRouter = {
  path: '/MineCmpDemo',
  component: Layout,
  redirect: 'noRedirect',
  name: 'MineCmpDemo',
  meta: {
    title: 'MineCmpDemo',
    icon: 'component'
  },
  children: [
    {
      path: 'upload',
      component: () => import('@/demo/upload/index'),
      name: 'Upload',
      meta: { title: 'Upload' }
    }
  ]
}

export default mineCmpDemoRouter
