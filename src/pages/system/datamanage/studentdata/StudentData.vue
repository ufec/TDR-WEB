<template>
	<a-card>
		<!-- 表格部分 -->
		<div>
			<div class="uploadDragger">
				<a-spin :spinning="spinning" tip="数据导入中">
					<a-upload-dragger
						name="excel"
						accept=".xls,.xlsx"
						@reject="dragError"
						:before-upload="handleUpload"
					>
						<p class="ant-upload-drag-icon">
							<a-icon type="inbox" />
						</p>
						<p class="ant-upload-text">导入学生数据</p>
						<p class="ant-upload-hint">
							您可以点击选择数据文件，或者直接将数据文件拖到此处来导入数据
						</p>
					</a-upload-dragger>
				</a-spin>
			</div>
			<a-space class="operator">
				<a-button type="primary" @click="addStudent">新增学生</a-button>
				<a-button type="danger" @click="delAllChecked" v-if="selectedRowKeys.length > 0">删除勾选项</a-button>
				<a-dropdown>
					<a-menu @click="handleMenuClick" slot="overlay">
						<a-menu-item v-for="item in grades" :key="item">删除{{item}}级</a-menu-item>
					</a-menu>
					<a-button> 更多操作 <a-icon type="down" /> </a-button>
				</a-dropdown>
			</a-space>
			<advance-table
				rowKey="id"
				title="学生数据列表"
				:columns="columns"
				:data-source="dataSource"
				:row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
				:loading="studentLoadStatus"
				@change="onChange"
				@reset="onReset"
				@refresh="onRefresh"
				@search="onSearch"
				:pagination="{
					current: page,
					pageSize: pageSize,
					total: total,
					showSizeChanger: true,
					showLessItems: true,
					showQuickJumper: true,
					pageSizeOptions: pageSizeOptions, // 每页多少条
					showTotal: (total, range) =>
						`第 ${range[0]}-${range[1]} 条，总计 ${total} 条`,
					onChange: onPageChange, //页码改变（点击页码，点击方向控制，直接输入页码都会引起）
					onShowSizeChange: onSizeChange, //（每页展示多少条变化）
				}"
			>
				<span slot="action" slot-scope="{ record }">
					<a @click="editRecord(record)" style="margin-right: 8px">
						<a-icon type="edit" />编辑
					</a>
					<a-popconfirm
						title="确定要删除吗？"
						ok-text="Yes"
						cancel-text="No"
						@confirm="deleteRecord(record.id)"
					>
						<a > <a-icon type="delete" />删除</a>
					</a-popconfirm>
				</span>
				<template slot="sex" slot-scope="{ text }">
					{{ text ? "男" : "女" }}
				</template>
			</advance-table>
			<a-modal
				:title="modalTitle"
				:visible="visible"
				:confirm-loading="confirmAddStudent"
				@ok="submitAdd"
				@cancel="closeModal"
			>
				<a-form-model ref="modalForm" :model="modalForm" :rules="rules" :labelCol="{span: 4}" :wrapperCol="{ span: 18 }">
					<a-form-model-item label="学院名称" prop="college">
						<a-select 
							v-model="modalForm.college" 
							placeholder="请选择学院" 
							:allowClear="true" 
							:showSearch="true" 
							:options="college" 
							:getPopupContainer="(triggerNode) => triggerNode.parentNode" 
							optionFilterProp="title"
							@select="selectCollege"
						/>
					</a-form-model-item>
					<a-form-model-item label="班级名称" prop="class">
						<a-select
							v-model="modalForm.class"
							placeholder="请选择班级"
							notFoundContent="请先选择学院"
							:allowClear="true" 
							:showSearch="true" 
							:options="classList" 
							:getPopupContainer="(triggerNode) => triggerNode.parentNode"
							optionFilterProp="title"
						/>
					</a-form-model-item>
					<a-form-model-item label="学生姓名" prop="name">
						<a-input v-model="modalForm.name" autocomplete="on" />
					</a-form-model-item>
					<a-form-model-item label="学生性别" prop="sex">
						<a-radio-group v-model="modalForm.sex" :default-value="modalForm.sex" button-style="solid">
							<a-radio-button value="男" style="width: 100px; text-align:center;">男</a-radio-button>
							<a-radio-button value="女" style="width: 100px; text-align:center;">女</a-radio-button>
						</a-radio-group>				
					</a-form-model-item>
					<a-form-model-item label="学生学号" prop="stu_num">
						<a-input v-model="modalForm.stu_num" autocomplete="on" />
					</a-form-model-item>
					<a-form-model-item label="学生年级" prop="grade">
						<a-input v-model="modalForm.grade" autocomplete="on" />
					</a-form-model-item>
				</a-form-model>
			</a-modal>
		</div>
	</a-card>
</template>

<script>
import AdvanceTable from "@/components/table/advance/AdvanceTable";
import { excelToData, execStudentData } from "@/utils/tools";
import { importStudentData, getStudentDataList, getAllCollege, getAllClass,addStudent,editStudent,delStudent } from "@/services/system";

const columns = [
	{
		title: "姓名",
		searchAble: true,
		dataIndex: "name",
		align: "center",
	},
	{
		title: "性别",
		dataIndex: "sex",
		align: "center",
		searchAble: true,
		dataType: "boolean",
		scopedSlots: { customRender: "sex" },
		search: {
			switchOptions: {
				checkedText: "男",
				uncheckedText: "女",
			},
		},
	},
	{
		title: "班级",
		dataIndex: "info.name",
		align: "center",
	},
	{
		title: "年级",
		dataIndex: "grade",
		align: 'center',
	},
	{
		title: "学号",
		dataIndex: "stu_num",
		searchAble: true,
		align: "center",
	},
	{
		title: "学院",
		dataIndex: "info.college.name",
		align: "center",
	},
	{
		title: "操作",
		align: "center",
		scopedSlots: { customRender: "action" },
	},
];

export default {
	components: { AdvanceTable },
	data() {
		return {
			advanced: true,
			columns,
			studentLoadStatus: false,
			dataSource: [],
			selectedRowKeys: [],
			pageSizeOptions: ["10", "30", "40", "100"],
			page: 1,
			pageSize: 10,
			total: 500,
			spinning: false,
			conditions: {},
			grades: [],
			modalTitle: "新增学生",
			visible: false,
			isEdit: false,
			confirmAddStudent: false,
			modalForm: {
				college: null,
				class: null,
				name: null,
				sex: null,
				stu_num: null,
				grade: null
			},
			rules: {
				college: [{ required: true, message: "请选择学院！", trigger: 'blur'}],
				class: [{ required: true, message: "请选择班级！", trigger: 'blur'}],
				name: [{ required: true, message: "请输入学生姓名！", trigger: 'blur'}],
				sex: [{ required: true, message: "请选择性别！", trigger: 'blur'}],
				stu_num: [{ required: true, message: "请输入学号！", trigger: 'blur'}],
				grade: [{ required: true, message: "请输入年级！", trigger: 'blur'}],
			},
			college: [], // 学院列表
			classList: [], // 班级列表
			tempClassList: [], // 班级列表
		};
	},

	created() {
		this.initTableData();
		this.initCollegeAndClass();
	},

	methods: {
		// 初始化表格
		initTableData() {
			this.studentLoadStatus = !this.studentLoadStatus;
			getStudentDataList({ page: this.page, pageSize: this.pageSize, ...this.conditions }).then((res) => {
				if (res.status != 200) {
					this.$message.error("数据获取失败！");
					return false;
				}
				let resObj = res.data;
				if (resObj.code != 1) {
					this.$message.error(resObj.msg);
					return false;
				}
				if (resObj.data.data.studentList.length == 0) {
					this.$message.warn("空数据！");
					return false;
				}
				this.total = resObj.data.total;
				let studentList = resObj.data.data.studentList;
				let classList = resObj.data.data.classList;
				let collegeList = resObj.data.data.collegeList;
				classList.find(function (classItem) {
					classItem.college = collegeList.find(function (collegeItem) {
						if (collegeItem.id == classItem.college_id) {
							return collegeItem;
						}
					});
				});
				studentList.find(function (studentItem) {
					studentItem.info = classList.find(function (classItem) {
						if (classItem.id == studentItem.class) {
							return classItem;
						}
					});
				});
				this.grades = resObj.data.grades;
				this.dataSource = studentList;
			}).catch((err) => {
				this.$message.error(err);
				return false;
			}).finally(() => {
				setTimeout(() => {
					this.studentLoadStatus = !this.studentLoadStatus;
				}, 1500);
			})
		},

		// 获取所有学院和班级
		initCollegeAndClass() {
			getAllCollege().then((res) => {
				if (res.data.code == 1) {
					this.college = res.data.data.map(item => {
						return {key: item.id, title: item.name, disabled:false};
					});
				}
			}).catch((err) => {
				throw Error(err);
			});
			getAllClass().then((res) => {
				if (res.data.code == 1) {
					const temp = res.data.data.map(item => {
						return {
							key: item.id, 
							title: item.name,
							disabled:false,
							college: item.college_id
						};
					});
					this.$set(this, "tempClassList", temp);
					this.$set(this, "classList", temp);
				}
			}).catch((err) => {
				throw Error(err);
			});
		},

		// 删除
		deleteRecord(id) {
			this.selectedRowKeys = [];
			this.selectedRowKeys.push(id);
			this.deleteStudent(this.selectedRowKeys);
		},

		// 编辑
		editRecord(record) {
			this.visible = true;
			this.isEdit = true;
			this.modalForm = {
				id: record.id,
				college: record.info.college.id,
				class: record.class,
				name: record.name,
				sex: record.sex,
				stu_num: record.stu_num,
				grade: record.grade
			};
		},

		// 切换页码
		onPageChange(page, pageSize) {
			this.page = page;
			this.pageSize = pageSize;
		},

		// 切换每页大小
		onSizeChange(current, size) {
			this.page = 1;
			this.pageSize = size;
		},

		// 表格状态改变
		onChange() {
			this.initTableData();
		},

		// 更多操作选项
		handleMenuClick(e) {
			let grade = e.key;
			if(typeof grade == "number"){
				this.deleteStudent({grade: grade});
			}
			
		},

		// 选中行改变
		onSelectChange(selectedRowKeys) {
			this.selectedRowKeys = selectedRowKeys;
		},

		// 上传拦截
		handleUpload(file) {
			this.spinning = !this.spinning;
			excelToData(file).then((result) => {
				let studentObj = execStudentData(result);
				if (studentObj.length == 0) {
					this.$message.error("请检查表格数据是否为空，如不为空请检查表格格式！", 5).then(() => {
						this.spinning = !this.spinning;
						this.$refreshPage(this.$route.path);
					}).catch((err) => {
						throw Error(err);
					});
					return false;
				}
				importStudentData(studentObj).then((res) => {
					let resObj = res.data;
					if (resObj.code == 1) {
						this.$message.success(resObj.msg ? resObj.msg : resObj.message);
					}
					this.spinning = !this.spinning;
					this.$refreshPage(this.$route.path);
				}).catch((err) => {
					throw Error(err);
				});
			}).catch((err) => {
				throw Error(err);
			});
			return false;
		},

		// 新增学生
		addStudent() {
			this.visible = true;
			this.classList = [];
		},

		// 拖拽上传文件类型不符合
		dragError() {
			this.$message.error("请选择扩展名为.xls或.xlsx的excel文件");
		},

		// 搜索条件
		onSearch(conditions) {
			if (conditions.sex != undefined) {
				conditions.sex = conditions.sex ? "男" : "女";
			}
			if (conditions.stu_num != undefined) {
				conditions.stu_num = Number(conditions.stu_num);
			}
			this.conditions = conditions;
			this.initTableData();
		},

		// 刷新表格
		onRefresh(conditions) {
			this.conditions = conditions;
			this.initTableData();
		},

		// 重置表格
		onReset(conditions) {
			this.conditions = conditions;
			this.initTableData();
		},

		// 关闭模态框
		closeModal() {
			this.visible = false; // 关闭模态框
			this.isEdit = false; // 关闭编辑模式
			this.modalForm = {
				college: null,
				class: null,
				name: null,
				sex: null,
				stu_num: null,
				grade: null
			}; // 模态框表单初始化
		},

		// 选中学院
		selectCollege(value) {
			let temp = [];
			this.tempClassList.forEach(item => {
				if(item.college == value){
					temp.push(item);
				}
			});
			this.$set(this, "classList", temp);
		},

		// 删除选中项
		delAllChecked() {
			if (this.selectedRowKeys.length > 0) {
				this.deleteStudent(this.selectedRowKeys);
			}
		},

		// 新增/编辑学生
		submitAdd() {
			this.$refs.modalForm.validate(valid => {
				if(!valid){
					return false;
				}
				this.modalForm.stu_num = Number(this.modalForm.stu_num);
				this.modalForm.grade = Number(this.modalForm.grade);
				if (this.isEdit) {
					// 编辑模式
					editStudent(this.modalForm).then((res) => {
						let resObj = res.data;
						if(resObj.code == 1){
							this.$message.success(res.msg);
						}
					}).catch((err) => {
						throw Error(err);
					}).finally(() => {
						this.closeModal();
					})
				}else{
					addStudent(this.modalForm).then((res) => {
						let resObj = res.data;
						if (resObj.code == 1) {
							this.$message.success(resObj.msg);
						}
					}).catch((err) => {
						throw Error(err);
					}).finally(() => {
						this.closeModal();
					})
				}
			})
		},

		// 执行删除
		deleteStudent(args){
			let param = {};
			if (args instanceof Array) {
				param['ids'] = args;
			}else if(args instanceof Object){
				param = args
			}
			this.selectedRowKeys = [];
			delStudent(param).then((res) => {
				if (res.data.code == 1) {
					this.$message.success(res.data.msg);
				}
			}).catch((err) => {
				throw Error(err);
			}).finally(() => {
				this.$refreshPage(this.$route.path);
			});
		},
	},
};
</script>

<style lang="less" scoped>
	.search {
		margin-bottom: 54px;
	}
	.fold {
		width: calc(100% - 216px);
		display: inline-block;
	}
	.operator {
		margin-bottom: 18px;
	}
	@media screen and (max-width: 900px) {
		.fold {
			width: 100%;
		}
	}
	.uploadDragger {
        margin-bottom: 18px;
    }
</style>