<script setup>
    import LayoutNav from '@/views/Layout/components/LayoutNav.vue'
    import LayoutHeader from '@/views/Layout/components/LayoutHeader.vue'
    import LayoutFooter from '@/views/Layout/components/LayoutFooter.vue'
    import LayoutFixed from './components/LayoutFixed.vue';
    import {useCategoryStore} from '@/stores/category.js';
    import { onMounted } from 'vue';

    // 父组件获取分类数据，传递给子组件
    const categoryStore = useCategoryStore()
    onMounted(() => categoryStore.getCategory())
</script>
<template>
    <LayoutNav />
    <LayoutFixed />
    <LayoutHeader />
    <!-- 这里是Home、Category、Detail等页面 -->
     <!-- <RouterView :key="$route.fullPath"/> -->
    <RouterView />
    <LayoutFooter />
</template>