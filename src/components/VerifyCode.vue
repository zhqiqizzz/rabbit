<script setup>
import { nextTick, onMounted, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  length: {
    type: Number,
    default: 4,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const canvasRef = ref(null);
const charset = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const currentCode = ref("");

const randomColor = (min = 0, max = 255) => {
  const randomChannel = () =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  return `rgb(${randomChannel()}, ${randomChannel()}, ${randomChannel()})`;
};

const buildCode = () => {
  currentCode.value = Array.from({ length: props.length }, () => {
    const index = Math.floor(Math.random() * charset.length);
    return charset[index];
  }).join("");
};

const drawCode = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f7f8fa";
  ctx.fillRect(0, 0, width, height);

  currentCode.value.split("").forEach((char, index) => {
    const fontSize = 20 + Math.floor(Math.random() * 8);
    const x = 12 + index * 24;
    const y = 28 + Math.floor(Math.random() * 5);
    const rotate = ((Math.random() - 0.5) * Math.PI) / 4;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = randomColor(50, 160);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });

  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.strokeStyle = randomColor(120, 220);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let i = 0; i < 24; i += 1) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      1,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = randomColor(120, 220);
    ctx.fill();
  }
};

const refreshCode = async () => {
  buildCode();
  emit("change", currentCode.value);
  await nextTick();
  drawCode();
};

const updateValue = (value) => {
  emit("update:modelValue", value.toUpperCase());
};

defineExpose({
  refreshCode,
});

onMounted(() => {
  refreshCode();
});

watch(
  () => props.length,
  () => {
    refreshCode();
  }
);
</script>

<template>
  <div class="verify-code">
    <el-input
      :model-value="modelValue"
      maxlength="4"
      placeholder="请输入验证码"
      @update:model-value="updateValue"
    />
    <canvas
      ref="canvasRef"
      class="verify-code__canvas"
      width="110"
      height="40"
      title="点击刷新验证码"
      @click="refreshCode"
    />
  </div>
</template>

<style scoped lang="scss">
.verify-code {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.verify-code__canvas {
  width: 110px;
  height: 40px;
  flex-shrink: 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}
</style>
