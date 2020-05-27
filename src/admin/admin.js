import Vue from 'vue';

import VGrid from 'v-grid';
import LaravelVueForms from '../index';
import {store} from './store/store';
import router from './router/router';

require('./common');
require('./bootstrap');

import FormAdmin from "./components/FormAdmin";


Vue.use(LaravelVueForms);
Vue.use(VGrid);


new Vue({
    store,
    router,
    components: {
        FormAdmin
    },

    provide() {
        let provide = {};

        Object.defineProperty(provide, 'useJsonApi', {
            enumerable: true,
            get: () => window.formAdmin.useJsonApi
        });

        return provide;
    },

    created() {

        this.$store.commit('form_admin/setUseJsonApi', window.formAdmin.useJsonApi);

    }


}).$mount('#admin');
