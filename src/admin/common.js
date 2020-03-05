import Vue from 'vue';
import axios from 'axios';
import Notifications from "./classes/notifications";

window.axios = axios;

window.axios.defaults.headers.common = {
    'X-CSRF-TOKEN': window.csrfToken,
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json'
};


indow.moment = require('moment');
window.moment.locale('en');
window.notify = new Notifications();
