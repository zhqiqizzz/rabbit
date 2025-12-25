<script setup>
import HomePanel from '@/views/Home/components/HomePanel.vue';
import { findNewApi } from '@/apis/home';
import { onMounted, ref } from 'vue';
const newGoods = ref([]);
const findNew = async () => {
    const res = await findNewApi();
    newGoods.value = res.result;
}
onMounted(() => {
    findNew();
})
</script>

<template>
    <HomePanel title="新鲜好物" subTitle="为您推荐，好货不断">
        <!-- 使用默认插槽填充余下内容 -->
        <ul class="goods-list">
            <li v-for="item in newGoods" :key="item.id">
                <RouterLink to="/">
                    <img v-img-lazy="item.picture" alt="New Good" />
                    <p class="name">{{ item.name }}</p>
                    <p class="price">&yen;{{ item.price }}</p>
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
        .price {
            color: $priceColor;
        }
    }
}
</style>