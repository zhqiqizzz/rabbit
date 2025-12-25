<script setup>
import { getBannerApi } from '@/apis/home'
import { onMounted, ref } from 'vue'

const bannerList = ref([]);
const getBanner = async () => {
    const res = await getBannerApi()
    bannerList.value = res.result
}
onMounted(() => {
    getBanner()
})
</script>

<template>
    <div class="home-banner">
        <el-carousel height="500px">
            <el-carousel-item v-for="item in bannerList" :key="item.id">
                <img :src="item.imgUrl" alt="">
            </el-carousel-item>
        </el-carousel>
    </div>
</template>

<style scoped lang="scss">
.home-banner {
    height: 500px;
    width: 1240px;
    /* 脱离文档流, 能够让其他元素占据其位置 */
    position: absolute;
    left: 0;
    top: 0;
    /* 在category的下层 */
    z-index: 98;
    img {
        width: 100%;
        height: 500px;
    }
}
</style>