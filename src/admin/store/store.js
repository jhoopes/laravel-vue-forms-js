import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);


import form_admin from './modules/form_administration/module';

export const store = new Vuex.Store({
    modules: {
        form_admin
    },

    state: {},
    mutations: {},
    actions: {}
});
