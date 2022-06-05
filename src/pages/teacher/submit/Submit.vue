<template>
	<a-form-model :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }" ref="dailyForm" :rules="rules">
		<a-collapse v-model="activeKey">
			<!-- 第一部分 -->
			<a-collapse-panel key="1" header="第一部分：基本信息">
				<div>
					<a-form-model-item label="教师" required prop="teacherName">
						<a-input v-model="form.teacherName" disabled/>
					</a-form-model-item>
					<a-form-model-item label="教室" required prop="classRoomName">
						<a-input v-model="form.classRoomName" />
					</a-form-model-item>
					<a-form-model-item label="时间" required prop="postDateTemp">
						<a-date-picker v-model="form.postDateTemp" :defaultValue="moment()" placeholder="请选择上课时间" style="width: 100%;" @change="checkDate"/>
					</a-form-model-item>
					<a-form-model-item label="班级" required prop="checkedClass">
						<a-select
							mode="multiple"
							placeholder="选择班级"
							v-model="form.checkedClass"
							style="width: 100%"
							@select="selectCheckedClass"
							@deselect="deselectCheckedClass"
						>
							<a-select-option v-for="item in classList" :key="item.key" :value="item.text">
								{{ item.text }}
							</a-select-option>
						</a-select>
					</a-form-model-item>
					<a-form-model-item label="课程" required prop="course">
						<a-auto-complete
							:data-source="courseList"
							v-model="form.course"
							placeholder="选择课程"
							:allowClear="true"
						/>
					</a-form-model-item>
					<a-form-model-item label="课程性质" required prop="courseNature">
						<a-radio-group v-model="form.courseNature">
							<a-radio value="正常">正常</a-radio>
							<a-radio value="补课">补课</a-radio>
						</a-radio-group>
						<label style="color:red;">注：如果是补课，请选择补课</label>
					</a-form-model-item>
					<a-form-model-item label="班主任" required prop="checkedHeadTeacher">
						<a-select
							mode="multiple"
							placeholder="选择班主任"
							v-model="form.checkedHeadTeacher"
							style="width: 100%"
						>
							<a-select-option v-for="item in filteredCheckedHeadTeacher" :key="item" :value="item">
								{{ item }}
							</a-select-option>
						</a-select>
					</a-form-model-item>
					<a-form-model-item label="节次" required prop="section">
						<a-cascader v-model="sectionValue" :options="sectionData" :load-data="loadSectionData" placeholder="请选择上课节次" prop="section" @change="onChangeSection"/>
					</a-form-model-item>
					<a-form-model-item label="应到人数" required prop="attendNum">
						<a-input-number v-model="form.attendNum" :min="0"/>
					</a-form-model-item>
					<a-form-model-item label="实到人数" required prop="trueAttendNum">
						<a-input-number v-model="form.trueAttendNum" :min="0" :max="form.attendNum"/>
					</a-form-model-item>
					<a-card title="缺勤人数" width="100%" v-if="checkNums">
						<label style="margin-left:40px; color:red;">操作提示：鼠标悬于选中学生上可以修改信息，鼠标右键可以删除手动添加的学生，鼠标左键取消勾选下拉选中和搜索的学生，下拉框可以搜学生</label>
						<a-form-model-item :label-col="{ span: 2 }" :wrapper-col="{ span: 100 }" label="旷课人数" required prop="truancyStudentNum" v-if="checkNumOverFlow || form.truancyStudentNum">
							<span>
								<!-- 人数显示 -->
								<a-input-number style="width: 40px;" v-model="form.truancyStudentNum" :min="0" disabled/>
								<!-- 下拉选择框 -->
								<a-cascader
									v-model="truancyStudentParams.selectTemp"
									expand-trigger="hover" 
									style="margin-left:10px; width: 350px;" 
									:options="studentList"
									:show-search="true"
									notFoundContent="请先选择班级，会匹配该班级"
									@change="selectStudenConfirm(arguments, truancyStudentParams, 'select')"
								/>
								<a-select
									mode="multiple"
									:filterOption="false"
									placeholder="输入学生信息自动搜索"
									style="margin-left:10px; width: 400px"
									:not-found-content="truancyStudentParams.fetching ? undefined : null"
									:value="[]"
									@search="autoSearch(arguments, truancyStudentParams)"
									@select="clickSearchStudnetRes(arguments, truancyStudentParams, 'search')"
								>
									<a-spin v-if="truancyStudentParams.fetching" slot="notFoundContent" size="small" />
									<a-select-option v-for="d in truancyStudentParams.searchData" :key="d.value">{{ d.text }}</a-select-option>
								</a-select>
								<!-- 按钮添加学生 -->
								<a-popover v-model="truancyStudentParams.visible" title="添加未在列表或数据库中的学生" trigger="click">
									<div slot="content">
										<a-input placeholder="输入学生班级姓名,多个用，隔开" v-model="truancyStudentParams.addStudent"/>
										<a-button style="margin-top:20px;" type="primary" block @click="addStu(truancyStudentParams, 'input')">添加</a-button>
									</div>
									<a-button style="margin-left:20px;" type="primary">添加学生</a-button>
								</a-popover>
							</span>
							<br />
							<!-- 已选择学生列表 -->
							<a-checkbox-group :value="form.checkedTruancyStudentList">
								<a-checkbox 
									v-for="(item, index) in truancyStudentParams.selectData"
									style="margin-top: 10px; margin-left: 0;"
									:value="item.value"
									v-bind:key="index"
									checked
									:disabled="item.disabled ? item.disabled : false"
									@click="checkClick(item, truancyStudentParams, index)" 
								>
									<a-popover v-model="item.visible" title="修改学生信息" arrow-point-at-center trigger="hover">
										<div slot="content">
											<a-input v-model="truancyStudentParams.selectData[index].changeStudent" placeholder="输入学生班级姓名"/>
											<a-button @click="changeStu(truancyStudentParams, index)" style="margin-top:20px;" type="danger" block>修改</a-button>
										</div>
										<span @contextmenu.prevent="Rclick(truancyStudentParams, index)">{{item.value}}</span>
									</a-popover>
								</a-checkbox>
							</a-checkbox-group>
						</a-form-model-item>

						<a-form-model-item :label-col="{ span: 2 }" :wrapper-col="{ span: 100 }" label="迟到人数" required prop="lateStudentNum" v-if="checkNumOverFlow || form.lateStudentNum">
							<span>
								<!-- 人数显示 -->
								<a-input-number style="width: 40px;" v-model="form.lateStudentNum" :min="0" disabled/>
								<!-- 下拉选择框 -->
								<a-cascader
									v-model="lateStudentParams.selectTemp"
									expand-trigger="hover" 
									style="margin-left:10px; width: 350px;"
									:options="studentList" 
									:show-search="true"
									notFoundContent="请先选择班级，会匹配该班级"
									@change="selectStudenConfirm(arguments, lateStudentParams, 'select')"
								/>
								<a-select
									mode="multiple"
									:filterOption="false"
									placeholder="输入学生信息自动搜索"
									style="margin-left:10px; width: 400px"
									:not-found-content="lateStudentParams.fetching ? undefined : null"
									:value="[]"
									@search="autoSearch(arguments, lateStudentParams)"
									@select="clickSearchStudnetRes(arguments, lateStudentParams, 'search')"
								>
									<a-spin v-if="lateStudentParams.fetching" slot="notFoundContent" size="small" />
									<a-select-option v-for="d in lateStudentParams.searchData" :key="d.value">{{ d.text }}</a-select-option>
								</a-select>
								<!-- 按钮添加学生 -->
								<a-popover v-model="lateStudentParams.visible" title="添加未在列表或数据库中的学生" trigger="click">
									<div slot="content">
										<a-input placeholder="输入学生班级姓名,多个用，隔开" v-model="lateStudentParams.addStudent"/>
										<a-button style="margin-top:20px;" type="primary" block @click="addStu(lateStudentParams, 'input')">添加</a-button>
									</div>
									<a-button style="margin-left:20px;" type="primary">添加学生</a-button>
								</a-popover>
							</span>
							<br />
							<!-- 已选择学生列表 -->
							<a-checkbox-group :value="form.checkedLateStudentList">
								<a-checkbox 
									v-for="(item, index) in lateStudentParams.selectData"
									style="margin-top: 10px; margin-left: 0;"
									:value="item.value"
									v-bind:key="index"
									:disabled="item.disabled ? item.disabled : false"
									@click="checkClick(item, lateStudentParams, index)" 
								>
									<a-popover v-model="item.visible" title="修改学生信息" arrow-point-at-center trigger="hover">
										<div slot="content">
											<a-input v-model="lateStudentParams.selectData[index].changeStudent" placeholder="输入学生班级姓名"/>
											<a-button @click="changeStu(lateStudentParams, index)" style="margin-top:20px;" type="danger" block>修改</a-button>
										</div>
										<span @contextmenu.prevent="Rclick(lateStudentParams, index)">{{item.value}}</span>
									</a-popover>
								</a-checkbox>
							</a-checkbox-group>
						</a-form-model-item>

						<a-form-model-item :label-col="{ span: 2 }" :wrapper-col="{ span: 100 }" label="早退人数" required prop="leaveEarlyStudentNum" v-if="checkNumOverFlow || form.leaveEarlyStudentNum">
							<span>
								<!-- 人数显示 -->
								<a-input-number style="width: 40px;" v-model="form.leaveEarlyStudentNum" :min="0" disabled/>
								<!-- 下拉选择框 -->
								<a-cascader
									v-model="leaveEarlyStudentParams.selectTemp"
									expand-trigger="hover" 
									style="margin-left:10px; width: 350px;"
									:options="studentList" 
									:show-search="true"
									notFoundContent="请先选择班级，会匹配该班级"
									@change="selectStudenConfirm(arguments, leaveEarlyStudentParams, 'select')"
								/>
								<a-select
									mode="multiple"
									:filterOption="false"
									placeholder="输入学生信息自动搜索"
									style="margin-left:10px; width: 400px"
									:not-found-content="leaveEarlyStudentParams.fetching ? undefined : null"
									:value="[]"
									@search="autoSearch(arguments, leaveEarlyStudentParams)"
									@select="clickSearchStudnetRes(arguments, leaveEarlyStudentParams, 'search')"
								>
									<a-spin v-if="leaveEarlyStudentParams.fetching" slot="notFoundContent" size="small" />
									<a-select-option v-for="d in leaveEarlyStudentParams.searchData" :key="d.value">{{ d.text }}</a-select-option>
								</a-select>
								<!-- 按钮添加学生 -->
								<a-popover v-model="leaveEarlyStudentParams.visible" title="添加未在列表或数据库中的学生" trigger="click">
									<div slot="content">
										<a-input placeholder="输入学生班级姓名,多个用，隔开" v-model="leaveEarlyStudentParams.addStudent"/>
										<a-button style="margin-top:20px;" type="primary" block @click="addStu(leaveEarlyStudentParams, 'input')">添加</a-button>
									</div>
									<a-button style="margin-left:20px;" type="primary">添加学生</a-button>
								</a-popover>
							</span>
							<br />
							<!-- 已选择学生列表 -->
							<a-checkbox-group :value="form.checkedLeaveEarlyStudentList">
								<a-checkbox 
									v-for="(item, index) in leaveEarlyStudentParams.selectData"
									style="margin-top: 10px; margin-left: 0;"
									:value="item.value"
									v-bind:key="index"
									:disabled="item.disabled ? item.disabled : false"
									@click="checkClick(item, leaveEarlyStudentParams, index)" 
								>
									<a-popover v-model="item.visible" title="修改学生信息" arrow-point-at-center trigger="hover">
										<div slot="content">
											<a-input v-model="leaveEarlyStudentParams.selectData[index].changeStudent" placeholder="输入学生班级姓名"/>
											<a-button @click="changeStu(leaveEarlyStudentParams, index)" style="margin-top:20px;" type="danger" block>修改</a-button>
										</div>
										<span @contextmenu.prevent="Rclick(leaveEarlyStudentParams, index)">{{item.value}}</span>
									</a-popover>
								</a-checkbox>
							</a-checkbox-group>
						</a-form-model-item>

						<a-form-model-item :label-col="{ span: 2 }" :wrapper-col="{ span: 100 }" label="请假人数" required prop="leaveStudentNum" v-if="checkNumOverFlow || form.leaveStudentNum">
							<span>
								<!-- 人数显示 -->
								<a-input-number style="width: 40px;" v-model="form.leaveStudentNum" :min="0" disabled/>
								<!-- 下拉选择框 -->
								<a-cascader
									v-model="leaveStudentParams.selectTemp"
									expand-trigger="hover" 
									style="margin-left:10px; width: 350px;"
									:options="studentList" 
									:show-search="true"
									notFoundContent="请先选择班级，会匹配该班级"
									@change="selectStudenConfirm(arguments, leaveStudentParams, 'select')"
								/>
								<a-select
									mode="multiple"
									:filterOption="false"
									placeholder="输入学生信息自动搜索"
									style="margin-left:10px; width: 400px"
									:not-found-content="leaveStudentParams.fetching ? undefined : null"
									:value="[]"
									@search="autoSearch(arguments, leaveStudentParams)"
									@select="clickSearchStudnetRes(arguments, leaveStudentParams, 'search')"
								>
									<a-spin v-if="leaveStudentParams.fetching" slot="notFoundContent" size="small" />
									<a-select-option v-for="d in leaveStudentParams.searchData" :key="d.value">{{ d.text }}</a-select-option>
								</a-select>
								<!-- 按钮添加学生 -->
								<a-popover v-model="leaveStudentParams.visible" title="添加未在列表或数据库中的学生" trigger="click">
									<div slot="content">
										<a-input placeholder="输入学生班级姓名,多个用，隔开" v-model="leaveStudentParams.addStudent"/>
										<a-button style="margin-top:20px;" type="primary" block @click="addStu(leaveStudentParams, 'input')">添加</a-button>
									</div>
									<a-button style="margin-left:20px;" type="primary">添加学生</a-button>
								</a-popover>
							</span>
							<br />
							<!-- 已选择学生列表 -->
							<a-checkbox-group :value="form.checkedLeaveStudentList">
								<a-checkbox 
									v-for="(item, index) in leaveStudentParams.selectData"
									style="margin-top: 10px; margin-left: 0;"
									:value="item.value"
									v-bind:key="index"
									:disabled="item.disabled ? item.disabled : false"
									@click="checkClick(item, leaveStudentParams, index)" 
								>
									<a-popover v-model="item.visible" title="修改学生信息" arrow-point-at-center trigger="hover">
										<div slot="content">
											<a-input v-model="leaveStudentParams.selectData[index].changeStudent" placeholder="输入学生班级姓名"/>
											<a-button @click="changeStu(leaveStudentParams, index)" style="margin-top:20px;" type="danger" block>修改</a-button>
										</div>
										<span @contextmenu.prevent="Rclick(leaveStudentParams, index)">{{item.value}}</span>
									</a-popover>
								</a-checkbox>
							</a-checkbox-group>
						</a-form-model-item>
					</a-card>
				</div>
			</a-collapse-panel>

			<!-- 第二部分 -->
			<a-collapse-panel key="2" header="第二部分：学生状况">
				<a-collapse :default-active-key="[5,6]">
					<a-collapse-panel key="5" header="上课时用手机或娱乐设备">
						<a-radio-group :options="useMediaNum" v-model="form.useMedia" @change="useMediaChange" name="useMedia"/>
					</a-collapse-panel>

					<a-collapse-panel key="6" header="上课时学生的言行举止或衣着不得体">
						<div :style="{ borderBottom: '1px solid #E9E9E9' }">
							<a-checkbox 
								:indeterminate="unImageNotAll" 
								:checked="unImageCheckAll" 
								@change="(e) => onCheckAllChange(e, unImageParam)"
							>全选</a-checkbox>
						</div>
						<br />
						<a-checkbox-group v-model="form.unImageStudentList" :options="unImageStudentOptions" @change="(checkedList) => onCheckGroupChange(checkedList, unImageParam)" :defaultValue="unImageStudentDefault" />
					</a-collapse-panel>
				</a-collapse>
			</a-collapse-panel>

			<!-- 第三部分 -->
			<a-collapse-panel key="3" header="第三部分：条件保障">
				<a-collapse :default-active-key="[7, 8]">
					<a-collapse-panel key="7" header="投影仪不能正常使用">
						<div :style="{ borderBottom: '1px solid #E9E9E9' }">
							<a-checkbox :indeterminate="projectorNotAll" :checked="projectorCheckAll" @change="(e) => onCheckAllChange(e, projectorParam)">全选</a-checkbox>
						</div>
						<br />
						<a-checkbox-group v-model="form.projectorDamage" :options="projectorStudentOptions" @change="(checkedList) => onCheckGroupChange(checkedList, projectorParam)" :defaultValue="projectorStudentDefault" />
					</a-collapse-panel>
					<a-collapse-panel key="8" header="电脑不能正常使用">
						<div :style="{ borderBottom: '1px solid #E9E9E9' }">
							<a-checkbox :indeterminate="computerNotAll" :checked="computerCheckAll" @change="(e) => onCheckAllChange(e, computerParam)">全选</a-checkbox>
						</div>
						<br />
						<a-checkbox-group v-model="form.computerDamage" :options="computerStudentOptions" @change="(checkedList) => onCheckGroupChange(checkedList, computerParam)" :defaultValue="computerStudentDefault" />
					</a-collapse-panel>
					<a-collapse-panel key="9" header="其他问题">
						<div :style="{ borderBottom: '1px solid #E9E9E9' }">
							<a-checkbox :indeterminate="otherWarnNotAll" :checked="otherWarnCheckAll" @change="(e) => onCheckAllChange(e, otherWarnParam)">全选</a-checkbox>
						</div>
						<br />
						<a-checkbox-group v-model="form.otherWarnDamage" :options="otherWarnStudentOptions" @change="(checkedList) => onCheckGroupChange(checkedList, otherWarnParam)" :defaultValue="otherWarnStudentDefault" />
					</a-collapse-panel>
				</a-collapse>
			</a-collapse-panel>

			<!-- 第四部分 -->
			<a-collapse-panel key="4" header="第四部分：其他情况">
				<span>有其他影响正常课堂教学的不良行为及现象</span>
				<br />
				<a-textarea v-model="form.otherThings" placeholder="其他反馈" :auto-size="{ minRows: 3, maxRows: 5 }" />
			</a-collapse-panel>
		</a-collapse>

		<!-- 操作按钮 -->
		<a-form-model-item :wrapper-col="{ span: 100}">
			<a-button style="width: 100%;margin-top: 24px" size="large" type="primary" :loading="submitStatus" :disabled="submitStatus" @click="submitForm" v-if="!isEdit">提交日报</a-button>
			<a-button style="width: 100%;margin-top: 24px" size="large" type="primary" :loading="submitStatus" :disabled="submitStatus" @click="submitForm" v-if="isEdit">提交修改</a-button>
			<a-button style="width: 100%;margin-top: 19px" size="large" type="danger"  @click="resetForm" v-if="!isEdit">重置表单</a-button>
		</a-form-model-item>
	</a-form-model>
</template>

<style>

</style>

<script>
import {searchStudentList, getTeacherConfig, getClassStudent, dailySubmit} from '@/services/daily';
import moment from 'moment';
import debounce from 'lodash/debounce';

export default {
	data() {
		this.autoSearch = debounce(this.autoSearch, 1000);
		return {
			submitStatus: false,
			moment, // moment对象
			isEdit: false, // 是否为编辑模式
			dailyInfoId: 0, // 当前处理的日报数据ID
			activeKey: [1], // 主折叠面板默认展开
			sectionData: [], // 节次数据，自动生成
			classList: [], // 教学配置中的班级列表
			courseList: [], // 教学配置中的课程
			sectionValue: [], // 用于默认选中的节次数据
			form: {
				teacherId: "",//教师编号
				teacherName: "",//教师姓名（自动选择）
				classRoomName: "",//教室
				courseNature: "正常", // 课程性质
				postDateTemp: moment(), //上课时间(只作缓存使用，提交时会删除)
				postDate: Number(moment().format("x")),//上课时间
				submit_time: 0, // 提交时间
				update_time: 0, // 更新时间
				section: "",//节次
				trueAttendNum: 0,//实到人数
				attendNum: 0,//应到人数
				
				useMedia: "", //使用媒体设备
				unImageStudentList: [], //衣着问题
				projectorDamage: [], //投影仪问题
				computerDamage: [], //电脑问题
				otherWarnDamage: [], //其他问题
				
				otherThings: "",//其他反馈
				
				// 教师配置项开始
				// 选中提交值
				course: "",//教师配置项-课程
				checkedClass: [],//本次课出席的班级
				checkedHeadTeacher: [],//本次课出席班级的班主任
				department: "", // 教师所属部门
				// 教师配置项结束
				
				checkedTruancyStudentList: [],//所选旷课学生列表
				checkedLateStudentList: [],//所选迟到学生列表
				checkedLeaveEarlyStudentList: [],//所选早退学生列表
				checkedLeaveStudentList: [],//所选请假学生列表
				
				truancyStudentNum: 0,//旷课学生人数
				lateStudentNum: 0,//迟到学生人数
				leaveEarlyStudentNum: 0,//早退学生人数
				leaveStudentNum: 0,//请假学生人数
			}, // 表单对象（提交数据）
			useMediaNum: [
				{ label: '1-5人', value: '1-5人' },
				{ label: '6-10人', value: '6-10人' },
				{ label: '10人以上', value: '10人以上' }
			],// 使用媒体设备选项

			// 学生衣着言行举止配置
			unImageNotAll: false, //未全选状态
			unImageCheckAll: false, // 全选状态
			unImageStudentOptions: ['衣着不整', '上课睡觉', '肆意谈笑喧哗', '在教室或走廊吸烟', '将食物带进教室', '上课不带教材'], // 可选项
			unImageStudentDefault: [], // 默认选项
			unImageParam: {
				indeterminate: 'unImageNotAll',// 复选框选中一个或多个，但未全选。全选框的状态
				checkAll: 'unImageCheckAll', // 复选框全选，全选框的状态
				checkedList: 'unImageStudentList', // 选中的数据，可用于表单数据双向绑定
				plainOptions: 'unImageStudentOptions', // 可供选选项
			},

			// 投影仪问题配置
			projectorNotAll: false, //未全选状态
			projectorCheckAll: false, // 全选状态
			projectorStudentOptions: ['投影仪效果不好', '投影仪分辨率不高', '投影仪已坏，不能使用'], // 可选项
			projectorStudentDefault: [], // 默认选项
			projectorParam: {
				indeterminate: 'projectorNotAll',// 复选框选中一个或多个，但未全选。全选框的状态
				checkAll: 'projectorCheckAll', // 复选框全选，全选框的状态
				checkedList: 'projectorDamage', // 选中的数据，可用于表单数据双向绑定
				plainOptions: 'projectorStudentOptions', // 可供选选项
			},
			
			// 电脑问题配置
			computerNotAll: false, //未全选状态
			computerCheckAll: false, // 全选状态
			computerStudentOptions: ['电脑系统老旧，反应慢', '电脑病毒多', '电脑损坏，不能使用'], // 可选项
			computerStudentDefault: [], // 默认选项
			computerParam: {
				indeterminate: 'computerNotAll',// 复选框选中一个或多个，但未全选。全选框的状态
				checkAll: 'computerCheckAll', // 复选框全选，全选框的状态
				checkedList: 'computerDamage', // 选中的数据，可用于表单数据双向绑定
				plainOptions: 'computerStudentOptions', // 可供选选项
			},

			// 其他问题配置
			otherWarnNotAll: false, //未全选状态
			otherWarnCheckAll: false, // 全选状态
			otherWarnStudentOptions: ['桌椅存在损坏', '门窗存在损坏', '未准时开门', '教室卫生较差'], // 可选项
			otherWarnStudentDefault: [], // 默认选项
			otherWarnParam: {
				indeterminate: 'otherWarnNotAll',// 复选框选中一个或多个，但未全选。全选框的状态
				checkAll: 'otherWarnCheckAll', // 复选框全选，全选框的状态
				checkedList: 'otherWarnDamage', // 选中的数据，可用于表单数据双向绑定
				plainOptions: 'otherWarnStudentOptions', // 可供选选项
			},

			// 学生列表
			studentList: [],

			// 班级下的学生
			classStudentList: [],

			// 班主任列表
			headTeacherList: [],

			searchStudentData: [],
			// 缺勤人数操作参数
			truancyStudentParams: {
				paramName: "truancyStudentParams", // 当前参数名字
				visible: false, // 添加学生浮窗显示状态
				selectTemp: [], // 级联选择缓存，选择后清空就不会显示
				selectData: [], //此项可通过级联选择、搜索、手动添加、修改数据等操作来更改,
				checkedStudentList: "checkedTruancyStudentList", // 表单中提交的数据键
				checkedStudentNum: "truancyStudentNum", // 表单中提交的数据键
				addStudent: "", // 添加学生信息
				changeStudent: "", //修改学生信息,
				fetching: false, // 搜索状态
				searchData: [],
			}, //旷课
			lateStudentParams: {
				paramName: "lateStudentParams", // 当前参数名字
				visible: false, // 添加学生浮窗显示状态
				selectTemp: [], // 级联选择缓存，选择后清空就不会显示
				selectData: [], //此项可通过级联选择、搜索、手动添加、修改数据等操作来更改,
				checkedStudentList: "checkedLateStudentList", // 表单中提交的数据键
				checkedStudentNum: "lateStudentNum", // 表单中提交的数据键
				addStudent: "", // 添加学生信息
				changeStudent: "", //修改学生信息,
				fetching: false, // 搜索状态
				searchData: [],
			}, //迟到
			leaveEarlyStudentParams: {
				paramName: "leaveEarlyStudentParams", // 当前参数名字
				visible: false, // 添加学生浮窗显示状态
				selectTemp: [], // 级联选择缓存，选择后清空就不会显示
				selectData: [], //此项可通过级联选择、搜索、手动添加、修改数据等操作来更改,
				checkedStudentList: "checkedLeaveEarlyStudentList", // 表单中提交的数据键
				checkedStudentNum: "leaveEarlyStudentNum", // 表单中提交的数据键
				addStudent: "", // 添加学生信息
				changeStudent: "", //修改学生信息,
				fetching: false, // 搜索状态
				searchData: [],
			}, //早退
			leaveStudentParams: {
				paramName: "leaveStudentParams", // 当前参数名字
				visible: false, // 添加学生浮窗显示状态
				selectTemp: [], // 级联选择缓存，选择后清空就不会显示
				selectData: [], //此项可通过级联选择、搜索、手动添加、修改数据等操作来更改,
				checkedStudentList: "checkedLeaveStudentList", // 表单中提交的数据键
				checkedStudentNum: "leaveStudentNum", // 表单中提交的数据键
				addStudent: "", // 添加学生信息
				changeStudent: "", //修改学生信息,
				fetching: false, // 搜索状态
				searchData: [],
			}, //请假

			rules: {
				classRoomName: [{ required: true, message: '请输入教室编号！', trigger: 'blur' }],
				postDateTemp: [{ required: true, message: '请选择日期！', trigger: 'blur' }],
				checkedClass: [{ required: true, message: '请选择班级！', trigger: 'blur' }],
				course: [{ required: true, message: '请选择课程！', trigger: 'blur' }],
				checkedHeadTeacher: [{ required: true, message: '请选择班主任！', trigger: 'blur' }],
				section: [{ required: true, message: '请选择上课节次信息！', trigger: 'blur' }],
				attendNum: [{ required: true, message: '请输入应到人数', trigger: 'blur' }],
				trueAttendNum: [{ required: true, message: '请输入实到人数', trigger: 'blur' }],
			},
		}
	},

	created() {
		this.user = this.$store.state.account.user;
		this.form.teacherName = this.user.nick_name;
		this.form.teacherId = this.user.id;
		this.initTeacherConf();
		this.initSection();
		this.getTeacherConfigClassStudent();
	},

	computed: {
		

		filteredCheckedHeadTeacher() {
			return this.headTeacherList.filter(o => !this.form.checkedHeadTeacher.includes(o));
		},

		checkNums() {
			return this.form.trueAttendNum < this.form.attendNum ? true : false; 
		},

		checkNumOverFlow() {
			let absenceTotalNum = this.form.attendNum - this.form.trueAttendNum;
			let checkAbsenceNum = this.form.truancyStudentNum + this.form.lateStudentNum + this.form.leaveEarlyStudentNum + this.form.leaveStudentNum
			let res = absenceTotalNum - checkAbsenceNum;
			return res <= 0 ? false : true;
		}
	},
	
	methods: {
		// 初始化初始节次
		initSection() {
			for (let i = 1; i <= 12 ; i++) {
				this.sectionData.push({
					value: i,
					label: i,
					isLeaf: false,
				})
			}
		},

		// 获取教师配置项
		initTeacherConf() {
			getTeacherConfig(this.user.id).then((res) => {
                let resObj = res.data;
                if (!resObj.data) {
					this.$message.error("您还未对教学信息配置！将带您前往配置页面").then(() => {
						this.$closePage(this.$route.path, '/teacher/teacherConf');
					}).catch((err) => {
						throw Error(err);
					});
				}
				if (!resObj.data.department) {
					this.$message.error("您还未设置您所属部门！").then(() => {
						this.$closePage(this.$route.path, "/teacher/teacherConf");
					});
					return false;
				}
				this.classList = resObj.data.class_name;
				this.headTeacherList = resObj.data.head_teacher.split(",");
				this.courseList = resObj.data.course_name.split(",");
				this.form.department = resObj.data.department;
            }).catch((err) => {
                throw Error(err);
            });
		},

		// 获取老师配置下班级所对应的学生列表
        async getTeacherConfigClassStudent() {
            return getClassStudent(this.user.id).then((res) => {
				let resObj = res.data;
				if (resObj.code == 1 && resObj.data) {
					this.classStudentList = resObj.data;
				}
			}).catch((err) => {
				throw Error(err);
			});
        },

		// 选择日期
		checkDate(date, dateString) {
			this.$set(this.form, 'postDate', Number(moment(dateString).format('x')));
		},

		// 动态加载二级节次
		loadSectionData(selectedOptions){
			// 找出选择的是谁
			const targetOption = selectedOptions[selectedOptions.length - 1];
			let childrenData = [];
			for (let i = targetOption.value; i <= this.sectionData.length; i++) {
				childrenData.push({
					label: i,
					value: i
				})
			}
			targetOption.children = childrenData;
		},

		// 复选框单击事件
		onCheckGroupChange(checkedList, e) {
			this[e.indeterminate] = !!checkedList.length && checkedList.length < this[e.plainOptions].length;
			this[e.checkAll] = checkedList.length ===  this[e.plainOptions].length;
		},

		// 全选框单击事件
		onCheckAllChange(e, param) {
			this[param.indeterminate] = false; // 未全选状态为假
			this[param.checkAll] = e.target.checked, // 全选框选中状态
			// 表单双向绑定数据则会被选中
			this.$set(this.form, param.checkedList, (e.target.checked ? this[param.plainOptions] : []));
		},

		// 学生复选框组点击事件
		checkClick(...args) {
			let item = args[0];
			let param = args[1];

			// 如果取消勾选且数据来源为select则加回原列表
			if (param.selectData[args[2]].dataSrcType == 'select') {
				this.studentList.map((ele, i, arr) => {
					if (ele.value == item.parent) {
						// 父级还在加子级
						ele.children.push({
							value: item.children,
							label: item.children
						})
					}else if (arr.findIndex(e => {if(e.value == item.parent) return true}) < 0) {
						// 找不到父级再加
						arr.push({
							value: item.parent,
							label: item.parent,
							children: [ { value: item.children, label: item.children } ],
						})
					}
				})	
			}

			// 删掉当前复选框组
			let temp = param.selectData;
			temp.splice(temp.findIndex(e => {if(e.value == item.value) return true}), 1);
			
			// 更改当前表单中选择的学生列表和学生人数
			this.form[param.checkedStudentList] = temp.map(item => {return item.value});
			this.form[param.checkedStudentNum] = this.form[param.checkedStudentList].length;
		},

		// 级联选择学生确定事件
		selectStudenConfirm(...args) {
			// 验证学生数是否上限
			if (!this.checkNumOverFlow) {
				this.$message.error("人选满了");
				return false;
			}
			let event = args[0];
			let param = args[1];
			let student = event[0][0] + event[0][1]; // 班级+姓名
			param.selectTemp = []; // 清空选择缓存
			// 当前已选就不做操作
			if (this.form[param.checkedStudentList].includes(student)) {
				return false;
			}
			this.form[param.checkedStudentList].push(student);
			param.selectData.push({
				value: student,
				parent: event[0][0],
				children: event[0][1],
				visible: false,
				changeStudent: "",
				dataSrcType: args[2], // 确定当前数据由何而来
			}) //添加复选框数据

			this.form[param.checkedStudentNum] += 1; // 每选一个学生，学生数就加1
			this.studentList.forEach((item, index, arr) => {
				if (item.value == event[0][0]) {
					if (item.children.length > 0) {
						item.children.forEach((item_s, index_s, arr_s) => {
							if (item_s.value == event[0][1]) {
								arr_s.splice(index_s, 1); // 找到并删除当前已经添加的
								if (arr_s.length == 0) {
									arr.splice(index, 1); // 没有子选项则删除父选项 
								}
							}
						})
					}
				}
			})
		},

		// 自动搜索
		autoSearch(e, param) {
			param.fetching = true;
			searchStudentList(e[0]).then(res => {
				let resObj = res.data;
				if (resObj.data.length > 0) {
					let data = resObj.data;
					param.searchData = data.map(el => ({
						text: el.class_name + el.name,
						value: `${el.class_name}-${el.name}`,
					}))
				}
				
			}).catch(err => {
				throw Error(err);
			}).finally(() => {
				setInterval(() => {
					param.fetching = false;
				}, 2000);
			});
		},

		// 点击搜索结果
		clickSearchStudnetRes(...args) {
			// 验证学生数是否上限
			if (!this.checkNumOverFlow) {
				this.$message.error("人选满了");
				return false;
			}
			// 点击搜索结果、点击清除按钮、关闭tag按钮会触发
			let key = args[0][0];
			let param = args[1];
			let info = key.split("-");
			if(this.form[param.checkedStudentList].findIndex(e => {if(e == (info[0] + info[1])) return true}) == -1){
				// 不存在这个就执行添加操作
				this.form[param.checkedStudentList].push(info[0] + info[1]);
				this.form[param.checkedStudentNum] += 1; // 每选一个学生，学生数就加1
				param.selectData.push({
					value: info[0] + info[1],
					parent: info[0],
					children: info[1],
					visible: false,
					changeStudent: "",
					dataSrcType: args[2], // 确定当前数据由何而来
				})
			}
		},

		// 添加学生
		addStu(params, type) {
			params.visible = false;
			let insertArr = params.addStudent.split(/、|,| |，/);
			params.addStudent = "";
			// 验证学生数是否上限
			if (!this.checkNumOverFlow) {
				this.$message.error("人选满了");
				return false;
			}
			insertArr.forEach(e =>{
				// 不存在就插入
				if (!this.form[params.checkedStudentList].includes(e)) {
					this.form[params.checkedStudentList].push(e);
						params.selectData.push({
						value: e,
						visible: false,
						disabled: true,
						changeStudent: "",
						dataSrcType: type, // 确定当前数据由何而来
					})
					this.form[params.checkedStudentNum] += 1;
				}
			})
		},

		// 修改学生信息
		changeStu(params, key) {
			if (params.selectData[key].changeStudent) {
				this.form[params.checkedStudentList].map((e, i, a) => {
					if(e == params.selectData[key].value){
						a[i] = params.selectData[key].changeStudent;
					}
				})
				params.selectData[key].value = params.selectData[key].changeStudent;
			}
		},

		// 右击删除添加的学生
		Rclick(params, key) {
			if (params.selectData[key].dataSrcType === "input") {
				this.form[params.checkedStudentList].map((ele, keys, arr) => {
					if (ele == params.selectData[key].value) {
						arr.splice(keys, 1);
					}
				});
				params.selectData.splice(key, 1);
				this.form[params.checkedStudentNum] -= 1;
			}
		},

		// 单选框改变事件
		useMediaChange(e) {
			this.form.useMedia = e.target.value;
		},

		// 选择班级回调事件
		selectCheckedClass(e) {
			this.classStudentList.map(item => {
				if (item.value == e) {
					this.studentList.push(item);
				}
			});
		},

		// 取消选择班级回调事件
		deselectCheckedClass(e) {
			this.studentList.map((item, index) => {
				if (item.value == e) {
					this.studentList.splice(index, 1);
				}
			});
		},

		// 节次选择事件
		onChangeSection(value) {
			this.$set(this.form, 'section', value.join('-'));
			this.sectionValue = value;
		},

		// 提交
		submitForm() {
			this.submitStatus = true;
			this.$refs.dailyForm.validate(valid => {
				if (!valid) {
					this.submitStatus = false;
					return false;
				}
				this.form.postDateTemp = undefined;
				this.form.submit_time = (new Date()).getTime();
				dailySubmit(this.form).then((res) => {
					let resObj = res.data;
					if (resObj.code == 1) {
						try {
							this.$refreshPage("/teacher/dailyList");
						} catch (error) {
							throw Error(error);
						}
						this.$message.success("提交成功！", () => {
							this.$refreshPage(this.$route.path);
						});
					}
				}).catch((err) => {
					throw Error(err);
				}).finally(()=>{
					this.submitStatus = false;
				});
			})
		},

		// 重置
		resetForm() {
			this.$refreshPage(this.$route.path);
		},
	}
}
</script>