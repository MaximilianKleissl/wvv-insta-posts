import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/home.vue";
import NotFound from "@/pages/not-found.vue";

const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    { path: "/", component: Home },
    { path: "/:pathMatch(.*)*", component: Home },
  ],
});

export default router;
