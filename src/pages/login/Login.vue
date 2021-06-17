<template>
	<common-layout>
		<div class="top">
			<div class="header">
				<img alt="logo" class="logo" src="@/assets/img/logo.png" />
			</div>
			<div class="desc">教学管理日报系统</div>
		</div>
		<div class="login">
			<a-tabs size="large" :tabBarStyle="{textAlign: 'center'}" style="padding: 0 2px;" @change="tabsChange">
				<a-tab-pane tab="账户密码登录" key="1">
					<a-form @submit="onSubmit" :form="form">
						<a-alert type="error" :closable="true" v-if="error" :message="error" @close='onClose' showIcon style="margin-bottom: 24px;" />
						<a-form-item>
							<a-input
								autocomplete="autocomplete"
								size="large"
								placeholder="请输入用户名"
								v-decorator="['name', {rules: [{ required: true, message: '请输入账户名', whitespace: true}]}]"
							>
								<a-icon slot="prefix" type="user" />
							</a-input>
						</a-form-item>
						<a-form-item>
							<a-input
								size="large"
								placeholder="请输入密码"
								autocomplete="autocomplete"
								type="password"
								v-decorator="['password', {rules: [{ required: true, message: '请输入密码', whitespace: true}]}]"
							>
								<a-icon slot="prefix" type="lock" />
							</a-input>
						</a-form-item>
						<a-form-item>
							<a-button :loading="logging" style="width: 100%;margin-top: 24px" size="large" htmlType="submit" type="primary">登录</a-button>
						</a-form-item>
						<div>
							<router-link style="float: left" to="/dashboard/workplace" >忘记密码</router-link>
							<router-link style="float: right" to="/dashboard/workplace" >注册账户</router-link>
						</div>
					</a-form>
				</a-tab-pane>
				<a-tab-pane tab="扫码登陆" key="2">
					<a-spin tip="生成中..." :spinning="spinning">
						<div style="width:300px; height:300px; margin-left:8.5%;">
							<img :src="img" style="width:250px; height:250px; margin-left: 25px; margin-top:25px;">
						</div>
					</a-spin>
				</a-tab-pane>
			</a-tabs>
		</div>
	</common-layout>
</template>

<script>
import CommonLayout from '@/layouts/CommonLayout'
import {login, getQRCode, checkScanQRCode} from '@/services/user'
import {setAuthorization} from '@/utils/request'
import {loadRoutes} from '@/utils/routerUtil'
import {mapMutations} from 'vuex'
import { getUUID } from "@/utils/tools";

export default {
	name: 'Login',
	components: {CommonLayout},
	data () {
		return {
			logging: false,
			error: '',
			form: this.$form.createForm(this),
			tabsKey: "1",
			uuid: null,
			timestamp: 0,
			img: "../../assets/img/AntD.png",
			spinning: true,
			timer: 0,
		}
	},

	methods: {
		...mapMutations('account', ['setUser', 'setPermissions', 'setRoles']),
		
		// 登录按钮
		onSubmit (e) {
			if(this.tabsKey != 1){
				this.$message.error("暂不支持此方式登录，请选择账户密码登录");
				return false;
			}
			e.preventDefault()
			this.form.validateFields((err) => {
				if (!err) {
					this.logging = true
					const name = this.form.getFieldValue('name')
					const password = this.form.getFieldValue('password')
					login(name, password).then(this.afterLogin)
				}
			})
		},

		// 获得服务器返回消息
		afterLogin(res) {
			this.logging = false
			const loginRes = res.data
			if (loginRes.code == 1) {
				const {user, role} = loginRes.data;
				this.setUser(user); // vuex设置用户信息
				this.setRoles(role);
				setAuthorization({token: loginRes.data.token, expireAt: new Date(loginRes.data.token_expire)}); // 设置cookie(jwt身份信息)
				// 设置路由
				let route = [{
					router: 'root',
					children: loginRes.data.menu
				}];
				loadRoutes(route);
				this.$router.push(`/${route[0].children[0].router}`);
				this.$message.success(loginRes.msg, 3)
			} else {
				this.error = loginRes.msg
			}
		},

		onClose() {
			this.error = false
		},

		tabsChange(e) {
			this.tabsKey = e;
			if (e == 2) {
				let time = new Date().getTime();
				if (this.uuid == null && this.timestamp < time) {
					let time = new Date().getTime();
					let uuid = getUUID(time.toString());
					this.uuid = uuid;
					this.timestamp = time + 300*1000;
				}
				// 图片被改过或者已过期
				if (this.img == "../../assets/img/AntD.png" || time > this.timestamp) {
					getQRCode({ uuid: this.uuid.replaceAll("-", "") }).then((res) => {
						let resObj = res.data;
						if (resObj.code == 1) {
							this.img = `data:image/png;base64,${resObj.data.img}`;
							this.timer = setInterval(() => {
								setTimeout(this.checkScan(), 0);
							}, 1500);
						}
					}).catch((err) => {
						throw Error(err);
					}).finally(() => {
						this.spinning = !this.spinning;
					})
				}
			}
		},

		checkScan() {
			checkScanQRCode({ uuid: this.uuid.replaceAll("-", "") }).then(res=>{
				let resObj = res.data;
				// 出错结束定时器
				if (resObj.code != 1) {
					clearInterval(this.timer);
				}
				// 成功登录结束定时器
				if (Object.keys(resObj.data).length > 0){
					clearInterval(this.timer);
					this.afterLogin(res);
				}
			}).catch(err => {
				clearInterval(this.timer);
				throw Error(err);
			});
		},
	}
}
</script>

<style lang="less" scoped>
	.common-layout{
		.top {
			text-align: center;
			.header {
				height: 44px;
				line-height: 44px;
				a {
					text-decoration: none;
				}
				.logo {
					height: 72px;
					vertical-align: top;
				}
				.title {
					font-size: 33px;
					color: @title-color;
					font-family: 'Myriad Pro', 'Helvetica Neue', Arial, Helvetica, sans-serif;
					font-weight: 600;
					position: relative;
					top: 2px;
				}
			}
			.desc {
				font-size: 14px;
				color: @text-color-second;
				margin-top: 40px;
				margin-bottom: 40px;
			}
		}
		.login{
			width: 368px;
			margin: 0 auto;
			@media screen and (max-width: 576px) {
				width: 95%;
			}
			@media screen and (max-width: 320px) {
				.captcha-button{
					font-size: 14px;
				}
			}
			.icon {
				font-size: 24px;
				color: @text-color-second;
				margin-left: 16px;
				vertical-align: middle;
				cursor: pointer;
				transition: color 0.3s;

				&:hover {
					color: @primary-color;
				}
			}
		}
	}
</style>