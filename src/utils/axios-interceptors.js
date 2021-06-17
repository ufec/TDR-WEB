import Cookie from 'js-cookie'
import {removeAuthorization} from '@/utils/request';

const errorCode = {
  /**
   * 响应数据之前做点什么
   * @param response 响应对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(response, options) {
    const {message} = options
    if (response.data.code != 1) {
      message.error(response.data.msg ? response.data.msg : response.data.message)
    }
    let needReLoginCode = [1020001, 1020002, 1020003];
    if (needReLoginCode.indexOf(response.data.code) > -1) {
      removeAuthorization();
      return options.router.push('/login');
    }else{
      return response
    }
  },

  /**
   * 响应出错时执行
   * @param error 错误对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options) {
    const {message} = options
    const {response} = error
    if (response.data.code != 1) {
      message.error(response.data.msg ? response.data.msg : response.data.message)
    }
    let needReLoginCode = [1020001, 1020002, 1020003];
    if (needReLoginCode.indexOf(response.data.code) > -1) {
      removeAuthorization();
      return options.router.push('/login');
    }else{
      return Promise.reject(error)
    }
  },
}

const reqCommon = {
  /**
   * 发送请求之前做些什么
   * @param config axios config
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(config, options) {
    const {message} = options
    const {url, xsrfCookieName} = config

    if (url.indexOf('login') === -1 && url.indexOf('getQRCode') === -1 && url.indexOf('checkScanQRCode') === -1 && xsrfCookieName && !Cookie.get(xsrfCookieName)) {
      message.warning('认证 token 已过期，请重新登录');
    }
    return config
  },
  /**
   * 请求出错时做点什么
   * @param error 错误对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options) {
    const {message} = options
    message.error(error.message)
    return Promise.reject(error)
  }
}

export default {
  request: [reqCommon], // 请求拦截
  response: [errorCode] // 响应拦截
}
