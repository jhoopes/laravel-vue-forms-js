<script lang="ts">
import { defineComponent, SetupContext, computed, toRefs } from "vue";

export default defineComponent({
  props: {
    css: {
      type: String,
    },
    buttonDisabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["clicked"],
  setup(props, context: SetupContext) {
    const clicked = () => {
      context.emit("clicked");
    };

    const buttonStyle = computed(() => {
      if (!props.css) {
        return "px-2 py-1 m-2 bg-blue-300 text-white rounded";
      }

      return props.css;
    });

    return {
      clicked,
      buttonStyle,
      ...toRefs(props),
    };
  },
});
</script>
<template>
  <button
    @click="clicked"
    class="lvf-button"
    :class="buttonStyle"
    :disabled="buttonDisabled"
  >
    <slot>Button</slot>
  </button>
</template>
