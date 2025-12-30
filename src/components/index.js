import ImageView from "@/components/ImageView/index.vue";
import Sku from "@/components/Sku/index.vue";
import { install } from "element-plus";

export const componentPlugin = {
  install(app) {
    app.component("ImageView", ImageView);
    app.component("Sku", Sku);
  },
};
