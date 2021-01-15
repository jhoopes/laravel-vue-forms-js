import Vue from "vue";
import VueRouter from "vue-router";
// import { store } from "./../store/store";

Vue.use(VueRouter);

import routeHelper from "./routes";

var router = new VueRouter({
    routes: [],
    mode: "history",
    base: process.env.BASE_URL
});

router.addRoutes(routeHelper.generate());

export default router;
