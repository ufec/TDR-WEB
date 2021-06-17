<template>
	<a-card>
		<!-- 表格部分 -->
		<div>
			<a-space class="operator">
				<a-button type="primary" @click="openAddAuth">新增权限组</a-button>
			</a-space>
			<standard-table
				:columns="columns"
				:data-source="dataSource"
				:loading="authListLoading"
				rowKey="id"
				:pagination="{
					current: page,
					pageSize: pageSize,
					total: total,
					showSizeChanger: true,
					showLessItems: true,
					showQuickJumper: true,
					pageSizeOptions: ['10', '30', '40', '100'],// 每页多少条
					showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，总计 ${total} 条`,
					onChange: onPageChange, //页码改变（点击页码，点击方向控制，直接输入页码都会引起）
					onShowSizeChange: onSizeChange, //（每页展示多少条变化）
				}"
			>
				<div slot="status" slot-scope="{record}">
					<a-switch :loading="changeAuthStatusSwitchLoading" :disabled="record.id == 1" checked-children="启用" un-checked-children="禁用" :default-checked="record.status === 1" @change="changeAuthStatus(record.id, record.status)"/>
				</div>

				<div slot="action" slot-scope="{record}" v-if="record.id != 1">
					<a-button style="margin-right: 10px;" @click="setGroupAuth(record)">设置权限</a-button>
					<a-button style="margin-right: 10px;" type="primary" @click="editRecord(record.id)">编辑</a-button>
					<a-popconfirm
						title="你确定要删除此数据吗？"
						ok-text="Yes"
						cancel-text="No"
						@confirm="deleteRecord(record.id)"
					>
						<a-button type="danger">删除</a-button>
					</a-popconfirm>
				</div>
				<template slot="statusTitle">
					<a-icon @click.native="onStatusTitleClick" type="info-circle" />
				</template>
			</standard-table>
		</div>

		<!-- 新增用户模态框 -->
		<a-modal
			:title="modelTitle"
			v-model="addAuthModal"
			@ok="submit"
            @cancel="hiddenModal"
		>
            <a-form-model :model="modalForm" :labelCol="{span: 6}" :wrapperCol="{span: 17}" ref="modalFormRef">
                <a-form-model-item label="权限名称" prop="role_name" :rules="{ required: true, message: '请输入权限名称', trigger: 'blur' }">
                    <a-input v-model="modalForm.role_name" :disabled="isEdit" placeholder="请输入权限名称" />
                </a-form-model-item>
                <a-form-model-item label="权限描述" prop="role_desc" :rules="{ required: true, message: '请输入权限描述', trigger: 'blur' }">
                    <a-input v-model="modalForm.role_desc" placeholder="请输入权限描述"/>
                </a-form-model-item>
            </a-form-model>
		</a-modal>

		<!-- 设置权限模态框 -->
		<a-modal
			title="权限组权限设置"
			:visible="setGroupAuthModalShow"
			:confirm-loading="confirmSetGroupAuthLoading"
			@ok="confirmSetGroupAuth"
			@cancel="cancelSetGroupAuth"
		>
			<a-skeleton :loading="loadAuthTreeStatus" active>
				<a-tree
					v-model="checkedAuth"
					checkable
					:tree-data="authTreeData"
					:replaceFields="{title: 'name', key: 'id' }"
				/>
			</a-skeleton>
		</a-modal>
	</a-card>
</template>

<script>
import StandardTable from "@/components/table/StandardTable";
import { getAuthList,addAuth,delAuth,getSystemMenu,setAuth,getAuth } from '@/services/system';

const columns = [
    {
		title: "权限名称",
		dataIndex: "role_name",
		align: "center",
	},
    {
		title: "权限描述",
		dataIndex: "role_desc",
		align: "center",
	},
    {
		title: "权限状态",
		dataIndex: "status",
		align: "center",
        scopedSlots: { customRender: 'status' }
	},
    {
		title: "操作",
		align: "center",
		scopedSlots: { customRender: 'action' }
	},
];


export default {
	name: "QueryList",
	components: { StandardTable },
	data() {
		return {
			columns: columns, // 表格列对象
            dataSource: [], // 表格数据
            authListLoading: true, //权限加载状态
			page: 1, // 起始页码
			pageSize: 10, // 初始每页大小
			total: 0, // 数据总数
            modelTitle: "", // 新增/修改模态框名称
            addAuthModal: false, // 新增/修改模态框展示
            isEdit: false, // 新增还是修改权限
			nowEditObj: null, //正在编辑的记录
            changeAuthStatusSwitchLoading: false, // 修改权限组状态加载状态
			setGroupAuthModalShow: false, //权限组权限编辑模态框是否展示
            modalForm: {
                role_name: "",
                role_desc: "",
            }, // 表单对象 

			authTreeData: [], //权限树
			checkedAuth: [], //选中的权限
			confirmSetGroupAuthLoading: false, //确定设置权限组状态（成功后异步关闭模态框）
			loadAuthTreeStatus: true, //加载权限树
		};
	},

	created() {
        this.initTableData();
		this.initTree();
	},

	methods: {
        // 初始化权限表
        initTableData() {
            getAuthList().then((res) => {
                let resObj = res.data;
                if(resObj.code != 1){
                    this.$message.error(resObj.msg);
                    return false;
                }
                this.dataSource = this.dataSource.concat(resObj.data);
            }).catch((err) => {
                console.log(err);
            }).finally(() => {
                this.authListLoading = !this.authListLoading;
            })
        },

		// 初始化菜单树
		initTree() {
			getSystemMenu().then((res) => {
				let resObj = res.data;
				if (resObj.code != 1) {
					this.$message.error(resObj.msg);
					return false;
				}
				this.authTreeData = resObj.data;
			}).catch((err) => {
				console.log(err);
			})
		},

        // 打开新增权限模态框
        openAddAuth() {
            this.modelTitle = "新增权限组";
            this.addAuthModal = !this.addAuthModal;
        },

        // 编辑权限模态框
        editRecord(id) {
            this.modelTitle = "编辑权限组";
            this.isEdit = true;
            this.addAuthModal = !this.addAuthModal;
			let modalFormRes = this.dataSource.filter(res => {
				if (res.id == id) {
					return res;
				}
			});
            this.modalForm = modalFormRes[0];
        },

        // 删除权限
        deleteRecord(id) {
			delAuth({id: id}).then((res) => {
				let resObj = res.data;
				if(resObj.code != 1){
					return this.$message.error(resObj.msg);
				}else{
					return this.$message.success(resObj.msg);
				}
			}).catch((err) => {
				console.log(err);
			}).finally(() => {
				this.$refreshPage(this.$route.fullPath);
			})
        },

        // 切换页码
		onPageChange(page, pageSize) {
			console.log("页码改变回调");
			this.page = page
			this.pageSize = pageSize
		},

        // 切换每页数据量大小
		onSizeChange(current, size) {
			console.log("pageSize变化回调");
			this.page = 1
			this.pageSize = size
		},

        // 改变权限状态
        changeAuthStatus(id, status) {
            this.changeAuthStatusSwitchLoading = !this.changeAuthStatusSwitchLoading;
            let change = status === 1 ? 0 : 1;
            addAuth({ id: id, status: change}).then((res) => {
                let resObj = res.data;
                if(resObj.code != 1){
                    this.$message.error(resObj.msg);
                    return false;
                }
                this.$message.success(resObj.msg);
            }).catch((err) => {
                console.log(err);
            }).finally(() => {
                this.changeAuthStatusSwitchLoading = !this.changeAuthStatusSwitchLoading;
                this.$refreshPage(this.$route.fullPath);
            });
        },

        // 隐藏Modal
        hiddenModal() {
            this.modalForm = {
                role_name: "",
                role_desc: "",
            }
            this.modelTitle = "";
            this.addAuthModal = false;
            this.isEdit = false;
        },

        // 提交
        submit() {
            this.$refs.modalFormRef.validate(valid => {
				if (!valid) {
					return false;
				}
                addAuth(this.modalForm).then((res) => {
                    let resObj = res.data;
                    if(resObj.code != 1){
                        this.$message.error(resObj.msg);
                        return false;
                    }
                    this.$message.success(resObj.msg);
                }).catch((err) => {
                    console.log(err);
                }).finally(() => {
                    this.hiddenModal();
                    this.$refreshPage(this.$route.fullPath);
                })
            });
        },

		// 设置权限组权限
		setGroupAuth(record) {
			this.loadHasAuth(record.id);
			this.setGroupAuthModalShow = !this.setGroupAuthModalShow;
			this.nowEditObj = record;
		},

		// 确定设置权限
		confirmSetGroupAuth() {
			this.confirmSetGroupAuthLoading = !this.confirmSetGroupAuthLoading;
			setAuth({id: this.nowEditObj.id, auth: this.checkedAuth}).then((res) => {
				let resObj = res.data;
				if (resObj.code != 1) {
					return this.$message.error(resObj.msg);
				}else{
					return this.$message.success(resObj.msg);
				}
			}).catch((err) => {
				console.log(err);
			}).finally(() => {
				this.checkedAuth = [];
				this.confirmSetGroupAuthLoading = !this.confirmSetGroupAuthLoading;
				this.cancelSetGroupAuth();
			});
		},

		// 取消设置权限
		cancelSetGroupAuth() {
			this.setGroupAuthModalShow = !this.setGroupAuthModalShow;
			this.nowEditObj = null;
		},

		// 加载已有的权限
		loadHasAuth(id) {
			getAuth({id: id}).then((res) => {
				let resObj = res.data;
				if(resObj.code == 1) {
					for (let i = 0; i < resObj.data.length; i++) {
						resObj.data[i] = Number(resObj.data[i]);
					}
					this.checkedAuth = resObj.data;
				}
			}).catch((err) => {
				throw Error(err);
			}).finally(() => {
				this.loadAuthTreeStatus = false;
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