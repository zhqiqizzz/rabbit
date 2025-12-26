<script setup>
import { getCategoryFilterAPI } from '@/apis/category';
import { getSubCategoryAPI } from '@/apis/category';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import GoodsItem from '@/views/Home/components/GoodsItem.vue';

// 获取二级分类数据
const filterData = ref({})
const route = useRoute()
const getCategoryFilter = async () => {
    const res = await getCategoryFilterAPI(route.params.id)
    filterData.value = res.result
}

watch (
    () => route.params.id,
    () => { getCategoryFilter() },
    { immediate: true }
)

// 获取商品数据
const goodsList = ref([])
const reqData = ref({
    categoryId: route.params.id,
    page: 1,
    pageSize: 20,
    sortField: 'publishTime',
})
const getGoodsList = async () => {
    // 调用获取商品列表的接口
    const res = await getSubCategoryAPI(reqData.value)
    goodsList.value = res.result.items
}
onMounted(() => {
    getGoodsList()
})

// tab切换，改变goods数据
const tabChange = () => {
    console.log('tab改变了', reqData.value.sortField)
    reqData.value.page = 1
    getGoodsList()
}

// 触底加载更多
const disabled = ref(false)
const loadMore = async () => {
    // 页码加1，调用获取商品列表的接口，追加数据到goodsList中
    reqData.value.page++
    const res = await getSubCategoryAPI(reqData.value)
    goodsList.value = [...goodsList.value, ...res.result.items]
    // 如果没有更多数据，停止发送请求
    if (res.result.items.length ===0) {
        disabled.value = true
    }
}
</script>

<template>
  <div class="container ">
    <!-- 面包屑 -->
    <div class="bread-container">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/category/${filterData.parentId}` }">{{filterData.parentName}}</el-breadcrumb-item>
        <el-breadcrumb-item>{{filterData.name}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="sub-container">
      <el-tabs v-model="reqData.sortField" @tab-change="tabChange">
        <el-tab-pane label="最新商品" name="publishTime"></el-tab-pane>
        <el-tab-pane label="最高人气" name="orderNum"></el-tab-pane>
        <el-tab-pane label="评论最多" name="evaluateNum"></el-tab-pane>
      </el-tabs>
      <div class="body" v-infinite-scroll="loadMore" :infinite-scroll-disabled="disabled">
          <!-- 商品列表-->
          <GoodsItem v-for="item in goodsList" :key="item.id" :goods="item" />
      </div>
    </div>
  </div>
</template>



<style lang="scss" scoped>
.bread-container {
  padding: 25px 0;
  color: #666;
}

.sub-container {
  padding: 20px 10px;
  background-color: #fff;

  .body {
    display: flex;
    flex-wrap: wrap;
    padding: 0 10px;
  }

  .goods-item {
    display: block;
    width: 220px;
    margin-right: 20px;
    padding: 20px 30px;
    text-align: center;

    img {
      width: 160px;
      height: 160px;
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

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }


}
</style>