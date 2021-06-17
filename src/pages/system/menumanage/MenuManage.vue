<template>
	<div class="container">
		<a-card>
			<a-space class="operator">
				<a-button type="primary" @click="addMenu">新增菜单</a-button>
				<a-button type="primary" @click="refreshMenuList">刷新菜单</a-button>
			</a-space>
			<a-table
				:columns="columns" 
				:data-source="dataSource"
				:loading="loadTable"
				rowKey="id"
			>
				<span slot="actions" slot-scope="record">
					<a @click="editMenu(record)" style="margin-right: 8px"> <a-icon type="edit" />编辑 </a>
					<a-popconfirm
						title="确定要删除吗？"
						ok-text="Yes"
						cancel-text="No"
						@confirm="deleteMenu(record)"
					>
						<a > <a-icon type="delete" />删除</a>
					</a-popconfirm>
				</span>
			</a-table>
			<a-modal v-model="showModal" :title="modalTitle" @cancel="closeModal" @ok="submitMenu" :confirm-loading="confirmLoading">
				<a-form-model :model="menuModel" :labelCol="{span: 4}" :wrapperCol="{span: 15}" ref="modalFormRef">
					<a-form-model-item label="菜单名称" prop="name" :rules="{required: true, message: '请输入菜单名称！', trigger: 'blur'}">
						<a-input placeholder="请输入菜单名称" v-model="menuModel.name" />
					</a-form-model-item>
					<a-form-model-item label="菜单类型" prop="type">
						<a-radio-group button-style="solid" :value="menuModel.type" name="type" @change="changeMenuType" :disabled="isEdit">
							<a-radio-button :value="0">顶级菜单</a-radio-button>
							<a-radio-button :value="1">二级菜单</a-radio-button>
							<a-radio-button :value="2">页内按钮</a-radio-button>
						</a-radio-group>
					</a-form-model-item>
					<a-form-model-item label="父级菜单" prop="fid" v-if="menuModel.type != 0">
						<a-tree-select
							placeholder="请选择父级菜单"
							v-model="menuModel.fid"
							style="width: 100%"
							:dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
							:tree-data="dataSource"
							tree-default-expand-all
							:replaceFields="{title:'name', key:'id', value: 'id' }"
						>
						</a-tree-select>
					</a-form-model-item>
					<a-form-model-item label="后端路由" v-if="menuModel.type == 2" prop="url">
						<a-input placeholder="请输入后台路由地址" v-model="menuModel.url"/>
					</a-form-model-item>
					<a-form-model-item label="前端路由" v-if="menuModel.type != 2" prop="router">
						<a-input placeholder="请输入前端路由" v-model="menuModel.router"/>
					</a-form-model-item>
					<a-form-model-item label="前端组件" v-if="menuModel.type != 2" prop="component">
						<a-input placeholder="请输入前端组件名" v-model="menuModel.component"/>
					</a-form-model-item>
					<a-form-model-item label="菜单图标" v-if="menuModel.type != 2" prop="icon">
						<a-row :gutter="12">
							<a-col :span="16">
								<a-input placeholder="请输入图标名称" v-model="menuModel.icon" @change="inputIcon"/>
							</a-col>
							<a-col :span="1">
								<a-button @click="openIconPage">选择图标</a-button>
							</a-col>
						</a-row>
					</a-form-model-item>
				</a-form-model>
			</a-modal>

			<a-modal
				title="风险操作"
				:visible="delAllMenu"
				:confirm-loading="confirmDelAllMenuLoading"
				@ok="confirmDelAllMenu"
				@cancel="cancelDelAllMenu"
			>
				<span style="text-align: center">这将会删除所有子菜单，将会带来不可预料的后果！您确定要这么做吗？？？</span>
			</a-modal>
		</a-card>
	</div>
</template>

<script>
import { getSystemMenu,addMenu,delMenu } from "@/services/system";

const columns = [
	{
		title: '菜单名称',
		dataIndex: 'name',
	},	
	{
		title: '菜单URL',
		dataIndex: 'url',
	},
	{
		title: '路由地址',
		dataIndex: 'router',
	},
	{
		title: '操作',
		scopedSlots: { customRender: 'actions' }
	},
];

export default {
	data() {
		return {
			dataSource: [], // 数据源
			columns, // 表格列
			loadTable: false,
			isEdit: false, // 是否为编辑模式
			showModal: false, // 是否显示模态框
			confirmLoading: false, // 新增/编辑菜单模态框
			modalTitle: "", // 模态框标题
			menuModel: {
				name: "", // 菜单名
				url: null, // 菜单地址
				fid: null, // 父菜单
				router: "", // 前端路由
				level: 1, // 菜单级别
				component: "", // 前端组件
				icon: "", // 菜单图标
				type: 0,
			}, // 菜单表单
			delAllMenu: false, // 删除一个父级菜单的对话框
			confirmDelAllMenuLoading: false, // 异步执行删除父级菜单加载状态
			nowDelRecord: null, // 当前要删除的菜单缓存（父级菜单删除时）
		};
	},

	created() {
		this.initTree();
	},

	methods: {
		initTree() {
			this.loadTable = !this.loadTable;
			getSystemMenu().then((res) => {
				let resObj = res.data;
				if (resObj.code != 1) {
					this.$message.error(resObj.msg);
					return false;
				}
				this.dataSource = resObj.data;
			}).catch((err) => {
				throw Error(err);
			}).finally(() => {
				setTimeout(() => {
					this.loadTable = !this.loadTable;					
				}, 1500);
			})
		},

		// 刷新菜单列表
		refreshMenuList() {
			this.initTree();
		},

		// 新增菜单按钮
		addMenu() {
			this.showModal = !this.showModal;
			this.modalTitle = "新增菜单";
		},

		// 重置data
		resetData() {
			this.isEdit = false, // 是否为编辑模式
			this.showModal = false, // 是否显示模态框
			this.modalTitle = "", // 模态框标题
			this.menuModel = {
				name: "", // 菜单名
				url: null, // 菜单地址
				fid: null, // 父菜单
				router: "", // 前端路由
				level: 1, // 菜单级别
				component: "", // 前端组件
				icon: "", // 菜单图标
				type: 0,
			}; // 菜单表单
		},

		// 关闭模态框
		closeModal() {
			this.isEdit = false; // 是否为编辑模式
			this.showModal = false; // 是否显示模态框
			this.modalTitle = ""; // 模态框标题
		},

		// 提交表单
		submitMenu() {
			this.$refs.modalFormRef.validate(val => {
				if (!val) {
					return false;
				}else{
					if (this.menuModel.type != 0 && this.menuModel.type != 1 && this.menuModel.type != 2) {
						this.$message.error("菜单类型不正确");
						return false;
					}else{
						this.confirmLoading = !this.confirmLoading;
						if (this.menuModel.type == 1 || this.menuModel.type == 2){
							if (null == this.menuModel.fid || this.menuModel.fid == 0) {
								this.$message.error("父级菜单未选择！");
								return false;
							}
						}
						if (this.menuModel.type == 2) {
							if (!this.menuModel.url) {
								this.$message.error("请填写后端路由！");
								return false;
							}
						}
						addMenu(this.menuModel).then((res) => {
							let resObj = res.data;
							if (resObj.code == 1) {
								return this.$message.success(resObj.msg);
							}else{
								return this.$message.error(resObj.msg);
							}
						}).catch((err) => {
							throw Error(err);
						}).finally(() => {
							this.resetData();
							this.refreshMenuList();
							this.confirmLoading = !this.confirmLoading;
						});
					}
				}
			})
		},

		// 菜单类型更改
		changeMenuType(e) {
			this.$set(this.menuModel, 'type', e.target.value);
		},

		// 打开选择图标页面
		openIconPage() {
			window.open("https://antdv.com/components/icon-cn/", "_blank");
		},

		// 匹配icon名称
		inputIcon(e) {
			let value = e.target.value;
			let patt = new RegExp(/^<a-icon type="([a-zA-Z0-9-]+)" \/>$/);
			if (patt.test(value)) {
				this.$set(this.menuModel, 'icon', patt.exec(value)[1]);
			}
		},

		// 编辑菜单
		editMenu(record) {
			this.showModal = !this.showModal;
			this.modalTitle = "编辑菜单";
			this.isEdit = !this.isEdit;
			this.menuModel = {
				name: record.name, // 菜单名
				url: record.url, // 菜单地址
				fid: record.fid, // 父菜单
				router: record.router, // 前端路由
				level: record.level, // 菜单级别
				component: record.component, // 前端组件
				icon: record.icon, // 菜单图标
				type: record.type, // 菜单类型
				id: record.id, // 菜单ID
			}; // 菜单表单
		},

		// 删除菜单
		deleteMenu(record) {
			// 判断当前删除的菜单是否为父级菜单
			if (record.children) {
				this.delAllMenu = true;
				this.nowDelRecord = record;
			}else{
				delMenu({id: record.id, fid: record.fid, level: record.level}).then((res) => {
					let resObj = res.data;
					if (resObj.code != 1) {
						return this.$message.error(resObj.msg);
					}else{
						return this.$message.success(resObj.msg);
					}
				}).catch((err) => {
					throw Error(err);
				}).finally(()=>{
					this.delAllMenu = false;
					this.nowDelRecord = null;
					this.refreshMenuList();
				});
			}
		},

		// 确认删除父级菜单
		confirmDelAllMenu() {
			if (null != this.nowDelRecord) {
				delete this.nowDelRecord.children;
				this.deleteMenu(this.nowDelRecord);
				this.nowDelRecord = null;
				return;
			}else{
				return this.$message.error("非法操作！");
			}
		},

		// 取消删除父级菜单
		cancelDelAllMenu() {
			this.delAllMenu = false;
			this.confirmDelAllMenuLoading = false;
		},
	},
};
</script>

<style>
	.operator {
		margin-bottom: 18px;
	}
</style>