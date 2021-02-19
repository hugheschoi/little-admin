import request from '@/utils/request'
const getStore = (url, method, data) => {
  if (method === 'post') {
    return request({
      url,
      method,
      data: Object.assign({}, {
        recFrom: 'manage',
        version: '1.0'
      }, data),
      baseURL: '/'
    })
  }
  return request({
    url,
    method,
    params: data,
    baseURL: '/'
  })
}
export default {
  install: Vue => {
    Vue.prototype.$ajax = getStore
  }
}
