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
						<p class="ant-upload-text">导入用户数据</p>
						<p class="ant-upload-hint">
							您可以点击选择数据文件，或者直接将数据文件拖到此处来导入数据
						</p>
					</a-upload-dragger>
				</a-spin>
			</div>
			<a-space class="operator">
				<a-button type="primary" @click="openAddUserModel">新增用户</a-button>
				<a-dropdown>
					<a-menu @click="handleMenuClick" slot="overlay">
						<a-menu-item key="delete">删除勾选项</a-menu-item>
					</a-menu>
					<a-button> 更多操作 <a-icon type="down" /> </a-button>
				</a-dropdown>
			</a-space>
			<advance-table
				:columns="columns"
				title="用户列表"
				:data-source="dataSource"
				:row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
				:loading="userListLoading"
				rowKey="id"
				@change="onChange"
				@refresh="onRefresh"
				@search="onSearch"
				:pagination="{
					current: page,
					pageSize: pageSize,
					total: total,
					showSizeChanger: true,
					showLessItems: true,
					showQuickJumper: true,
					pageSizeOptions: ['10', '30', '50', '100'],// 每页多少条
					showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，总计 ${total} 条`,
					onChange: onPageChange, //页码改变（点击页码，点击方向控制，直接输入页码都会引起）
					onShowSizeChange: onSizeChange, //（每页展示多少条变化）
				}"
			>
				<div slot="status" slot-scope="{record}">
					<a-switch :loading="changeUserStatusSwitchLoading" checked-children="启用" un-checked-children="禁用" :disabled="record.id == 1" :default-checked="record.status === 1" @change="changeStatus(record.id, record.status)"/>
				</div>
				<span slot="action" slot-scope="{record}" v-if="record.id != 1">
					<a @click="editRecord(record.id)" style="margin-right: 8px"> <a-icon type="edit" />编辑</a>
					<a-popconfirm
						title="确定要删除吗？"
						ok-text="Yes"
						cancel-text="No"
						@confirm="deleteRecord(record.id)"
					>
						<a > <a-icon type="delete" />删除</a>
					</a-popconfirm>
				</span>
			</advance-table>
		</div>

		<!-- 新增用户模态框 -->
		<a-modal
			:title="modelTitle"
			v-model="addUserModel"
			@ok="submitUser"
			@cancel="hidenModal"
		>
			<a-skeleton :loading="skeletonLoad" active>
				<a-form-model :model="modalForm" :labelCol="{span: 4}" :wrapperCol="{span: 15}" ref="modalFormRef">
					<a-form-model-item label="用户名" prop="username" :rules="{ required: true, message: '请输入用户名', trigger: 'blur' }">
						<a-input v-model="modalForm.username" placeholder="请输入用户名" />
					</a-form-model-item>
					<a-form-model-item label="密码" prop="password" :rules="isEdit ? {} : { required: true, message: '请输入密码', trigger: 'blur' }">
						<a-input v-model="modalForm.password" placeholder="请输入密码"/>
					</a-form-model-item>
					<a-form-model-item label="姓名" prop="nick_name" :rules="isEdit ? {} : { required: true, message: '请输入姓名', trigger: 'blur' }">
						<a-input v-model="modalForm.nick_name" placeholder="请输入姓名"/>
					</a-form-model-item>
					<a-form-model-item label="权限组" prop="checkPermissionGroup">
						<a-checkbox-group v-model="modalForm.checkPermissionGroup">
							<a-checkbox v-for="item in permissionGroup" :value="item.id" :key="item.id">{{item.role_desc}}</a-checkbox>
						</a-checkbox-group>
					</a-form-model-item>
				</a-form-model>
			</a-skeleton>
		</a-modal>
	</a-card>
</template>

<script>
import AdvanceTable from "@/components/table/advance/AdvanceTable";
import { excelToData, execUserData } from "@/utils/tools";
import { getUserList,getAuthList,addUser,editUser,delUser,changeUserStatus,importUserData } from '@/services/system';
import moment from 'moment';

const columns = [
	{
		title: "编号",
		dataIndex: "username",
		searchAble: true,
		align: "center",
	},
	{
		title: "姓名",
		dataIndex: "nick_name",
		searchAble: true,
		align: "center",
	},
	{
		title: "状态",
		dataIndex: "status",
		align: "center",
		searchAble: true,
		dataType: "boolean",
		scopedSlots: { customRender: 'status' },
		search: {
			switchOptions: {
				checkedText: "启用",
				uncheckedText: "禁用",
			},
		},
	},
	{
		title: "新增时间",
		dataIndex: "add_time",
		align: "center",
		sorter: true,
		customRender: (e) => moment(Number(e)).format('YYYY-MM-DD HH:mm:ss'),
	},
	{
		title: "最后登录时间",
		dataIndex: "last_login_time",
		align: "center",
		sorter: true,
		customRender: (e) => e ? moment(Number(e)).format('YYYY-MM-DD HH:mm:ss') : "还未登录",
	},
	{
		title: "登录IP",
		dataIndex: "last_login_ip",
		align: "center",
		sorter: true,
		customRender: (e) => e ? e : "还未登录",
	},
	{
		title: "操作",
		align: "center",
		scopedSlots: { customRender: 'action' }
	},
];

export default {
	components: { AdvanceTable },
	data() {
		return {
			columns,
			userListLoading: false,
			dataSource: [],
			selectedRowKeys: [],
			page: 1,
			pageSize: 10,
			total: 0,
			spinning: false,
			addUserModel: false, // 新增用户模态框状态
			modelTitle: "",
			modalForm: {
				username: "",
				password: "",
				nick_name: "", //姓名
				checkPermissionGroup: [], // 选中的权限组
			}, // 模态框表单
			skeletonLoad: true,
			permissionGroup: null, // 权限组
			changeUserStatusSwitchLoading: false,// 改变用户状态switch的状态
			isEdit: false, // 编辑用户模式
			conditions: {},
		};
	},

	created() {
        this.initTable();
	},

	methods: {
        initTable() {
			this.userListLoading = !this.userListLoading;
            getUserList({ page: this.page, pageSize:this.pageSize, ...this.conditions }).then((res) => {
				let resObj = res.data;
				if (resObj.code == 1) {
					this.dataSource = resObj.data.user_list;
					this.total = resObj.data.total;
				}
			}).catch((err) => {
				throw new err;
			}).finally(() => {
				this.userListLoading = !this.userListLoading;
			});
        },
	
		// 删除
		deleteRecord(id) {
			if (this.selectedRowKeys.indexOf(id) < 0) {
				this.selectedRowKeys.push(id);
			}
			this.delRecord(this.selectedRowKeys);
		},

		delRecord(ids) {
			if (typeof ids != "object" || ids.length == 0) {
				return false;
			}
			delUser({id: ids}).then((res) => {
				let resObj = res.data;
				if(resObj.code == 1){
					this.$message.success(resObj.msg, 1.5, () => {
						this.modelTitle = "";
						this.addUserModel = false;
						this.$refreshPage(this.$route.fullPath);
					})
				}
			}).catch((err) => {
				throw Error(err);
			});
		},

		// 编辑
		editRecord(id) {
			const user = this.dataSource.find(item => {
				if (item.id == id) {
					return item;
				}
			})
			if (user) {
				this.isEdit = true;
				this.modelTitle = "编辑用户";
				// this.$set(this.modalForm, 'username', user.username);
				this.modalForm.username = user.username;
				this.modalForm.nick_name = user.nick_name;
				this.modalForm.id = user.id;
				let roleArr = user.role_id.split(",");
				for (let i = 0; i < roleArr.length; i++) {
					roleArr[i] = parseInt(roleArr[i]);
				}
				this.$set(this.modalForm, 'checkPermissionGroup', roleArr);
				this.addUserModel = !this.addUserModel;
				if (this.addUserModel) {
					this.getEnableAuthList();
				}
			}
		},

		// 切换页码
		onPageChange(page, pageSize) {
			this.page = page
			this.pageSize = pageSize
		},

		// 每页大小切换
		onSizeChange(current, size) {
			this.page = 1
			this.pageSize = size
		},

		// 页面改变
		onChange() {
			this.initTable();
		},

		// 点击下拉选项
		handleMenuClick(e) {
			if (e.key === "delete") {
				this.delRecord(this.selectedRowKeys);
			}
		},

		// 打开新增用户模态框
		openAddUserModel() {
			this.modelTitle = "新增用户";
			this.addUserModel = !this.addUserModel;
			if (this.addUserModel) {
				this.getEnableAuthList();
			}
		},

		// 获取已启用的权限组
		getEnableAuthList() {
			if(this.permissionGroup == null){
				getAuthList({ status: 1}).then((res) => {
					if (res.status != 200) {
						return false;	
					}
					let resObj = res.data;
					if(resObj.code == 1){
						this.permissionGroup = resObj.data;
					}
				}).catch((err) => {
					console.log(err);
				}).finally(() => {
					this.skeletonLoad = false;
				})
			}else{
				this.skeletonLoad = false;
			}
		},

		// 新增/修改
		submitUser() {
			this.$refs.modalFormRef.validate(valid => {
				if (!valid) {
					return false;
				}
				if (this.isEdit && this.modalForm.id != undefined && typeof this.modalForm.id == "number") {
					// 修改
					editUser(this.modalForm).then((res) => {
						let resObj = res.data;
						if(resObj.code == 1){
							this.$message.success(resObj.msg, 1.5, () => {
								this.modelTitle = "";
								this.addUserModel = false;
								this.$refreshPage(this.$route.fullPath);
							})
						}
					}).catch((err) => {
						throw Error(err);
					});
				}else{
					// 新增
					addUser(this.modalForm).then(res => {
						let resObj = res.data;
						if(resObj.code == 1){
							this.$message.success(resObj.msg, 1.5, () => {
								this.modelTitle = "";
								this.addUserModel = false;
								this.$refreshPage(this.$route.fullPath);
							})
						}
					}).catch(err => {
						throw Error(err);
					})
				}
			});
		},

		// 修改用户状态
		changeStatus(id, status){
			let change = status == 1 ? 0 : 1;
			// 直接这样写会导致列表所有开关处于加载态，但好处也显而易见（防止用户点击多个）
			this.changeUserStatusSwitchLoading = !this.changeUserStatusSwitchLoading;
			changeUserStatus({ id: id, status: change }).then((res) => {
				let resObj = res.data;
				if (resObj.code == 1) {
					this.$message.success(resObj.msg);
				}
			}).catch((err) => {
				console.log(err);
			}).finally(() => {
				this.changeUserStatusSwitchLoading = !this.changeUserStatusSwitchLoading;
				this.$refreshPage(this.$route.fullPath);
			});
		},

		// 刷新按钮
		onRefresh() {
			this.initTable();
		},

		// 隐藏模态框
		hidenModal() {
			this.modelTitle = "";
			this.modalForm = {
				username: "",
				password: "",
				checkPermissionGroup: []
			};
			this.skeletonLoad = true;
			this.isEdit = false
		},

		// 选中行改变
		onSelectChange(selectedRowKeys) {
			this.selectedRowKeys = selectedRowKeys;
		},

		// 拖拽上传文件类型不符合
		dragError() {
			this.$message.error("请选择扩展名为.xls或.xlsx的excel文件");
		},

		// 上传拦截
		handleUpload(file) {
			this.spinning = !this.spinning;
			excelToData(file).then((result) => {
				let studentObj = execUserData(result);
				if (studentObj.length == undefined || studentObj.length == 0) {
					this.$message.error("请检查表格数据是否为空，如不为空请检查表格格式！", 5).then(() => {
						this.spinning = !this.spinning;
						this.$refreshPage(this.$route.path);
					}).catch((err) => {
						throw Error(err);
					});
					return false;
				}
				importUserData(studentObj).then((res) => {
					if (res.data.code == 1) {
						this.$message.success(res.data.msg);
					}
				}).catch((err) => {
					throw Error(err);
				})
			}).catch((err) => {
				throw Error(err);
			}).finally(() => {
				this.spinning = !this.spinning;
				this.$refreshPage(this.$route.path);
			});
			return false;
		},

		// 表格搜索指定内容
		onSearch(conditions) {
			this.conditions = conditions;
			if (conditions.status != undefined) {
				conditions.status = conditions.status ? 1 : 0;
			}
			if (conditions.status || conditions.username || conditions.nick_name) {
				this.page = 1;
				this.pageSize = 10;
			}
			this.initTable();
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