<template>
	<a-card>
		<div>
			<!-- 上传区域 -->
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
						<p class="ant-upload-text">导入部门数据</p>
						<p class="ant-upload-hint">
							您可以点击选择数据文件，或者直接将数据文件拖到此处来导入数据
						</p>
					</a-upload-dragger>
				</a-spin>
			</div>
			<!-- 操作区域 -->
			<a-space class="operator">
				<a-button type="primary" @click="openAddDepartment">新增部门</a-button>
				<a-dropdown>
					<a-menu @click="handleMenuClick" slot="overlay">
						<a-menu-item key="delete">删除勾选项</a-menu-item>
					</a-menu>
					<a-button> 更多操作 <a-icon type="down" /> </a-button>
				</a-dropdown>
			</a-space>
			<!-- 列表区域 -->
			<advance-table
				rowKey="id"
				title="部门列表"
				:columns="columns"
				:data-source="dataSource"
                :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
				:loading="loadDepartment"
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
					<a @click="editRecord(record.id)" style="margin-right: 8px">
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
			</advance-table>
			<!-- 新增/编辑模态框 -->
			<a-modal
				:title="modalTitle"
				:visible="visible"
				:confirm-loading="confirmSubmitLoading"
				@ok="submit"
				@cancel="closeModal"
			>
				<a-form-model ref="ruleForm" :model="modalForm" :rules="rules" :labelCol="{span: 4}" :wrapperCol="{ span: 18 }">
					<a-form-model-item label="部门名称" prop="departmentName">
						<a-input v-model="modalForm.departmentName" autocomplete="on" />
					</a-form-model-item>
				</a-form-model>
			</a-modal>
		</div>
	</a-card>
</template>

<script>
import AdvanceTable from "@/components/table/advance/AdvanceTable";
import { excelToData, execDepartMentData } from "@/utils/tools";
import { importDepartmentData,getDepartmentData,addDepartment,editDepartment,delDepartment } from "@/services/system";

const columns = [
	{
		title: "ID",
		dataIndex: "id",
		align: "center",
	},
	{
		title: "部门名称",
		dataIndex: "name",
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
			loadDepartment: false,
			dataSource: [],
			selectedRowKeys: [],
			pageSizeOptions: ["10", "30", "40", "100"],
			page: 1,
			pageSize: 10,
			total: 0,
			spinning: false,
			visible: false,
			modalTitle: "新增部门",
			isEdit: false,
			confirmSubmitLoading: false,
			modalForm: {
				departmentName: null,
			},
			rules: {
				departmentName: [{ required: true, trigger: "blur", message: "请输入部门名称！" }],	
			},
			conditions: {},
		};
	},

	created() {
		this.initTableData();
	},

	methods: {
		initTableData() {
			this.loadDepartment = !this.loadDepartment;
			getDepartmentData({ page: this.page, pageSize: this.pageSize }).then((res) => {
				let resObj = res.data;
				if (resObj.code == 1) {
					if (resObj.data.data.forEach == undefined) {
						throw Error("数据有误！");
					}
					this.total = resObj.data.total;
					this.dataSource = resObj.data.data;
					this.loadDepartment = !this.loadDepartment;
				}
			}).catch((err) => {
				throw Error(err);
			});
		},

		// 删除
		deleteRecord(id) {
			this.selectedRowKeys = []; // 先置空
			this.selectedRowKeys.push(Number(id));
			this.delDepartMent(this.selectedRowKeys);
		},

		// 编辑
		editRecord(id) {
			this.visible = true;
			this.isEdit  = true;
			this.dataSource.forEach(item => {
				if (item.id == id) {
					this.modalForm = {
						departmentName: item.name,
						id : item.id,
					};
				}
			})
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

		handleMenuClick(e) {
			console.log(e);
			if (e.key === "delete") {
				this.delDepartMent(this.selectedRowKeys);
			}
		},

		// 上传拦截
		handleUpload(file) {
			this.spinning = !this.spinning;
			excelToData(file).then((result) => {
                let departments = execDepartMentData(result);
                if (departments.length == 0) {
					this.$message.error("请检查表格数据是否为空，如不为空请检查表格格式！", 5).then(() => {
						this.spinning = !this.spinning;
						this.$refreshPage(this.$route.path);
					}).catch((err) => {
						throw Error(err);
					});
					return false;
				}
				importDepartmentData({department: departments}).then((res) => {
					let resObj = res.data;
					if(resObj.code == 1) {
						this.$message.success(resObj.msg);
					}
				}).catch((err) => {
					throw Error(err);
				}).finally(() => {
					this.spinning = !this.spinning;
					this.$refreshPage(this.$route.path);
				})
            }).catch((err) => {
                throw Error(err);
            });
			return false;
		},

		// 拖拽上传文件类型不符合
		dragError() {
			this.$message.error("请选择扩展名为.xls或.xlsx的excel文件");
		},

		// 搜索条件
		onSearch(conditions) {
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

        // 选中行改变
        onSelectChange(selectedRowKeys) {
            this.selectedRowKeys = selectedRowKeys;
        },

		// 打开模态框
		openAddDepartment() {
			this.visible = true;
		},
		
		// 关闭模态框
		closeModal() {
			this.visible = false;
			this.isEdit = false;
			this.modalForm = {
				departmentName: null 
			};
		},

		// 修改/新增
		submit() {
			this.$refs.ruleForm.validate(valid => {
				if (!valid) {
					return false;
				}
				this.confirmSubmitLoading = !this.confirmSubmitLoading;
				if (this.isEdit) {
					// 编辑模式
					if (this.modalForm.departmentName == null) {
						return false;
					}
					editDepartment({ id: this.modalForm.id, department: this.modalForm.departmentName }).then((res) => {
						let resObj = res.data;
						if (resObj.code == 1) {
							this.$message.success(resObj.msg);
						}
					}).catch((err) => {
						throw Error(err);
					}).finally(() => {
						setTimeout(() => {
							this.$refreshPage(this.$route.path);
						}, 1500);
					});
				}else{
					console.log("新增");
					// 新增
					if (this.modalForm.departmentName == null) {
						return false;
					}
					addDepartment({ department: this.modalForm.departmentName }).then((res) => {
						let resObj = res.data;
						if (resObj.code == 1) {
							this.$message.success(resObj.msg);
						}
					}).catch((err) => {
						throw Error(err);
					}).finally(() => {
						setTimeout(() => {
							this.$refreshPage(this.$route.path);							
						}, 1500);
					});
				}
			})
		},

		// 删除
		delDepartMent(ids){
			if (ids.length == undefined || ids.length == 0) {
				return false;
			}
			delDepartment({ id: ids }).then((res) => {
				let resObj = res.data;
				if(resObj.code == 1){
					this.$message.success(resObj.msg);
				}
			}).catch((err) => {
				throw Error(err);
			}).finally(() => {
				this.selectedRowKeys = [];
				setTimeout(() => {
					this.$refreshPage(this.$route.path);
				}, 1500);
			})
		}
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