<template>
    <transition
        enter-active-class="animated faster fadeIn"
        leave-active-class="animated faster fadeOut"
    >
        <div
            class="fixed z-40 w-full h-full top-0 left-0 p-3 flex items-center justify-center overflow-x-hidden overflow-y-auto"
            style="background-color: rgba(0, 0, 0, 0.32)"
        >
            <div
                class="md:relative m-auto px-8 bg-white md:rounded w-full md:shadow flex flex-col"
                v-on-clickaway="closeModal"
                :style="'width: ' + width"
            >
                <h2 class="text-4xl text-center font-hairline md:leading-loose text-grey-darker md:mt-2 mb-8">
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
                <span @click="closeModal('icon-click')" class="absolute top-0 right-0 pt-4 px-4">
                        <svg class="h-12 w-12 text-grey hover:text-grey-darkest" role="button"
                             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path
                            d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </span>
            </div>
        </div>
    </transition>
</template>
<script>
    import {mixin as clickaway} from 'vue-clickaway';
    import jQuery from 'jquery';
    export default {

        props: {
            modalIsConfirm: {
                type: Boolean,
                default: false
            },
            confirmYesText: {
                type: String,
                default: 'Yes',
            },
            confirmNoText: {
                type: String,
                default: 'No',
            },
            width: {
                type: String,
                default: '50%'
            },
            clickAway: {
                type: Boolean,
                default: true
            }
        },

        mixins: [clickaway],

        methods: {
            closeModal(clickType) {
                if (this.clickAway) {
                    this.$emit('close')
                } else if (!this.clickAway && clickType && clickType === 'icon-click') {
                    this.$emit('close');
                }
            },
            confirmModal() {
                this.$emit('confirmed')
            },

            /** Essentially copied from here: https://github.com/twbs/bootstrap/blob/3b558734382ce58b51e5fc676453bfd53bba9201/js/src/modal.js **/
            toggleBodyClass(className, addClass) {
                const el = document.body;

                if (addClass) {
                    el.classList.add(className);
                } else {
                    el.classList.remove(className);
                }
            },
            _adjustDialog() {
                this.isModalOverflowing =
                    this.$el.scrollHeight > document.documentElement.clientHeight;

                if (!this.isBodyOverflowing && this.isModalOverflowing) {
                    this.$el.style.paddingLeft = `${this._scrollbarWidth}px`;
                }

                if (this.isBodyOverflowing && !this.isModalOverflowing) {
                    this.$el.style.paddingRight = `${this._scrollbarWidth}px`;
                }
            },

            _resetAdjustments() {
                this.$el.style.paddingLeft = "";
                this.$el.style.paddingRight = "";
            },

            _checkScrollbar() {
                const rect = document.body.getBoundingClientRect();
                this.isBodyOverflowing = rect.left + rect.right < window.innerWidth;
                this._scrollbarWidth = this._getScrollbarWidth();
            },

            _setScrollbar() {
                if (this.isBodyOverflowing) {
                    // Adjust body padding
                    const actualPadding = document.body.style.paddingRight;
                    const calculatedPadding = jQuery(document.body).css("padding-right");

                    this.paddingRight = actualPadding;

                    jQuery(document.body).css(
                        "padding-right",
                        `${parseFloat(calculatedPadding) + this._scrollbarWidth}px`
                    );
                }
            },

            _resetScrollbar() {
                const padding = this.paddingRight;
                this.paddingRight = 0;
                document.body.style.paddingRight = padding ? padding : 0;
            },

            _getScrollbarWidth() {
                // thx d.walsh
                const scrollDiv = document.createElement("div");
                scrollDiv.className = "modal-scrollbar-measure";
                document.body.appendChild(scrollDiv);
                const scrollbarWidth =
                    scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
                document.body.removeChild(scrollDiv);
                return scrollbarWidth;
            }
        },

        mounted: function () {

            document.addEventListener("keyup", e => {
                if(e.key === 'Escape') {
                    this.closeModal('icon-click');
                }
            })

            this._checkScrollbar();
            this._setScrollbar();
            this._adjustDialog();
            this.toggleBodyClass("overflow-hidden", true);
        },
        destroyed() {
            this._resetAdjustments();
            this._resetScrollbar();

            this.toggleBodyClass("overflow-hidden", false);
        }

    }
</script>
