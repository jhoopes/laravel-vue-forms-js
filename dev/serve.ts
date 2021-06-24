import { createApp } from 'vue';
import Dev from './serve.vue';

// To register individual components where they are used (serve.vue) instead of using the
// library as a whole, comment/remove this import and it's corresponding "app.use" call
import LaravelVueForms from '@/entry.esm';
import router from './routes/index';
import notifications, { Notifications } from "./classes/notifications";

const app = createApp(Dev);
app.use(LaravelVueForms);
app.use(router);
app.config.globalProperties.$notify = notifications


declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $notify: Notifications,
    }
}


app.mount('#app');
