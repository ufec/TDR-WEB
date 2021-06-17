<template>
	<a-card>
		<!-- 查询部分 -->
		<div class="search">
			<a-form layout="horizontal">
				<a-row>
					<a-col :md="8" :sm="24">
						<a-form-item label="提交日期" :labelCol="{ span: 3 }" :wrapperCol="{ span: 18, offset: 1 }">
							<a-range-picker
								:ranges="{ 
									'今天': [moment().startOf('day'), moment().endOf('day')],
									'本周': [moment().week(moment().week()).startOf('week'), moment().week(moment().week()).endOf('week')],
									'本月': [moment().month(moment().month()).startOf('month'), moment().month(moment().month()).endOf('month')] 
								}"
								@change="onPickRange"
							/>
						</a-form-item>
					</a-col>
					<a-col :md="8" :sm="24">
						<a-form-item label="填写教师" :labelCol="{ span: 5 }" :wrapperCol="{ span: 18, offset: 1 }">
							<a-input placeholder="请输入教师姓名" v-model="teacherName"/>
						</a-form-item>
					</a-col>
					<a-col :md="8" :sm="24">
						<a-form-item label="部门" :labelCol="{ span: 5 }" :wrapperCol="{ span: 18, offset: 1 }">
							<a-select 
								v-model="department" 
								placeholder="选择您所属的部门！" 
								:allowClear="true" 
								:showSearch="true" 
								:options="departmentList" 
								:getPopupContainer="(triggerNode) => triggerNode.parentNode" 
								optionFilterProp="title"
							/>
						</a-form-item>
					</a-col>
				</a-row>
				<a-button type="primary" @click="exportToExcel">导出EXECL</a-button>
				<span style="float: right; margin-top: 3px">
					<a-button type="primary" @click="query">查询</a-button>
					<a-button style="margin-left: 8px">重置</a-button>
				</span>
			</a-form>
		</div>

		<!-- 表格部分 -->
		<div>
			<standard-table
				rowKey="id"
				bordered
				:columns="columns"
				:data-source="dataSource"
				:loading="dailyDataLoadStatus"
				:scroll="{ x: 1300 }"
				@change="onChange"
				:pagination="{
					current: page,
					pageSize: pageSize,
					total: total,
					showSizeChanger: true,
					showLessItems: true,
					showQuickJumper: true,
					pageSizeOptions: pageSizeOptions,// 每页多少条
					showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，总计 ${total} 条`,
					onChange: onPageChange, //页码改变（点击页码，点击方向控制，直接输入页码都会引起）
					onShowSizeChange: onSizeChange, //（每页展示多少条变化）
				}"
			>
			</standard-table>
		</div>
	</a-card>
</template>

<script>
import StandardTable from "@/components/table/StandardTable";
import { getDailyList, getAllDepartment } from "@/services/daily";
import { queryDailyInfo } from "@/services/system";
import moment from 'moment';
import XLSX from 'xlsx';
import { sheet2workbook, deepClone } from "@/utils/tools";

const columns = [
	{
		title: "提交者",
		dataIndex: "teacher_name",
		align: "center",
		width: 100,
		fixed: 'left'
	},
	{
		title: "部门",
		dataIndex: "department",
		align: "center",
		width: 150,
		ellipsis: true,
	},
	{
		title: "教室",
		dataIndex: "class_room",
		width: 100,
		align: "center",
	},
	{
		title: "上课日期",
		dataIndex: "post_date",
		width: 150,
		align: "center",
	},
	{
		title: "节次",
		dataIndex: "section",
		width: 100,
		align: "center",
		customRender: (e) => e + "节",
	},
	{
		title: "课程名",
		dataIndex: "course",
		width: 100,
		align: "center",
		ellipsis: true,
	},
	{
		title: "课程性质",
		dataIndex: "course_nature",
		width: 100,
		align: "center",
		ellipsis: true,
	},
	{
		title: "上课班级",
		dataIndex: "class",
		width: 100,
		align: "center",
		ellipsis: true,
	},
	{
		title: "班主任",
		dataIndex: "head_teacher",
		width: 100,
		align: "center",
	},
	{
		title: "应到人数",
		dataIndex: "attend_num",
		width: 100,
		align: "center",
	},
	{
		title: "实到人数",
		dataIndex: "true_attend_num",
		width: 100,
		align: "center",
	},
	{
		title: "出勤率",
		dataIndex: "attendance",
		width: 100,
		align: "center",
	},
	{
		title: "旷课学生列表",
		dataIndex: "truancy_student",
		width: 150,
		align: "center",
		ellipsis: true,
	},
	{
		title: "旷课学生人数",
		dataIndex: "truancy_student_num",
		width: 150,
		align: "center",
	},
	{
		title: "旷课率",
		dataIndex: "truancy_rate",
		width: 100,
		align: "center",
	},
	{
		title: "迟到学生列表",
		dataIndex: "late_student",
		width: 150,
		align: "center",
		ellipsis: true,
	},
	{
		title: "迟到学生人数",
		dataIndex: "late_student_num",
		width: 150,
		align: "center",
	},
	{
		title: "迟到率",
		dataIndex: "late_rate",
		width: 100,
		align: "center",
	},
	{
		title: "早退学生列表",
		dataIndex: "leave_early_student",
		width: 150,
		align: "center",
		ellipsis: true,
	},
	{
		title: "早退学生人数",
		dataIndex: "leave_early_student_num",
		width: 150,
		align: "center",
	},
	{
		title: "早退率",
		dataIndex: "leave_early_rate",
		width: 100,
		align: "center",
	},
	{
		title: "请假学生列表",
		dataIndex: "leave_student",
		width: 150,
		align: "center",
		ellipsis: true,
	},
	{
		title: "请假学生人数",
		dataIndex: "leave_student_num",
		width: 150,
		align: "center",
	},
	{
		title: "请假率",
		dataIndex: "leave_rate",
		width: 100,
		align: "center",
	},
	{
		title: "使用媒体设备",
		dataIndex: "use_media",
		width: 150,
		align: "center",
		ellipsis: true,
	},
	{
		title: "学生不得体",
		dataIndex: "un_image_student",
		width: 150,
		align: "center",
		ellipsis: true,
	},
	{
		title: "投影仪问题",
		dataIndex: "projector_damage",
		width: 150,
		align: "center",
		ellipsis: true,
	},
	{
		title: "电脑问题",
		dataIndex: "computer_damage",
		width: 150,
		align: "center",
		ellipsis: true,
	},
	{
		title: "其他问题",
		dataIndex: "other_warn_damage",
		width: 100,
		align: "center",
		ellipsis: true,
	},
	{
		title: "其他反馈",
		dataIndex: "other_things",
		width: 100,
		align: "center",
	},
	{
		title: "提交日期",
		dataIndex: "submit_time",
		width: 150,
		align: "center",
	},
];


export default {
	components: { StandardTable },
	data() {
		return {
			moment,
			columns,
			dailyDataLoadStatus: false,
			dataSource: [],
			departmentList: [], //部门列表
			pageSizeOptions: ['10', '30', '50', '100'],
			page: 1,
			pageSize: 10,
			total: 0,
			spinning: false,
			startTime: 0, // 开始时间
			endTime: 0, // 结束时间
			teacherName: "", // 教师姓名
			department: "", // 部门
		};
	},

	created() {
		this.initTable();
		this.getDepartment();
	},

	methods: {
		initTable() {
			getDailyList({page:this.page, pageSize:this.pageSize}).then(res => {
				this.dailyDataLoadStatus = true;
				let respMsg = res.data;
				this.total = respMsg.data.total;
				let tableData = [];
				this.pushTableData(tableData, respMsg.data.data);
				setTimeout(() => {
					this.dataSource = tableData;
					this.dailyDataLoadStatus = false;
				}, 2000);
			}).catch(err => {
				throw new Error(err);
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

		// 切换页码
		onPageChange(page, pageSize) {
			this.page = page
			this.pageSize = pageSize
		},

		// 切换每页大小
		onSizeChange(current, size) {
			this.page = 1
			this.pageSize = size
		},

		// 导出excel功能
		exportToExcel() {
			let data = deepClone(this.dataSource);
			columns.forEach(item => {
				data.forEach(el => {
					for (let key in el) {
						if (key == item.dataIndex) {
							el[item.title] = el[key];
							delete el[key];
						}
					}
				})
			})
			
			// let cols = [];
			// let reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
			// data.forEach(item => {
			// 	for (const key in item) {
			// 		if (Object.hasOwnProperty.call(item, key)) {
			// 			let titleLength = 0;
			// 			if (reg.test(key)) {
			// 				titleLength = key.length * 2;
			// 			}else{
			// 				titleLength = key.length;
			// 			}
			// 		}
			// 	}
			// })
			let sheet = XLSX.utils.json_to_sheet(data);
			let workbook = sheet2workbook(sheet, "数据");
			XLSX.writeFile(workbook, "数据.xlsx");
			// sheet['!cols'] =[{'wch': 10}, {'wch': 100}, {'wch': 100}, {'wch': 100}, {'wch': 100}, {'wch': 100}]
		},

		// 时间范围选择
		onPickRange(dates) {
			this.startTime = dates[0].valueOf();
			this.endTime = dates[1].valueOf();
		},

		query() {
			this.dailyDataLoadStatus = true;
			let param = {};
			if(this.department){
				param.department = this.department;
			}
			if(this.startTime != 0 && this.endTime != 0){
				param.startTime = this.startTime;
				param.endTime = this.endTime;
			}
			if(this.teacherName != ""){
				param.teacherName = this.teacherName;
			}
			param.pageSize = this.pageSize;
			param.page = this.page;
			queryDailyInfo(param).then((res) => {
				let resObj = res.data;
				console.log(resObj);
				this.total = resObj.total;
				let tableData = [];
				this.pushTableData(tableData, resObj.data.data);
				setTimeout(() => {
					this.dataSource = tableData;
					this.dailyDataLoadStatus = false;
				}, 2000);
			}).catch((err) => {
				throw Error(err);
			});
		},

		pushTableData(tableData, data) {
			for (let i = 0; i < data.length; i++) {
				tableData.push({
					id: data[i]['id'], // ID
					teacher_name: data[i]['teacher_name'], // 教师姓名
					department: data[i]['department'], // 部门
					class_room: data[i]['class_room'],  // 教室
					post_date: moment(Number(data[i]['post_date'])).format("YYYY-MM-DD"), // 上课日期
					section: data[i]['section'], // 节次
					course: data[i]['course'], // 课程
					course_nature: data[i]['course_nature'], // 课程性质
					class: data[i]['class'], // 上课班级
					head_teacher: data[i]['head_teacher'], // 班主任
					attend_num: data[i]['attend_num'], // 应到人数
					true_attend_num: data[i]['true_attend_num'], // 实到人数
					attendance: `${Math.floor((data[i]['true_attend_num'] / data[i]['attend_num'] * 100))}%`, // 出勤率
					truancy_student: data[i]['truancy_student'], // 旷课学生列表
					truancy_student_num: data[i]['truancy_student_num'], //旷课学生人数
					truancy_rate: `${Math.floor((data[i]['truancy_student_num'] / data[i]['attend_num'])*100)}%`, // 旷课率
					late_student: data[i]['late_student'], // 迟到学生列表
					late_student_num: data[i]['late_student_num'], // 迟到学生人数
					late_rate: `${Math.floor((data[i]['truancy_student_num'] / data[i]['attend_num'])*100)}%`, // 迟到率
					leave_early_student: data[i]['leave_early_student'], // 早退学生列表
					leave_early_student_num: data[i]['leave_early_student_num'], // 早退学生人数
					leave_early_rate: `${Math.floor((data[i]['leave_early_student_num'] / data[i]['attend_num'])*100)}%`, // 早退率
					leave_student: data[i]['leave_student'], // 请假学生列表
					leave_student_num: data[i]['leave_student_num'], // 请假学生人数
					leave_rate: `${Math.floor((data[i]['leave_student_num'] / data[i]['attend_num'])*100)}%`, // 请假率
					use_media: data[i]['use_media'], // 使用手机情况
					un_image_student: data[i]['un_image_student'], // 学生上课情况
					projector_damage: data[i]['projector_damage'], // 投影仪问题
					computer_damage: data[i]['computer_damage'], // 电脑问题
					other_warn_damage: data[i]['other_warn_damage'], // 其他问题
					other_things: data[i]['other_things'], // 其他反馈

					submit_time: moment(Number(data[i]['submit_time'])).format("YYYY-MM-DD"), //提交时间
				})
			}
		},

		onChange() {
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