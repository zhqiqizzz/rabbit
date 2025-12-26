<script setup>
    defineProps({
        bannerList: {
            type: Array,
            default: () => []
        }
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
    margin: 0 auto;

    img {
        width: 100%;
        height: 500px;
    }
}
</style>