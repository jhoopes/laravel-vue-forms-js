import axios from "axios";

window.axios = axios;

window.axios.defaults.headers.common = {
    "X-CSRF-TOKEN": window.csrfToken,
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json"
};

import { config } from "@/admin/classes/configuration";
window.formConfig = config;

// window.notify = new Notifications();
