<template>
	<a-card>
		<!-- 表格部分 -->
		<div>
			<a-space class="operator">
				<a-button type="primary" @click="openSubmitPage">新增日报</a-button>
			</a-space>
			<standard-table
				:columns="columns"
				:data-source="dataSource"
				:loading="dailyDataLoadStatus"
				@change="onChange"
				:pagination="{
					current: page,
					pageSize: pageSize,
					total: total,
					showSizeChanger: true,
					showLessItems: true,
					showQuickJumper: true,
					pageSizeOptions: ['10', '30', '50', '10'],// 每页多少条
					showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，总计 ${total} 条`,
					onChange: onPageChange, //页码改变（点击页码，点击方向控制，直接输入页码都会引起）
					onShowSizeChange: onSizeChange, //（每页展示多少条变化）
				}"
			>
				<div slot="description" slot-scope="{ text }">
					{{ text }}
				</div>
				<span slot="action" slot-scope="{record}">
					<a @click="editRecord(record.key)" style="margin-right: 8px"> <a-icon type="edit" />编辑 </a>
					<a-popconfirm
						title="确定要删除吗？"
						ok-text="Yes"
						cancel-text="No"
						@confirm="deleteRecord(record.key)"
					>
						<a > <a-icon type="delete" />删除</a>
					</a-popconfirm>
					
				</span>
			</standard-table>
		</div>
	</a-card>
</template>

<script>
import moment from 'moment';
import StandardTable from "@/components/table/StandardTable";
import { getDailyList, delDaily } from "@/services/daily";

let _this;

const columns = [
	{
		title: "提交者",
		dataIndex: "teacher",
		align: "center",
		customRender: (text) => text + "老师",
	},
	{
		title: "上课时间",
		dataIndex: "post_date",
		align: "center",
		customRender: (e) => moment(Number(e)).format("YYYY-MM-DD"),
	},
	{
		title: "提交时间",
		dataIndex: "submit_time",
		align: "center",
		customRender: (e) => moment(Number(e)).format("YYYY-MM-DD"),
	},
	{
		title: "更新时间",
		dataIndex: "update_time",
		align: "center",
		customRender: (e) => e == 0 ? "从未更新" : moment(Number(e)).format("YYYY-MM-DD"),
	},
	{
		title: "操作",
		align: "center",
		scopedSlots: { customRender: 'action' }
	},
];


export default {
	components: { StandardTable },
	data() {
		return {
			advanced: true,
			columns,
			dailyDataLoadStatus: false,
			dataSource: [],
			page: 1,
			pageSize: 10,
			total: 0,
			user: null,
		};
	},

	beforeCreate() {
		_this = this;
	},

	created() {
		this.user = this.$store.state.account.user;
		this.initDailyList();
	},

	methods: {
		// 初始化表格数据
		initDailyList() {
			_this.dailyDataLoadStatus = true;
			getDailyList({page: this.page, pageSize: this.pageSize, id: this.user.id}).then(res => {
				let respMsg = res.data.data;
				this.total = res.data.data.total;
				let tableData = [];
				for (let i = 0; i < respMsg.data.length; i++) {
					tableData.push({
						key: respMsg.data[i]['id'],
						id: respMsg.data[i]['id'],
						teacher: respMsg.data[i]['teacher_name'],
						submit_time: respMsg.data[i]['submit_time'],
						update_time: respMsg.data[i]['update_time'],
						post_date: respMsg.data[i]['post_date'],
					})
				}
				setTimeout(() => {
					_this.dataSource = tableData;
					_this.dailyDataLoadStatus = false;
				}, 1500);
			}).catch(err => {
				throw new Error(err);
			});
		},

		// 删除
		deleteRecord(key) {
			delDaily({id: key, teacherId: this.user.id}).then((res) => {
				let resObj = res.data;
				if(resObj.code == 1){
					this.$message.success(resObj.msg, () => {
						this.dataSource = this.dataSource.filter((item) => item.key !== key);
					});
				}
			}).catch((err) => {
				throw Error(err);
			});
		},

		// 编辑
		editRecord(key) {
			this.$openPage(`/teacher/dailyEdit/${key}`, `编辑第${key}页日报`);
		},

		// 切换页码
		onPageChange(page, pageSize) {
			this.page = page
			this.pageSize = pageSize
		},

		onSizeChange(current, size) {
			this.page = 1
			this.pageSize = size
		},

		onChange() {
			this.initDailyList();
		},
		
		toggleAdvanced() {
			this.advanced = !this.advanced;
		},

		remove() {
			this.dataSource = this.dataSource.filter(
				(item) =>
					this.selectedRows.findIndex((row) => row.key === item.key) === -1
			);
			this.selectedRows = [];
		},

		handleMenuClick(e) {
			console.log(e);
			if (e.key === "delete") {
				this.remove();
			}
		},

		openSubmitPage() {
			this.$openPage('/teacher/dailySubmit');
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
</style>