import { useIntersectionObserver } from "@vueuse/core";

// 图片懒加载指令
export const lazyPlugin = {
  install(app) {
    app.directive("img-lazy", {
      mounted(el, binding) {
        const { stop } = useIntersectionObserver(el, ([entry]) => {
          if (entry?.isIntersecting) {
            el.src = binding.value;
            el.onload = () => {
              stop();
            };
          }
        });
      },
    });
  },
};
