<template>
    <page-layout :avatar="user.avatar_url">
        <div slot="headerContent">
            <div class="title">{{user.nick_name}}</div>
        </div>
        <a-card>
            <a-form-model :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }" :rules="rules" ref="ruleForm">
                <a-form-model-item label="姓名" prop="nick_name">
                    <a-input placeholder="请输入你的姓名" v-model="form.nick_name" />
                </a-form-model-item>
                <a-form-model-item label="密码" prop="password">
                    <a-input-password v-model="form.password" placeholder="请输入密码（不需要修改密码不需要填）"/>
                </a-form-model-item>
                <a-form-model-item label="重复密码" prop="repeatpassword" v-if="form.password != ''">
                    <a-input-password v-model="form.repeatpassword" placeholder="请重复密码（不需要修改密码不需要填）"/>
                </a-form-model-item>
                <a-form-model-item :wrapper-col="{ span: 14, offset:4 }">
                    <a-button style="width: 100%;margin-top: 24px" size="large" type="primary" @click="submit" :loading="submitStatus" :disabled="submitStatus">保存更改</a-button>
                </a-form-model-item>
            </a-form-model>
        </a-card>
    </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout';
import { mapGetters } from 'vuex';
import { changeUserName,logout } from '@/services/user';
import { removeAuthorization } from '@/utils/request';

export default {
    components: {PageLayout},
    data() {
        let validatePass2 = (rule, value, callback) => {
            if (value !== this.form.password) {
                callback(new Error("两次密码不一致！"));
            } else {
                callback();
            }
        };
        return {
            submitStatus: false,
            form: {
                nick_name: "",
                password: "",
                repeatpassword: "",
            },
            
            rules: {
                nick_name: [{ required: true, message: '请输入姓名！', trigger: 'blur' }],
                repeatpassword: [{ validator: validatePass2, trigger: 'change' }],
            }
        }
    },

    created() {
        this.form.nick_name = this.user.nick_name;
    },

    computed: {
        ...mapGetters('account', ['user']),
    },

    methods: {
        submit() {
            this.$refs.ruleForm.validate(valid => {
                if (!valid) {
                    return false;
                }else{
                    this.submitStatus = true;
                    this.user.nick_name = this.form.nick_name;
                    changeUserName({ 
                        id: this.user.id, 
                        nick_name: this.user.nick_name,
                        password: this.form.password
                    }).then((res) => {
                        let resObj = res.data;
                        if(resObj.code == 1) {
                            if (this.form.password != "" && this.form.repeatpassword != "" && this.form.password === this.form.repeatpassword) {
                                // 修改密码
                                logout().then(() => {
                                    
                                }).catch((err) => {
                                    throw Error(err);
                                }).finally(() => {
                                    this.$message.success(resObj.msg, ()=> {
                                        localStorage.removeItem(process.env.VUE_APP_ROUTES_KEY)
                                        localStorage.removeItem(process.env.VUE_APP_PERMISSIONS_KEY)
                                        localStorage.removeItem(process.env.VUE_APP_ROLES_KEY)
                                        removeAuthorization()
                                        this.$router.push('/login');
                                    });
                                })
                            }else{
                                this.$message.success(resObj.msg, ()=> {
                                    this.$refreshPage(this.$route.path);
                                });
                            }
                        }
                    }).catch((err) => {
                        throw Error(err);
                    }).finally(() => {
                        this.submitStatus = false;
                    });
                }
            })
        },
    }
}
</script>

<style>

</style>