import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
// const inFifteenMinutes = new Date(new Date().getTime() + 60 * 60 * 1000)
export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
  // return Cookies.set(TokenKey, token, { expires: inFifteenMinutes})
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
