<script setup>
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
const userStore = useUserStore();
const router = useRouter();
const handleLogout = () => {
    userStore.clearUserInfo();
    router.push('/login');
}
</script>
<template>
    <nav class="app-topnav">
        <div class="container">
            <ul>
                <template v-if="userStore.userInfo.token">
                    <li><a href="javascript:;"><i class="iconfont icon-user"></i>周杰伦</a></li>
                    <li>
                        <el-popconfirm @confirm="handleLogout" title="确认退出登录吗？" 
                            confirm-button-text="确定"
                            cancel-button-text="取消">
                            <template #reference>
                                <a href="javascript:;">退出登录</a>
                            </template>
                        </el-popconfirm>
                    </li>
                    <li><RouterLink to="/myorder">我的订单</RouterLink></li>
                    <li><RouterLink to="/member">会员中心</RouterLink></li>
                </template>
                <template v-else>
                    <li><RouterLink to="/login">请先登录</RouterLink></li>
                    <li><a href="javascript:;">帮助中心</a></li>
                    <li><a href="javascript:;">关于我们</a></li>
                </template>
            </ul>
        </div>
    </nav>
</template>

<style scoped lang="scss">
.app-topnav {
    background: #333;
    ul {
        display: flex;
        height: 53px;
        justify-content: flex-end;
        align-items: center;
        li {
            a {
                color: #cdcdcd;
                padding: 0 15px;
                line-height: 1;
                display: inline-block;
                i {
                    font-size: 14px;
                    margin-right: 2px;
                }
                &:hover {
                    color: $xtxColor;
                }
            }
            ~li{
                a {
                    border-left: 2px solid #666;
                }
            } 
        }
    }
}
</style>