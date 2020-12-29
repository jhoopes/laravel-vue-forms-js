import Vue from "vue";
import VGrid from "v-grid";
import LaravelVueForms from "@/plugin";
import "@/admin/assets/sass/admin.scss";

Vue.use(LaravelVueForms);
Vue.use(VGrid);

require("./common");
require("./bootstrap");
require("./fa-bootstrap");

import FormAdmin from "@/admin/components/FormAdmin";
import { config } from "@/admin/classes/configuration";
import { client } from "@/classes/apiClient";
import { store } from "@/admin/store/store";
import router from "@/admin/router/router";

Vue.config.productionTip = false;
Vue.prototype.$apiClient = client;
new Vue({
    router,
    store,
    provide() {
        let provide = {};

        Object.defineProperty(provide, "useJsonApi", {
            enumerable: true,
            get: () => config.useJsonApi
        });

        return provide;
    },

    created() {
        this.$store.commit("form_admin/setUseJsonApi", config.useJsonApi);
    },
    render: h => h(FormAdmin)
}).$mount("#app");
