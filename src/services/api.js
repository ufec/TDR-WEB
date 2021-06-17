//跨域代理前缀
// const API_PROXY_PREFIX='/api'
// const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_API_BASE_URL : API_PROXY_PREFIX
const BASE_URL = process.env.VUE_APP_API_BASE_URL

module.exports = {
  // 用户接口
  loginUrl: `${BASE_URL}/user/login`, // 登录接口
  logoutUrl: `${BASE_URL}/user/logout`, // 退出登录接口
  refreshTokenUrl: `${BASE_URL}/user/refreshToken`, // 刷新Token接口
  getUserRoutesUrl: `${BASE_URL}/user/getUserRoute`, // 获取用户菜单路由接口
  changeUserNameUrl: `${BASE_URL}/user/changeUserName`, // 修改用户姓名
  getQRCodeUrl: `${BASE_URL}/user/getQRCode`, // 获取小程序二维码
  checkScanQRCodeUrl: `${BASE_URL}/user/checkScanQRCode`, // 校验扫码结果

  // 系统数据管理
  importStudentDataUrl: `${BASE_URL}/system/data/importStudentData`, // 导入学生数据接口
  getStudentDataUrl: `${BASE_URL}/system/data/getStudentData`, // 获取学生信息
  queryDailyInfoUrl: `${BASE_URL}/system/data/queryDailyInfo`, // 查询日报详情
  importDepartmentDataUrl: `${BASE_URL}/system/data/importDepartmentData`, // 导入部门数据接口
  getDepartmentDataUrl: `${BASE_URL}/system/data/getDepartmentData`, // 获取部门数据接口
  addDepartmentUrl: `${BASE_URL}/system/data/addDepartment`, // 新增部门数据接口
  editDepartmentUrl: `${BASE_URL}/system/data/editDepartment`, // 新增部门接口
  delDepartmentUrl: `${BASE_URL}/system/data/delDepartment`, // 删除部门数据接口
  addStudentUrl: `${BASE_URL}/system/data/addStudent`, // 新增学生接口
  delStudentUrl: `${BASE_URL}/system/data/delStudent`, // 删除学生接口
  editStudentUrl: `${BASE_URL}/system/data/editStudent`, // 编辑学生接口
  
  // 系统用户管理
  getSystemUserList: `${BASE_URL}/system/user/getUserList`, // 获取所有用户列表
  addSystemUserUrl: `${BASE_URL}/system/user/addUser`, // 新增用户
  editSystemUserUrl: `${BASE_URL}/system/user/editUser`, // 编辑用户
  delSystemUserUrl: `${BASE_URL}/system/user/delUser`, // 编辑用户
  changeUserStatusUrl: `${BASE_URL}/system/user/changeUserStatus`, // 修改用户状态
  importUserDataUrl: `${BASE_URL}/system/user/importUserData`, // 导入用户
  
  // 系统权限管理
  getEnableAuthList: `${BASE_URL}/system/auth/getAuthGroup`, // 获取所有已启用的权限组列表
  addAuthUrl: `${BASE_URL}/system/auth/addAuth`, // 新增/修改权限接口
  delAuthUrl: `${BASE_URL}/system/auth/delAuth`, // 删除权限
  setAuthUrl: `${BASE_URL}/system/auth/setAuth`, // 设置权限
  getAuthUrl: `${BASE_URL}/system/auth/getAuth`, // 获取权限

  //系统菜单管理
  getSystemMenuList: `${BASE_URL}/system/menu/getMenuList`, //获取系统菜单
  addMenuUrl: `${BASE_URL}/system/menu/addMenu`, //新增/编辑菜单接口
  delMenuUrl: `${BASE_URL}/system/menu/delMenu`, //删除菜单接口

  // 公共接口
  searchClassUrl: `${BASE_URL}/api/searchClass`, // 搜索班级接口
  getClassStudentUrl: `${BASE_URL}/api/getClassStudent`, // 获取教师配置班级列表中的学生
  searchStudentUrl: `${BASE_URL}/api/searchStudent`, // 搜索对应班级的学生
  getAllDepartmentUrl: `${BASE_URL}/api/getAllDepartment`, // 获取所有部门列表
  getAllCollegeUrl: `${BASE_URL}/api/getAllCollege`, // 获取所有学院列表
  getAllClassUrl: `${BASE_URL}/api/getAllClass`, // 获取所有班级列表
  
  // 教师日报
  setTeacherConfUrl: `${BASE_URL}/daily/setTeacherConf`, // 设置教学配置接口
  getTeacherConfigUrl: `${BASE_URL}/daily/getTeacherConf`, // 获取教师配置接口
  dailySubmitUrl: `${BASE_URL}/daily/submit`, // 提交日报接口
  dailyListUrl: `${BASE_URL}/daily/list`, // 获取日报列表接口
  getDailyInfoUrl: `${BASE_URL}/daily/dailyInfo`, // 查询日报信息接口
  editDailyUrl: `${BASE_URL}/daily/editDaily`, // 编辑日报接口
  delDailyUrl: `${BASE_URL}/daily/delDaily`, // 删除日报接口
}