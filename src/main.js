import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "@/styles/common.scss";

const app = createApp(App);

import { getCategoryApi } from "@/apis/testApi";

getCategoryApi().then((res) => {
  console.log(res);
});
app.use(createPinia());
app.use(router);

app.mount("#app");
