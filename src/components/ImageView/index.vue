<script setup>
import { ref, watch } from 'vue';
import { useMouseInElement } from '@vueuse/core'

// 图片列表
defineProps({
    imageList: {
        type: Array,
        default: () => []
    }
})

// 鼠标移入小图切换左侧大图
const curIndex = ref(0)
const mouseEnterFn = (index) => {
    curIndex.value = index
}

// 获取鼠标相对元素的位置
	// 1、有效范围内
    // 鼠标坐标（elementX）= 滑块左上角（left） + 滑块半宽（100px）
    // => left = elementX - 100px
    // 且 0 <= left <=200
    // => 100 <= elementX <= 300px
    
    // 2、超出范围
    // elementX < 100  => left = 0
    // elementX > 300  => left = 200
const target = ref(null)
const { elementX, elementY, isOutside }  = useMouseInElement(target)
// 控制滑块跟随鼠标移动（监听elementX/Y变化，一旦变化 重新设置left/top）
const left = ref(0)
const top = ref(0)

const positionX = ref(0)
const positionY = ref(0)
watch([elementX, elementY, isOutside], () => {
    if (isOutside.value) { return }
    // 有效范围内控制滑块距离
    if (elementX.value >= 100 && elementX.value <= 300) {
        left.value = elementX.value - 100
    }
    if (elementY.value >= 100 && elementY.value <= 300) {
        top.value = elementY.value - 100
    }
    // 边界处理
    if (elementX.value < 100) { left.value = 0 }
    if (elementX.value > 300) { left.value = 200 }
    if (elementY.value < 100) { top.value = 0 }
    if (elementY.value > 300) { top.value = 200 }

    // 控制放大镜大图背景位置变化
    // 滑块右移, 背景左移
    positionX.value = -2 * left.value
    positionY.value = -2 * top.value
})
</script>

<template>
    <div class="goods-image">
        <!-- 左侧大图 -->
        <div class="middle" ref="target">
            <img :src="imageList[curIndex]" alt=""/>
            <!-- 蒙层小滑块 - 放大镜时显示在图片之上 -->
             <div class="layer" v-show="!isOutside" :style="{ left: `${left}px`, top: `${top}px` }"></div>
        </div>
        <!-- 右侧小图列表 -->
        <ul class="small">
            <li v-for="(img, index) in imageList" :key="index" @mouseenter="mouseEnterFn(index)" :class="{active: index === curIndex}">
                <img :src="img" alt=""/>
            </li>
        </ul>
        <!-- 放大镜大图 -->
        <div class="large" :style="[{
            backgroundImage: `url(${imageList[curIndex]})`,
            backgroundPositionX: `${positionX}px`,
            backgroundPositionY: `${positionY}px`
        }]" v-show="!isOutside">
        </div>
    </div>
</template>

<style lang="scss" scoped>
.goods-image {
    width: 480px;
    height: 400px;
    position: relative;
    display: flex;

    .middle {
        width: 400px;
        height: 400px;
        background: #f5f5f5;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .large {
        position: absolute;
        top: 0;
        left: 412px;
        width: 400px;
        height: 400px;
        z-index: 500;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        // 防止背景图重复显示，保证放大区域唯一
        background-repeat: no-repeat;
        // 背景图:盒子的大小 = 2:1  
        // 将来控制背景图的移动来实现放大的效果查看 background-position
        background-size: 800px 800px;
        background-color: #f8f8f8;
    }

    .layer {
        width: 200px;
        height: 200px;
        background: rgba(0, 0, 0, 0.2);
        // 绝对定位 然后跟随咱们鼠标控制left和top属性就可以让滑块移动起来
        left: 0;
        top: 0;
        position: absolute;
    }
    
    .small {
        width: 80px;

        li {
            width: 68px;
            height: 68px;
            margin-bottom: 15px;
            cursor: pointer;
            margin-left: 12px;

            &:hover,
            &.active {
                border: 2px solid $xtxColor;
            }
        }
    }
}
</style>