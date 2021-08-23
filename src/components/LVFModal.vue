<template>
  <transition
    enter-active-class="animated faster fadeIn"
    leave-active-class="animated faster fadeOut"
  >
    <div
      class="
        fixed
        z-40
        w-full
        h-full
        top-0
        left-0
        p-3
        flex
        items-center
        justify-center
        overflow-x-hidden overflow-y-auto
      "
      style="background-color: rgba(0, 0, 0, 0.32)"
      ref="modal"
    >
      <div
        class="
          md:relative
          m-auto
          px-8
          bg-white
          md:rounded
          w-full
          md:shadow
          flex flex-col
        "
        v-click-away="closeModal"
        :style="'width: ' + width"
      >
        <h2
          class="
            text-4xl text-center
            font-hairline
            md:leading-loose
            text-grey-darker
            md:mt-2
            mb-8
          "
        >
          <slot name="header"></slot>
        </h2>
        <p class="text-xl leading-normal mb-8">
          <slot name="body"></slot>
        </p>
        <div class="inline-flex justify-center my-4" v-if="modalIsConfirm">
          <button @click="confirmModal" class="button">
            {{ confirmYesText }}
          </button>
          <button @click="closeModal" class="button">
            {{ confirmNoText }}
          </button>
        </div>
        <span
          @click="closeModal('icon-click')"
          class="absolute top-0 right-0 pt-4 px-4"
        >
          <svg
            class="h-12 w-12 text-grey hover:text-grey-darkest"
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>Close</title>
            <path
              d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
            />
          </svg>
        </span>
      </div>
    </div>
  </transition>
</template>
<script lang="ts">
import jQuery from "jquery";
import {
  onMounted,
  onUnmounted,
  ref,
  SetupContext,
  Ref,
  defineComponent,
} from "vue";
export default defineComponent({
  props: {
    modalIsConfirm: {
      type: Boolean,
      default: false,
    },
    confirmYesText: {
      type: String,
      default: "Yes",
    },
    confirmNoText: {
      type: String,
      default: "No",
    },
    width: {
      type: String,
      default: "50%",
    },
    clickAway: {
      type: Boolean,
      default: true,
    },
  },

  emits: ["close", "confirmed"],

  setup(props, context: SetupContext) {
    let paddingRight = ref("0");
    let _scrollbarWidth = ref(0);
    let isBodyOverflowing = ref(false);
    let isModalOverflowing = ref(false);
    const modal: Ref<HTMLElement | undefined> = ref();

    const closeModal = (clickType: string) => {
      if (props.clickAway) {
        context.emit("close");
      } else if (!props.clickAway && clickType && clickType === "icon-click") {
        context.emit("close");
      }
    };

    const confirmModal = () => {
      context.emit("confirmed");
    };

    /** Essentially copied from here: https://github.com/twbs/bootstrap/blob/3b558734382ce58b51e5fc676453bfd53bba9201/js/src/modal.js **/
    const toggleBodyClass = (className: string, addClass: boolean) => {
      const el = document.body;

      if (addClass) {
        el.classList.add(className);
      } else {
        el.classList.remove(className);
      }
    };

    const _adjustDialog = () => {
      if (!modal.value) {
        return;
      }

      isModalOverflowing.value =
        modal.value.scrollHeight > document.documentElement.clientHeight;

      if (!isBodyOverflowing.value && isModalOverflowing.value) {
        modal.value.style.paddingLeft = `${_scrollbarWidth.value}px`;
      }

      if (isBodyOverflowing.value && !isModalOverflowing.value) {
        modal.value.style.paddingRight = `${_scrollbarWidth.value}px`;
      }
    };

    const _resetAdjustments = () => {
      if (!modal.value) {
        return;
      }
      modal.value.style.paddingLeft = "";
      modal.value.style.paddingRight = "";
    };

    const _checkScrollbar = () => {
      const rect = document.body.getBoundingClientRect();
      isBodyOverflowing.value = rect.left + rect.right < window.innerWidth;
      _scrollbarWidth.value = _getScrollbarWidth();
    };

    const _setScrollbar = () => {
      if (isBodyOverflowing.value) {
        // Adjust body padding
        const actualPadding = document.body.style.paddingRight;
        const calculatedPadding = jQuery(document.body).css("padding-right");

        paddingRight.value = actualPadding;

        jQuery(document.body).css(
          "padding-right",
          `${parseFloat(calculatedPadding) + _scrollbarWidth.value}px`
        );
      }
    };

    const _resetScrollbar = () => {
      const padding = paddingRight.value;
      paddingRight.value = "0";
      document.body.style.paddingRight = padding ? padding : "0";
    };

    const _getScrollbarWidth = () => {
      // thx d.walsh
      const scrollDiv = document.createElement("div");
      scrollDiv.className = "modal-scrollbar-measure";
      document.body.appendChild(scrollDiv);
      const scrollbarWidth =
        scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    };

    onMounted(() => {
      document.addEventListener("keyup", (e) => {
        if (e.key === "Escape") {
          closeModal("icon-click");
        }
      });

      _checkScrollbar();
      _setScrollbar();
      _adjustDialog();
      toggleBodyClass("overflow-hidden", true);
    });

    onUnmounted(() => {
      _resetAdjustments();
      _resetScrollbar();

      toggleBodyClass("overflow-hidden", false);
    });

    return {
      closeModal,
      confirmModal,
      modal,
    };
  },
});
</script>
