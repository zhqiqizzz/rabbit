<script setup>
import { findHotApi } from '@/apis/home';
import HomePanel from '@/views/Home/components/HomePanel.vue';
import { onMounted, ref } from 'vue';
const hotGoods = ref([]);
const findHot = async () => {
    const res = await findHotApi();
    hotGoods.value = res.result;
}
onMounted(() => {
    findHot();
})
</script>

<template>
    <HomePanel title="人气推荐" subTitle="人气爆款，精选好货">
        <!-- 使用默认插槽填充余下内容 -->
        <ul class="goods-list">
            <li v-for="item in hotGoods" :key="item.id">
                <RouterLink to="/">
                    <img v-img-lazy="item.picture" alt="Hot Good" />
                    <p class="title">{{ item.title }}</p>
                    <p class="alt">{{ item.alt }}</p>
                </RouterLink>
            </li>
        </ul>
    </HomePanel>
</template>

<style scoped lang="scss">
.goods-list {
    display: flex;
    justify-content: space-between;
    height: 406px;

    li {
        width: 306px;
        height: 406px;

        background: #f0f9f4;
        transition: all 0.5s;

        &:hover {
            // 让商品图片悬浮效果更明显
            transform: translate3d(0, -3px, 0);
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
        }

        img {
            width: 306px;
            height: 306px;
            flex-shrink: 0; 
            object-fit: cover;
        }

        p {
            font-size: 22px;
            padding-top: 12px;
            text-align: center;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }
        .alt {
            font-size: 16px;
            color: #999;
        }
    }
}
</style>