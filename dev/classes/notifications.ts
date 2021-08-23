import {
  createToastInterface,
  POSITION,
  ToastInterface,
} from "vue-toastification";
import "vue-toastification/dist/index.css";
import "./../assets/tostification-override.css";
import Success from "./../components/toasts/Success.vue";
import Error from "./../components/toasts/Error.vue";
import Info from "./../components/toasts/Info.vue";
import Warning from "./../components/toasts/Warning.vue";

import { ToastOptions } from "vue-toastification/dist/types/types";

export class Notifications {
  pluginOptions: ToastOptions;
  toast: ToastInterface;

  constructor() {
    this.pluginOptions = {
      position: POSITION.BOTTOM_RIGHT,
      timeout: 0,
      icon: false,
    };
    this.toast = createToastInterface(this.pluginOptions);
  }

  success(message: string, title: string, options: ToastOptions) {
    if (!options) {
      options = {};
    }

    this.toast(
      {
        component: Success,
        props: {
          title: title || "",
          message,
        },
      },
      options
    );
  }

  error(message: string, title: string, options: ToastOptions) {
    if (!options) {
      options = {};
    }

    this.toast(
      {
        component: Error,
        props: {
          title: title || "",
          message,
        },
      },
      options
    );
  }

  warning(message: string, title: string, options: ToastOptions) {
    if (!options) {
      options = {};
    }

    this.toast(
      {
        component: Warning,
        props: {
          title: title || "",
          message,
        },
      },
      options
    );
  }

  info(message: string, title: string, options: ToastOptions) {
    if (!options) {
      options = {};
    }

    this.toast(
      {
        component: Info,
        props: {
          title: title || "",
          message,
        },
      },
      options
    );
  }
}

const notifications = new Notifications();
export default notifications;
