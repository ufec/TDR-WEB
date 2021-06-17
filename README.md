# TDR-WEB

TDR-WEB（教学管理日报系统网页版端）

## 安装

获取源代码

```shell
https://github.com/ufec/TDR-WEB.git
```

安装依赖

```shell
npm install
```

## 使用

根目录下有 `.env` 和 `.env.development` 两个环境变量，顾名思义，后者为开发环境，前者便为线上环境，靠命令区分

开发环境

```shell
npm run serve
```

线上环境

```shell
npm run build
```

### 配置解释

主要需要修改 `VUE_APP_API_BASE_URL` 按照你的环境来，线上环境 or 开发环境

## 界面展示

扫码登陆
![扫码登陆](https://images.gitee.com/uploads/images/2021/0617/185038_c606b657_7523882.png)

用户管理
![用户管理](https://images.gitee.com/uploads/images/2021/0617/185146_9c4fc956_7523882.png)

权限管理
![权限管理](https://images.gitee.com/uploads/images/2021/0617/185449_d32079e7_7523882.png)

菜单管理
![菜单管理](https://images.gitee.com/uploads/images/2021/0617/185648_c549f8ca_7523882.png)

日报数据
![日报数据](https://images.gitee.com/uploads/images/2021/0617/185710_c244e7ea_7523882.png)

学生数据
![学生数据](https://images.gitee.com/uploads/images/2021/0617/185734_2117f2b9_7523882.png)

部门数据
![部门数据](https://images.gitee.com/uploads/images/2021/0617/185802_34330eb4_7523882.png)

## 鸣谢

- 开源项目 [vue-antd-admin](https://gitee.com/iczer/vue-antd-admin.git) , 感谢[iczer](https://gitee.com/iczer)大佬
- 开源项目 [Ant Design Vue](https://github.com/vueComponent/ant-design-vueo)