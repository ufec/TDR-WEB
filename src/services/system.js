import { 
    importStudentDataUrl, 
    getSystemUserList, 
    getEnableAuthList, 
    addSystemUserUrl, 
    editSystemUserUrl,
    delSystemUserUrl,
    changeUserStatusUrl, 
    importUserDataUrl,
    getStudentDataUrl, 
    addAuthUrl,
    delAuthUrl,
    getSystemMenuList,
    addMenuUrl,
    delMenuUrl,
    setAuthUrl,
    getAuthUrl,
    queryDailyInfoUrl,
    importDepartmentDataUrl,
    getDepartmentDataUrl,
    addDepartmentUrl,
    editDepartmentUrl,
    delDepartmentUrl,
    getAllCollegeUrl,
    getAllClassUrl,
    addStudentUrl,
    delStudentUrl,
    editStudentUrl,
} from "./api";

import { request, METHOD } from '@/utils/request'
import { paramToQueryStr } from '@/utils/tools'

// 导入学生数据
export async function importStudentData(params) {
    return request(importStudentDataUrl, METHOD.POST, params);
}

// 获取学生数据
export async function getStudentDataList(param) {
    let url = getStudentDataUrl;
    if(typeof param == 'object'){
        url += paramToQueryStr(param);
    }
    return request(url, METHOD.GET);
}

// 新增学生
export async function addStudent(param) {
    return request(addStudentUrl, METHOD.POST, param);
}

// 删除学生
export async function delStudent(param) {
    return request(delStudentUrl, METHOD.POST, param);
}

// 编辑学生
export async function editStudent(param) {
    return request(editStudentUrl, METHOD.POST, param);
}

// 查询日报信息
export async function queryDailyInfo(param) {
    return request(queryDailyInfoUrl, METHOD.POST, param);
}

// 获取用户列表
export async function getUserList(param) {
    let url = getSystemUserList;
    if(typeof param == 'object'){
        url += paramToQueryStr(param);
    }
    return request(url, METHOD.GET);
}

// 新增用户
export async function addUser(param) {
    return request(addSystemUserUrl, METHOD.POST, param);
}

// 编辑用户
export async function editUser(param) {
    return request(editSystemUserUrl, METHOD.POST, param);
}

// 删除用户
export async function delUser(param) {
    return request(delSystemUserUrl, METHOD.POST, param);
}

// 获取权限列表
export async function getAuthList(param) {
    let url = getEnableAuthList;
    if(typeof param == 'object'){
        url += paramToQueryStr(param);
    }
    return request(url, METHOD.GET);
}

// 新增/修改权限
export async function addAuth(param) {
    return request(addAuthUrl, METHOD.POST, param);
}

// 删除权限
export async function delAuth(param) {
    return request(delAuthUrl, METHOD.POST, param);
}

// 设置权限
export async function setAuth(param) {
    return request(setAuthUrl, METHOD.POST, param);
}

// 获取已有权限
export async function getAuth(param) {
    let url = getAuthUrl;
    if(typeof param == 'object'){
        url += paramToQueryStr(param);
    }
    return request(url, METHOD.GET);
}

// 修改用户状态
export async function changeUserStatus(param) {
    return request(changeUserStatusUrl, METHOD.POST, param);
}

// 导入用户
export async function importUserData(param) {
    return request(importUserDataUrl, METHOD.POST, param);
}

// 获取系统菜单列表
export async function getSystemMenu(param) {
    let url = getSystemMenuList;
    if(typeof param == 'object'){
        url += paramToQueryStr(param);
    }
    return request(url, METHOD.GET);
}

// 新增/编辑菜单
export async function addMenu(param) {
    return request(addMenuUrl, METHOD.POST, param);
}

// 删除菜单
export async function delMenu(param) {
    return request(delMenuUrl, METHOD.POST, param);
}

// 导入部门数据
export async function importDepartmentData(param) {
    return request(importDepartmentDataUrl, METHOD.POST, param);
}

// 获取部门数据
export async function getDepartmentData(param) {
    return request(getDepartmentDataUrl, METHOD.GET, param);
}

// 新增部门数据
export async function addDepartment(param) {
    return request(addDepartmentUrl, METHOD.POST, param);
}

// 修改部门数据
export async function editDepartment(param) {
    return request(editDepartmentUrl, METHOD.POST, param);
}

// 删除部门数据
export async function delDepartment(param) {
    return request(delDepartmentUrl, METHOD.POST, param);
}

// 获取所有学院数据
export async function getAllCollege() {
    return request(getAllCollegeUrl, METHOD.GET);
}

// 获取所有班级数据
export async function getAllClass() {
    return request(getAllClassUrl, METHOD.GET);
}

export default {
    importStudentData,
    getStudentDataList,
    addStudent,
    delStudent,
    editStudent,
    getUserList,
    addUser,
    editUser,
    delUser,
    changeUserStatus,
    importUserData,
    getAuthList,
    addAuth,
    delAuth,
    getSystemMenu,
    addMenu,
    delMenu,
    setAuth,
    getAuth,
    queryDailyInfo,
    importDepartmentData,
    getDepartmentData,
    addDepartment,
    editDepartment,
    delDepartment,
    getAllCollege,
    getAllClass,
}