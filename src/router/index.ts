import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/home.vue';
import TeamMode from '@/pages/team-mode.vue';

const router = createRouter({
  history: createWebHistory('/wvv-insta-posts/'),
  routes: [
    { path: '/', component: Home },
    { path: '/team-mode', component: TeamMode },
    { path: '/:pathMatch(.*)*', component: Home },
  ],
});

export default router;
