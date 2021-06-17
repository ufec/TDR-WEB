<template>
    <a-card title="年度教学配置" width="100%">
        <a-form-model ref="ruleForm" :model="form" :labelCol="{ span: 4 }" :wrapperCol="{ span: 14 }" :rules="rules">
            <a-form-model-item label="学期课程" prop="inputCourse">
                <a-input v-model="form.inputCourse" placeholder="输入本学期授课课程，多个用逗号隔开"/>
            </a-form-model-item>

            <a-form-model-item label="学期班级" prop="checkedClass">
                <a-select
                    mode="multiple"
                    label-in-value
					:filter-option="false"
                    placeholder="请选择本学期授课班级"
                    style="width: 100%"
                    v-model="form.checkedClass"
                    :not-found-content="fetching ? undefined : null"
                    @search="autoSearch"
                >
                    <a-spin v-if="fetching" slot="notFoundContent" size="small" />
                    <a-select-option v-for="item in searchClassData" :key="item.value" :value="item.id">
                        {{ item.text }}
                    </a-select-option>
                </a-select>
            </a-form-model-item>

            <a-form-model-item label="学期班主任" prop="inputHeaderTeacher">
                <a-input v-model="form.inputHeaderTeacher" placeholder="输入本学期班主任，多个用逗号隔开"/>
            </a-form-model-item>

            <a-form-model-item label="我的部门" prop="department">
                <a-select 
                    v-model="form.department" 
                    placeholder="选择您所属的部门！" 
                    :allowClear="true" 
                    :showSearch="true" 
                    :options="departmentList" 
                    :getPopupContainer="(triggerNode) => triggerNode.parentNode" 
                    optionFilterProp="title"
                />
            </a-form-model-item>

            <!-- 操作按钮 -->
            <a-form-model-item :wrapperCol="{span: 14, offset: 4}">
                <a-button size="large" type="danger" block @click="submit">保存设置</a-button>
            </a-form-model-item>
        </a-form-model>
    </a-card>
</template>
<script>

import debounce from 'lodash/debounce';
import {getClassList, setTeacherConfig, getTeacherConfig, getAllDepartment} from '@/services/daily';

export default {
    data() {
        this.autoSearch = debounce(this.autoSearch, 800);
        return {
            fetching: false,
            searchClassData: [], // 搜索的班级列表
            selectData: [], // 选择的班级数据
            departmentList: [], // 部门列表
            user: null,
            form:{
                checkedClass: [],
                inputCourse: "",
                inputHeaderTeacher: "",
                department: "",
            },
            rules: {
                inputCourse: [{ required: true, message: '请输入本学期课程名称，多门课程用,隔开', trigger: 'blur' }],
                inputHeaderTeacher: [{ required: true, message: '请输入本学期班主任，多门课程用,隔开', trigger: 'blur' }],
                checkedClass: [{ type: 'array', required: true, message: "请选择本学期班主任", trigger: 'change' }],
                department: [{required: true, message: "请选择部门！", trigger: 'blur'}],
            },
        }
    },

    created() {
        this.user = this.$store.state.account.user;
        this.getDepartment();
        this.initPage();
    },

    computed: {
        filteredCheckedClass() {
            return this.searchClassData.filter(o => !this.form.checkedClass.includes(o));
        },
    },

    methods: {
        //初始化界面
        initPage() {
            getTeacherConfig(this.user.id).then((res) => {
                let resObj = res.data;
                this.form.inputHeaderTeacher = resObj.data.head_teacher;
                this.form.inputCourse = resObj.data.course_name;
                this.form.checkedClass = resObj.data.class_name.map(item => {
                    item.label = item.text;
                    return item;
                });
                this.form.department = resObj.data.department;
            }).catch((err) => {
                throw Error(err);
            });
        },

        // 获取部门数据
        getDepartment() {
            getAllDepartment().then((res) => {
                let resObj = res.data;
                if (resObj.code == 1) {
                    resObj.data.forEach(item => {
                        this.departmentList.push({
                            title: item.name,
                            value: item.name
                        });
                    });
                }
            }).catch((err) => {
                throw Error(err);
            });
        },

        // 自动补全
        autoSearch(name) {
            this.fetching = true;
            this.searchClassData = [];
            getClassList(name).then(res => {
                let resObj = res.data;
                if (resObj.code == 1) {
                    const data = resObj.data.map(el => ({
                        text: el.name,
                        value: el.name,
                        id: el.id
                    }));
                    this.searchClassData = data;
                    this.fetching = false;
                }
            }).catch(err => {
                throw new Error(err);
            });
        },

        // 保存配置项
        submit() {
            this.$refs.ruleForm.validate(valid => {
                if (!valid) {
                    return false;
                }
                let courseArr = this.form.inputCourse.split(/、|,| |，/);
                courseArr.forEach((item, index) => {
                    if (!item) {
                        courseArr.splice(index, 1);
                    }
                });
                let headerMasterArr = this.form.inputHeaderTeacher.split(/、|,| |，/);
                headerMasterArr.forEach((item, index) => {
                    if (!item) {
                        headerMasterArr.splice(index, 1);
                    }
                });
                let classKey = this.form.checkedClass.map(e => { return e.key });

                setTeacherConfig({ teacherId: this.user.id, course: courseArr, headmaster: headerMasterArr, className: classKey, department: this.form.department }).then(() => {
                    this.$message.success("保存成功，稍等自动跳转", () => {
                        this.$refreshPage(this.$route.fullPath);
                    });
                }).catch(err => {
                    throw new Error(err);
                })
            });
        }
    }
}
</script>

<style>

</style>