<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  width: {
    type: Number,
    default: 260,
  },
  height: {
    type: Number,
    default: 40,
  },
});

const emit = defineEmits(["update:modelValue", "success", "reset"]);

const dragging = ref(false);
const offset = ref(0);
const startX = ref(0);
const startOffset = ref(0);

const maxOffset = computed(() => Math.max(props.width - props.height, 0));
const isVerified = computed(() => props.modelValue);
const progressStyle = computed(() => ({
  width: `${Math.min(offset.value + props.height, props.width)}px`,
}));
const handleStyle = computed(() => ({
  transform: `translateX(${offset.value}px)`,
}));
const handleSizeStyle = computed(() => ({
  width: `${props.height}px`,
  height: `${props.height}px`,
}));

const finishVerify = () => {
  offset.value = maxOffset.value;
  emit("update:modelValue", true);
  emit("success");
};

const reset = () => {
  dragging.value = false;
  offset.value = 0;
  emit("update:modelValue", false);
  emit("reset");
};

const updatePosition = (clientX) => {
  const nextOffset = startOffset.value + clientX - startX.value;
  offset.value = Math.min(Math.max(nextOffset, 0), maxOffset.value);
};

const handleMouseMove = (event) => {
  updatePosition(event.clientX);
};

const handleTouchMove = (event) => {
  if (!dragging.value) return;
  event.preventDefault();
  updatePosition(event.touches[0].clientX);
};

const stopDragging = () => {
  if (!dragging.value) return;
  dragging.value = false;
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", stopDragging);
  window.removeEventListener("touchmove", handleTouchMove);
  window.removeEventListener("touchend", stopDragging);

  if (offset.value >= maxOffset.value - 4) {
    finishVerify();
    return;
  }

  offset.value = 0;
};

const startDragging = (clientX) => {
  if (isVerified.value) return;
  dragging.value = true;
  startX.value = clientX;
  startOffset.value = offset.value;
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", stopDragging);
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", stopDragging);
};

const handleMouseDown = (event) => {
  startDragging(event.clientX);
};

const handleTouchStart = (event) => {
  startDragging(event.touches[0].clientX);
};

defineExpose({
  reset,
});

watch(
  () => props.modelValue,
  (value) => {
    offset.value = value ? maxOffset.value : 0;
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="slider-verify"
    :class="{ 'is-success': isVerified }"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <div class="slider-verify__progress" :style="progressStyle"></div>
    <div class="slider-verify__text">
      {{ isVerified ? "验证通过" : "按住滑块，拖动到最右边" }}
    </div>
    <button
      type="button"
      class="slider-verify__handle"
      :class="{ 'is-dragging': dragging }"
      :style="[handleStyle, handleSizeStyle]"
      @mousedown="handleMouseDown"
      @touchstart.prevent="handleTouchStart"
    >
      <span>{{ isVerified ? "✓" : ">>" }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.slider-verify {
  position: relative;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 999px;
  background: #f5f7fa;
  user-select: none;
}

.slider-verify__progress {
  position: absolute;
  inset: 0 auto 0 0;
  background: linear-gradient(90deg, #d7f4df 0%, #c1ebce 100%);
  transition: width 0.15s ease;
}

.slider-verify__text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 13px;
}

.slider-verify__handle {
  position: absolute;
  top: -1px;
  left: 0;
  border: 1px solid #dcdfe6;
  border-radius: 50%;
  background: #fff;
  color: #409eff;
  cursor: grab;
  transition: box-shadow 0.15s ease;
}

.slider-verify__handle span {
  font-size: 13px;
  font-weight: 700;
}

.slider-verify__handle.is-dragging {
  cursor: grabbing;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.18);
}

.slider-verify.is-success {
  border-color: #67c23a;
}

.slider-verify.is-success .slider-verify__text {
  color: #67c23a;
}

.slider-verify.is-success .slider-verify__handle {
  border-color: #67c23a;
  color: #67c23a;
}
</style>
