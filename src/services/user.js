import {loginUrl, logoutUrl, refreshTokenUrl, changeUserInfoUrl, getQRCodeUrl, checkScanQRCodeUrl} from './api';
import {request, METHOD} from '@/utils/request';

/**
 * 登录服务
 * @param name 账户名
 * @param password 账户密码
 * @returns {Promise<AxiosResponse<T>>}
 */
export async function login(name, password) {
  return request(loginUrl, METHOD.POST, {
    username: name,
    password: password
  })
}

/**
 * 退出登录
 */
export async function logout() {
  return request(logoutUrl, METHOD.GET);
}

/**
 * 刷新用户Token 
 */
export async function refreshUserToken() {
  return request(refreshTokenUrl, METHOD.GET);
}

/**
 * 修改用户昵称
 * @param {*} param 
 * @returns 
 */
export async function changeUserInfo(param) {
  return request(changeUserInfoUrl, METHOD.POST, param);
}

/**
 * 获取用户二维码
 * @returns 
 */
export async function getQRCode(param) {
  return request(getQRCodeUrl, METHOD.POST, param);
}

/**
 * 校验扫码结果
 * @param {*} param 
 * @returns 
 */
export async function checkScanQRCode(param) {
  return request(checkScanQRCodeUrl, METHOD.POST, param);
}

export default {
  login,
  logout,
  refreshUserToken,
  changeUserInfo,
  getQRCode,
  checkScanQRCode,
}
