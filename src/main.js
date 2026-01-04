import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { lazyPlugin } from "@/directives/index";
import { componentPlugin } from "@/components/index.js";
import "@/styles/common.scss";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
const app = createApp(App);
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(lazyPlugin);
app.use(componentPlugin);
app.mount("#app");
