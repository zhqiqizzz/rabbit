import { computed, onUnmounted, ref } from "vue";
import dayjs from "dayjs";
export const useCountDown = () => {
  const time = ref(0);
  let timer = null;
  const formatTime = computed(() => dayjs.unix(time.value).format("mm分ss秒"));
  const start = (startTime) => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    time.value = startTime;
    timer = setInterval(() => {
      time.value--;
    }, 1000);
  };
  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
  return {
    formatTime,
    start,
    stop,
  };
};
