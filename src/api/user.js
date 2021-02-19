import request from '@/utils/request'

// export function login(data) {
//   return request({
//     url: '/user/login',
//     method: 'post',
//     data
//   })
// }

export function getInfo(id) {
  return request({
    url: '/manager/user/SysUserInfo',
    method: 'post',
    data: {
      recFrom: 'manage',
      version: '1.0',
      recData: { id: id || null }
    },
    baseURL: '/'
  })
}

// export function logout() {
//   return request({
//     url: '/user/logout',
//     method: 'post'
//   })
// }
export function login(data) {
  return request({
    url: '/manager/user/sysLogin',
    method: 'post',
    data: {
      recFrom: 'manage',
      version: '1.0',
      recData: data
    },
    baseURL: '/'
  })
}
