<script setup>
import bwPowerSet from '@/components/Sku/power-map.js'
import { watch } from 'vue'
// 商品数据
const props = defineProps({
  goods: {
    type: Object,
    default: () => ({})
  },
})
const emit = defineEmits(['changeSku'])
let pathMap = {}

// 如果当前项被选中, 则取消选中
// 如果当前项未被选中, 则把同排所有项取消选中, 再选中当前项
     // 即先干掉其他人, 再选中自己
// 首次渲染：val.selected → undefined → { selected: false } → 没有选中样式 ✅
// 点击后：val.selected → true → { selected: true } → 有选中样式 ✅
// Vue 3 会自动帮你绑定新属性
// 直接在 changeSelectedStatus 里写 val.selected = true 就行
// 不需要初始化（除非有默认选中需求）
const changeSelectedStatus = (item, val) => {
  if(val.disabled) return
  if(val.selected) { val.selected = false }
  else {
    item.values.forEach(val => val.selected = false)
    val.selected = true
  }
  // 更新禁用状态
  updateDisabledStatus(props.goods.specs, pathMap)
  // 产出有效的SKU信息(所有规格都有选中项时)
  const selectedValues = getSelectedValues(props.goods.specs)
  if(!selectedValues.includes(undefined)) {
    const skuKey = selectedValues.join("-")
    const skuIds = pathMap[skuKey]
    const sku = props.goods.skus.find(sku => sku.id === skuIds[0])
    emit('changeSku', {
      skuId: sku.id,
      price: sku.price,
      oldPrice: sku.oldPrice,
      inventory: sku.inventory,
      specsText: sku.specs
        .map(spec => `${spec.name}：${spec.valueName}`)
        .join(' ')
    })
  } else {
    emit('changeSku', {})
  }
}

// 生成路径映射表
const getPathMap = (goods) => {
  const pathMap = {}
  // 1. 根据skus字段, 生成有效的sku数组
  const effectiveSkus = goods.skus.filter(sku => sku.inventory > 0)
  // 2. 遍历有效sku数组, 利用子集算法 [1, 2] => [], [1], [2], [1,2]
  effectiveSkus.forEach(sku => {
    // 2.1 获取匹配的valueName组成的数组
    // eg: ["蓝色","20cm","日本"]
    const selectedValArr = sku.specs.map(val => val.valueName)
    // 2.2 生成子集
    const valueArrPowerSet = bwPowerSet(selectedValArr)
    // 3. 把得到的子集生成最终的路径映射表
    valueArrPowerSet.forEach(arr => {
      // 初始化key 数组join -> 字符串 对象的key 
      // eg: "蓝色-20cm"
      const key = arr.join("-")
      if(!pathMap[key]) {
        pathMap[key] = [sku.id]
      } else {
        // 已有key, 追加sku.id
        pathMap[key].push(sku.id)
      }
    })
  })
  return pathMap
}

// 初始化禁用状态
const initDisabledStatue = (specs, pathMap) => {
  specs.forEach(spec => {
    spec.values.forEach(val => {
      // 1. 获取当前规格值对应的key
      // eg: "蓝色"
      const key = val.name
      // 2. 去路径映射表里找
      if(!pathMap[key]) {
        // 3. 如果没有找到, 说明该规格值不可选
        val.disabled = true
      } else {
        val.disabled = false
      }
    })
  })
}

// 按照顺序得到规格选中项的数组['蓝色', '20cm', undefined]
const getSelectedValues = (specs) => {
  const selectedValues = []
  specs.forEach(spec => {
    // 在 spec.values 数组中 找第一个 item.selected === true 的元素
    // 如果用户没选这个规格 则返回undefined
    const selectedVal = spec.values.find(val => val.selected)
    selectedValues.push(selectedVal ? selectedVal.name : undefined)
  })
  return selectedValues
}

// 「遍历每个规格 → 遍历每个选项 → 模拟选择该选项 → 判断pathMap → 更新禁用状态」
// 更新每个规格选项的「禁用状态」
const updateDisabledStatus = (specs, pathMap) => {
  specs.forEach((spec, index) => {
    // 1. 为了在处理每一个规格前 都能获取到「纯净、未被污染的用户实际选中状态」
    const selectedValues = getSelectedValues(specs)
    // 步骤 2：核心：模拟「选择当前选项 val」的场景（临时修改 selectedValues）
    // 原理：将当前规格（specIndex）对应的选中项，替换为 val.name（模拟用户点了这个选项）
    // 此时：selectedValues 从 ['蓝色', undefined, undefined] 变为 ['蓝色', val.name, undefined]（处理尺寸时）
    spec.values.forEach(val => {
      selectedValues[index] = val.name
      // 步骤 3：根据模拟的 selectedValues 去 pathMap 里找
      const key = selectedValues.filter(v => v).join("-")
      // 步骤 4：更新禁用状态
      val.disabled = !pathMap[key]
    })
  })
}

// 初始化 SKU
const initSku = () => {
  if (props.goods.skus) {
    pathMap = getPathMap(props.goods)
    initDisabledStatue(props.goods.specs, pathMap)
  }
}

// 监听 goods 变化
watch(
  () => props.goods,
  () => initSku(),
  { immediate: true }
)
</script>

<template>
  <div class="goods-sku">
    <dl v-for="item in goods.specs" :key="item.id">
      <dt>{{ item.name }}</dt>
      <dd>
        <template v-for="val in item.values" :key="val.name">
          <!-- 图片类型规格 -->
          <img v-if="val.picture" :src="val.picture" :title="val.name"  
            @click="changeSelectedStatus(item, val)"
            :class="{
              selected: val.selected,
              disabled: val.disabled
            }">
          <!-- 文字类型规格 -->
          <span v-else @click="changeSelectedStatus(item, val)" 
            :class="{selected: val.selected, disabled: val.disabled}">
            {{ val.name }}
          </span>
        </template>
      </dd>
    </dl>
  </div>
</template>

<style scoped lang="scss">
@mixin sku-state-mixin {
  border: 1px solid #e4e4e4;
  margin-right: 10px;
  cursor: pointer;

  &.selected {
    border-color: #27ba9b;
  }

  &.disabled {
    opacity: 0.6;
    border-style: dashed;
    cursor: not-allowed;
  }
}

.goods-sku {
  padding-left: 10px;
  padding-top: 20px;

  dl {
    display: flex;
    padding-bottom: 20px;
    align-items: center;

    dt {
      width: 50px;
      color: #999;
    }

    dd {
      flex: 1;
      color: #666;

      >img {
        width: 50px;
        height: 50px;
        margin-bottom: 4px;
        @include sku-state-mixin;
      }

      >span {
        display: inline-block;
        height: 30px;
        line-height: 28px;
        padding: 0 20px;
        margin-bottom: 4px;
        @include sku-state-mixin;
      }
    }
  }
}
</style>