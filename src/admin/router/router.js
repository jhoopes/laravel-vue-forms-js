import Vue from 'vue';
import VueRouter from 'vue-router';
import { store } from './../store/store';

Vue.use(VueRouter);

import routeHelper from './routes';

var router = new VueRouter({
    routes: [],
    mode: 'history'
});


router.addRoutes(routeHelper.generate());

// router.beforeEach((to, from, next) => {
//     if(to.matched.some(record => record.meta.requiresAuth)){
//         if(!auth.check()) {
//             auth.logout();
//             next({
//                 path: '/',
//                 query: { redirect: to.fullPath}
//             });
//
//             return;
//         } else {
//
//             if(store.state.initialized) {
//                 next();
//             }
//
//             store.watch(state => {
//                 return state.initialized
//             }, function() {
//                 next();
//             });
//
//         }
//     } else {
//         next();
//     }
// });

export default router;
