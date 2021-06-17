<template>
  <a-dropdown>
    <div class="header-avatar" style="cursor: pointer">
      <a-avatar class="avatar" size="small" shape="circle" :src="user.avatar_url"/>
      <span class="name">{{user.nick_name}}</span>
    </div>
    <a-menu :class="['avatar-menu']" slot="overlay">
      <a-menu-item>
        <a-icon type="user" />
        <span @click="toUserCenter">个人中心</span>
      </a-menu-item>
      <a-menu-divider />
      <a-menu-item @click="logout">
        <a-icon style="margin-right: 8px;" type="poweroff" />
        <span>退出登录</span>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>
import {mapGetters} from 'vuex'
import {logout} from '@/services/user'
import { removeAuthorization } from '@/utils/request';

export default {
  name: 'HeaderAvatar',
  computed: {
    ...mapGetters('account', ['user']),
  },
  methods: {
    logout() {
      logout().then((res) => {
        if(res.data.code == 1){
          this.$message.success(res.data.msg);
        }
      }).catch((err) => {
        throw Error(err);
      }).finally(() => {
        localStorage.removeItem(process.env.VUE_APP_ROUTES_KEY)
        localStorage.removeItem(process.env.VUE_APP_PERMISSIONS_KEY)
        localStorage.removeItem(process.env.VUE_APP_ROLES_KEY)
        removeAuthorization()
        this.$router.push('/login');
      })
    },
    toUserCenter() {
      this.$openPage("/userCenter");
    }
  }
}
</script>

<style lang="less">
  .header-avatar{
    display: inline-flex;
    .avatar, .name{
      align-self: center;
    }
    .avatar{
      margin-right: 8px;
    }
    .name{
      font-weight: 500;
    }
  }
  .avatar-menu{
    width: 150px;
  }

</style>
