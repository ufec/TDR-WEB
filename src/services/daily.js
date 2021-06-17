import {
    dailyListUrl, 
    searchStudentUrl, 
    searchClassUrl, 
    setTeacherConfUrl, 
    getTeacherConfigUrl, 
    getClassStudentUrl,
    dailySubmitUrl,
    getDailyInfoUrl,
    editDailyUrl,
    delDailyUrl,
    getAllDepartmentUrl,
} from './api'
import {request, METHOD} from '@/utils/request'

/**
 * 获取日报列表
 * @param {Object} param 
 * @returns 
 */
export async function getDailyList(param) {
    return request(dailyListUrl, METHOD.get, param);
}

/**
 * 搜索指定班级下的学生
 * @param {String} value - 学生名 
 * @param {String} className  - 班级名
 * @returns 
 */
export async function searchStudentList(value, className) {
    return request(searchStudentUrl, METHOD.POST, {
        name: value,
        class: className
    });
}

/**
 * 以班级名搜索班级
 * @param {String} className 
 * @returns 
 */
export async function getClassList(className) {
    return request(searchClassUrl, METHOD.GET, {
        className: className
    });
}

/**
 * 设置指定teacherId教师的年度教学配置
 * @param {Integer} teacherId 
 * @param {Array} courseArr 
 * @param {Array} headMasterArr 
 * @param {Integer} checkedClass 
 * @returns 
 */
export async function setTeacherConfig(param) {
    return request(setTeacherConfUrl, METHOD.POST, param);
}

/**
 * 获取指定teacherId教师的配置
 * @param {Integer} teacherId 
 * @returns 
 */
export async function getTeacherConfig(teacherId) {
    return request(getTeacherConfigUrl, METHOD.GET, {
        teacherId: teacherId
    });
}

/**
 * 获取指定teacherId所属班级的学生
 * @param {Integer} teacherId 
 * @returns 
 */
export async function getClassStudent(teacherId) {
    return request(getClassStudentUrl, METHOD.GET, {
        id: teacherId
    });
}

/**
 * 提交日报
 * @param {Object} param 
 * @returns 
 */
export async function dailySubmit(param) {
    return request(dailySubmitUrl, METHOD.POST, param);
}

/**
 * 获取指定id日报详情
 * @param {Integer} id 
 * @returns 
 */
export async function getDailyInfo(id) {
    return request(getDailyInfoUrl, METHOD.GET, {id: id});
}

/**
 * 编辑日报
 * @param {Object} param 
 * @returns 
 */
export async function editDaily(param) {
    return request(editDailyUrl, METHOD.POST, param);
}

/**
 * 删除日报
 * @param {Object} param 
 * @returns 
 */
export async function delDaily(param) {
    return request(delDailyUrl, METHOD.POST, param);
}

// 获取所有部门数据
export async function getAllDepartment() {
    return request(getAllDepartmentUrl, METHOD.GET);
}

export default {
    getDailyList,
    searchStudentList,
    getClassList,
    setTeacherConfig,
    getTeacherConfig,
    getClassStudent,
    dailySubmit,
    getDailyInfo,
    editDaily,
    delDaily,
    getAllDepartment,
}