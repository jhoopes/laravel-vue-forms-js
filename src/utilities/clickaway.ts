import { App } from "vue";

const clickEventType = document.ontouchstart !== null ? "click" : "touchstart";

const UNIQUE_ID = "__vue_click_away__";

const onMounted = (el: any, binding: any, vnode?: any) => {
  onUnmounted(el);

  const vm = vnode.context;
  const callback = binding.value;

  let nextTick = false;
  setTimeout(function () {
    nextTick = true;
  }, 0);

  el[UNIQUE_ID] = (event: Event) => {
    if (
      (!el || !el.contains(event.target)) &&
      callback &&
      nextTick &&
      typeof callback === "function"
    ) {
      return callback.call(vm, event);
    }
  };

  document.addEventListener(clickEventType, el[UNIQUE_ID], false);
};

const onUnmounted = (el: any) => {
  document.removeEventListener(clickEventType, el[UNIQUE_ID], false);
  delete el[UNIQUE_ID];
};

const onUpdated = (el: any, binding: any, vnode?: any) => {
  if (binding.value === binding.oldValue) {
    return;
  }
  onMounted(el, binding, vnode);
};

const plugin = {
  install: (app: App) => {
    app.directive("click-away", directive);
  },
};

const directive = {
  mounted: onMounted,
  updated: onUpdated,
  unmounted: onUnmounted,
};

const mixin = {
  directives: { ClickAway: directive },
};

export { directive, mixin };

export default plugin;
