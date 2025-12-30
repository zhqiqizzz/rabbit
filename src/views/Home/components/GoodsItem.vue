<script setup>
defineProps({
    goods: {
        type: Object,
        default: () => {}
    }
})
</script>

<template>
    <RouterLink class="goods-item" :to="`/detail/${goods.id}`">
        <img v-img-lazy="goods.picture" alt="product">
        <p class="name ellipsis">{{goods.name}}</p>
        <p class="desc ellipsis">{{goods.desc}}</p>
        <p class="price">&yen;{{goods.price}}</p>
    </RouterLink>
</template>

<style scoped lang="scss">
.goods-item {
    display: block;
    width: 240px;
    padding: 20px 30px;
    text-align: center;
    transition: all 0.5s;

    &:hover {
        transform: translate3d(0, -3px, 0);
        box-shadow: 0 3px 8px rgb(0, 0, 0, 0.2);
    }

    img {
        width: 160px;
        height: 160px;
        object-fit: contain;
    }

    p {
        padding-top: 10px;
    }
    .name {
        font-size: 16px;
    }

    .desc {
        color: #999;
        height: 29px;
    }

    .price {
        color: $priceColor;
        font-size: 20px;
    }         
}
</style>