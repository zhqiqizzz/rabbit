<script setup lang="js">
import HomePanel from '@/views/Home/components/HomePanel.vue';
import { getGoodsApi } from '@/apis/home';
import GoodsItem from "@/views/Home/components/GoodsItem.vue";
import { ref, onMounted } from 'vue';

const goodsList = ref([])
const getGoods = async () => {
    const res = await getGoodsApi()
    goodsList.value = res.result
}
onMounted(() => {getGoods()})
</script>

<template>
    <div class="home-product">
        <HomePanel v-for="item in goodsList" :key="item.id" :title="item.name">
            <div class="box">
                <RouterLink class="cover" :to="`/category/${item.id}`">
                    <img v-img-lazy="item.picture" alt="show">
                    <strong class="label">
                        <span>{{item.name}}馆</span>
                        <span>{{item.saleInfo}}</span>
                    </strong>
                </RouterLink>
                <ul class="goods-list">
                    <li v-for="i in item.goods" :key="i.id">
                        <GoodsItem :goods="i" />
                    </li>
                </ul>
            </div>
        </HomePanel>
    </div>
</template>

<style scoped lang="scss">
.home-product {
    background: #fff;
    margin-top: 20px;

    .box {
        display: flex;

        .cover {
            width: 240px;
            height: 610px;
            margin-right: 10px;
            position: relative;

            img {
                width: 100%;
                height: 200%;
                flex-shrink: 0;
                object-fit: cover;
            }

            .label {
                position: absolute;
                width: 188px;
                height: 66px;
                display: flex;
                font-size: 18px;
                color: #fff;
                line-height: 66px;
                font-weight: normal;
                left: 0;
                top: 50%;
                transform: translate3d(0, -50%, 0);

                span {
                    text-align: center;
                    &:first-child {
                        width: 76px;
                        background: rgb(0, 0, 0, 0.9);
                    }

                    &:last-child {
                        flex: 1;
                        background: rgb(0, 0, 0, 0.7);
                    }
                }
            }
        }

        .goods-list {
            width: 990px;
            display: flex;
            flex-wrap: wrap;

            li {
                width: 240px;
                height: 300px;
                margin-right: 10px;
                margin-bottom: 10px;

                // 最右侧的元素不需要右边距
                &:nth-child(4n) {
                    margin-right: 0;
                }

                //最后一行的元素不需要下边距
                &:nth-last-child(-n + 4) {
                    margin-bottom: 0;
                }
            }
        }
    }
}
</style>