import XLSX from 'xlsx';
import { v1 as uuidv1, v5 as uuidv5 } from "uuid";

/**
 * 格式化菜单树形结构
 * @param {*} list 
 * @returns 
 */
function fnSetTreeData(list) {
    var data = [...list];
    var tree = data.filter((father) => {
        var branchArr = data.filter((child) => {
            if (father.id == child.fid) child._hasParent = true;
            return father.id == child.fid;
        });
        if (branchArr.length > 0) father.children = branchArr;
        return !father._hasParent;
    });
    tree = tree.filter((item) => {
        return !item._hasParent;
    })
    return tree
}

/**
 * 导入excel数据到对象
 * @param {*} file 
 * @returns 
 */
function excelToData(file) {
    let reader = new FileReader(); // 用FileReader来读取
    // 采用Promise以实现等待数据全部处理完成
    return new Promise((resolve, reject) => {
        // 重写FileReader上的readAsBinaryString方法
        FileReader.prototype.readAsBinaryString = function (file) {
            let binary = "";
            let wb = null; // 读取完成的数据
            let returnData = null;// 最终数据
            let reader = new FileReader();
            reader.onload = function () {
                // 读取成Uint8Array，再转换为Unicode编码（Unicode占两个字节）
                let bytes = new Uint8Array(reader.result);
                let length = bytes.byteLength;
                for (let i = 0; i < length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                // 接下来就是xlsx了，具体可看api
                wb = XLSX.read(binary, { type: "binary" });
                returnData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                if(null == returnData){
                    reject(returnData);
                }else{
                    resolve(returnData);
                }
            };
            reader.readAsArrayBuffer(file);
        };
        reader.readAsBinaryString(file);
    });
}

/**
 * 处理学生excel数据
 * @param {*} stuData 
 * @returns 
 */
function execStudentData(stuData) {
    let students = [...stuData];    
    const formatRes = [];
    students.map(item => {
        if (item.学号 && item.姓名 && item.性别 && item.学院 && item.行政班 && item.年级) {
            formatRes.push({
                stu_num: item.学号,
                name: item.姓名,
                sex: item.性别,
                college: item.学院,
                class: item.行政班,
                grade: Number(item.年级),
            })
        }
    })

    if (formatRes.length == 0) return [];

    let college = []; //储存学院
    let className = []; //储存班级名称
    formatRes.forEach(item => {
        if(college.indexOf(item.college) == -1){
            college.push(item.college);
        }
        if (className.indexOf(item.class) == -1) {
            className.push(item.class);
        }
    })

    let list = []; // 所有数据分不同学院储存
    let key = []; // 各分段点所对应的key值
    for (let i in college) {
        for (let j in formatRes) {
            if (college[i] == formatRes[j].college) {
                key.push(Number(j));
                break;
            }
        }
    }
    key.push(formatRes.length);// 最后一项为整个数据的长度

    key.forEach((item, index) => {
        if (index != key.length-1) {
            list.push(formatRes.slice(key[index], key[index+1]));//将每个学院用不同的数组存起来
        }
    })

    let groupingData = [];//最终数据

    let grouping = function(arr)
    {
        let tempClass = [];
        className.forEach(item => {
            let tempStu = [];
            arr.forEach(item_res => {
                if (item_res.class == item) {
                    tempStu.push({
                        stu_num: item_res.stu_num,
                        name: item_res.name,
                        sex: item_res.sex,
                        grade: item_res.grade,
                    })
                }
            })
            if (tempStu.length > 0) {
                tempClass.push({
                    className: item,
                    studentList: tempStu
                })
            }
        })
        return {
            college: arr[0].college,
            class: tempClass
        };
    }
    list.forEach(item => {
        groupingData.push(grouping(item))
    })
    return groupingData;
}

/**
 * 处理部门数据
 * @param {*} departData 
 */
function execDepartMentData(departData) {
    let data = [];
    departData.forEach(item => {
        if (item.单位 != undefined) {
            data.push(item.单位);
        }
    })
    return data;
}

/**
 * 处理用户数据
 * @param {*} userData 
 */
function execUserData(userData) {
    let data = [];
    userData.forEach(item => {
        if (item.姓名 && item.工号) {
            data.push({
                username: item.工号,
                password: item.工号,
                nick_name: item.姓名,
            });
        }
    })
    return data;
}

/**
 * query查询对象转为查询字符串
 * @param {*} param 
 * @returns 
 */
function paramToQueryStr(param){
    if (typeof param != 'object' || param === null) {
        return "";
    }
    let queryString = "?";
    for (const key in param) {
        if (Object.hasOwnProperty.call(param, key)) {
            queryString += key + "=" + param[key] + "&";
        }
    }
    return queryString.substring(0, queryString.length-1);
}

// 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
function sheet2blob(sheet, sheetName) {
	sheetName = sheetName || 'sheet1';
	var workbook = {
		SheetNames: [sheetName],
		Sheets: {}
	};
	workbook.Sheets[sheetName] = sheet;
	// 生成excel的配置项
	var wopts = {
		bookType: 'xlsx', // 要生成的文件类型
		bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
		type: 'binary'
	};
	var wbout = XLSX.write(workbook, wopts);
	var blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
	// 字符串转ArrayBuffer
	function s2ab(s) {
		var buf = new ArrayBuffer(s.length);
		var view = new Uint8Array(buf);
		for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
		return buf;
	}
	return blob;
}

/**
 * 通用的打开下载对话框方法，没有测试过具体兼容性
 * @param url 下载地址，也可以是一个blob对象，必选
 * @param saveName 保存文件名，可选
 */
function openDownloadDialog(url, saveName)
{
	if(typeof url == 'object' && url instanceof Blob)
	{
		url = URL.createObjectURL(url); // 创建blob地址
	}
	var aLink = document.createElement('a');
	aLink.href = url;
	aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
	var event;
	if(window.MouseEvent) event = new MouseEvent('click');
	else
	{
		event = document.createEvent('MouseEvents');
		event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	}
	aLink.dispatchEvent(event);
}

/**
 * 导出Excel
 * @param {*} sheet 
 * @param {*} fileName 
 * @returns 
 */
function exportExcel(sheet, fileName="日报数据.xlsx") {
	var blob = sheet2blob(sheet, "数据");
	return openDownloadDialog(blob, fileName);
}

// 定义一个深拷贝函数  接收目标target参数
function deepClone(target) {
    // 定义一个变量
    let result;
    // 如果当前需要深拷贝的是一个对象的话
    if (typeof target === 'object') {
    // 如果是一个数组的话
        if (Array.isArray(target)) {
            result = []; // 将result赋值为一个数组，并且执行遍历
            for (let i in target) {
                // 递归克隆数组中的每一项
                result.push(deepClone(target[i]))
            }
         // 判断如果当前的值是null的话；直接赋值为null
        } else if(target===null) {
            result = null;
         // 判断如果当前的值是一个RegExp对象的话，直接赋值    
        } else if(target.constructor===RegExp){
            result = target;
        }else {
         // 否则是普通对象，直接for in循环，递归赋值对象的所有值
            result = {};
            for (let i in target) {
                result[i] = deepClone(target[i]);
            }
        }
     // 如果不是对象的话，就是基本数据类型，那么直接赋值
    } else {
        result = target;
    }
     // 返回最终结果
    return result;
}

/**
 * sheet(表格)转为workbook(工作簿)
 * @param {*} sheet 
 * @param {*} sheetName 
 * @returns 
 */
function sheet2workbook(sheet, sheetName) {
    sheetName = sheetName || 'sheet1';
    var workbook = {
        SheetNames: [sheetName],
        Sheets: {}
    };
    workbook.Sheets[sheetName] = sheet;
    return workbook;
}

/**
 * 班级名姓名 组成的数组以班级名在原位置上分割为一个对象
 * @param {Array} StudentList - 学生信息列表
 * @param {String} className - 班级名
 */
function parseStudentInfo(StudentList, className) {
    StudentList.forEach((item, index, arr) => {
        if ((typeof item.indexOf == 'function') && item.indexOf(className) > -1) {
            let clsName = item.substr(0, className.length);
            let stuName = item.substr(className.length);
            arr.splice(index, 1, { clsName: clsName, stuName: stuName });
        }
    })
}

/**
 * 设置默认选中
 * @param {Array} checkedStudentList - 经过parseStudentInfo处理之后的数据
 * @param {Array} studentSelectData  - 对应对象中选择的数据
 * @param {Array} studentList - 总的学生列表，用于剔除默认选中项
 */
function initCheckStudent(checkedStudentList, studentSelectData, studentList) {
    checkedStudentList.forEach(student => {
        if (typeof student == 'object') {
            studentSelectData.push({
                value: student.clsName + student.stuName,
                parent: student.clsName,
                children: student.stuName,
                visible: false,
                changeStudent: "",
                dataSrcType: "select",
            })
            studentList.forEach((item, index, arr) => {
                if (item.value == student.clsName) {
                    if (item.children.length > 0) {
                        item.children.forEach((item_s, index_s, arr_s) => {
                            if (item_s.value == student.stuName) {
                                arr_s.splice(index_s, 1); // 找到并删除当前已经添加的
                                if (arr_s.length == 0) {
                                    arr.splice(index, 1); // 没有子选项则删除父选项 
                                }
                            }
                        })
                    }
                }
            })
        }else if(typeof student == 'string') {
            studentSelectData.push({
                value: student,
                visible: false,
                disabled: true,
                changeStudent: "",
                dataSrcType: "input",
            })
        }
    })
}

function getUUID(param) {
    const opt = {
        node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
        clockseq: 0x1234,
        msecs: new Date().getTime(),
        nsecs: 5678,
    };
    const MY_NAMESPACE = uuidv1(opt);
    let uuid = uuidv5(param, MY_NAMESPACE);
    return uuid;
}

export {
    fnSetTreeData,
    excelToData,
    execStudentData,
    execDepartMentData,
    paramToQueryStr,
    exportExcel,
    deepClone,
    sheet2workbook,
    parseStudentInfo,
    initCheckStudent,
    execUserData,
    getUUID,
}