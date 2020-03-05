import Vue from 'vue';

import VGrid from 'v-grid';
import LaravelVueForms from '../index';
import {store} from './store/store';


import FormAdmin from "./components/FormAdmin";


Vue.use(LaravelVueForms);
Vue.use(VGrid);


new Vue({
    store,
    components: {
        FormAdmin
    },


}).$mount('#admin');
