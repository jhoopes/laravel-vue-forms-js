<template>
  <div class="pagination m-4" v-if="pageCount > 1">
    <div
      class="
        bg-white
        px-4
        py-3
        flex
        items-center
        justify-between
        border-t border-gray-200
        sm:px-6
      "
    >
      <div class="flex-1 flex justify-between sm:hidden">
        <a
          href="#"
          class="
            relative
            inline-flex
            items-center
            px-4
            py-2
            border border-gray-300
            text-sm
            font-medium
            rounded-md
            text-gray-700
            bg-white
            hover:bg-gray-50
          "
        >
          Previous
        </a>
        <a
          href="#"
          class="
            ml-3
            relative
            inline-flex
            items-center
            px-4
            py-2
            border border-gray-300
            text-sm
            font-medium
            rounded-md
            text-gray-700
            bg-white
            hover:bg-gray-50
          "
        >
          Next
        </a>
      </div>
      <div
        class="
          hidden
          sm:flex-1 sm:flex sm:items-center sm:justify-between
          w-full
        "
      >
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ from }}</span>
            to
            <span class="font-medium">{{ to }}</span>
            of
            <span class="font-medium">{{ totalRecords }}</span>
            results
          </p>
        </div>
        <div>
          <nav
            class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <a
              href="#"
              :class="previousClass"
              @click="setCurrentPage(Math.max(1, currentPage - 1))"
            >
              <!--                            <span class="sr-only">Previous</span>-->
              <!-- Heroicon name: solid/chevron-left -->
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>Previous</span>
            </a>

            <a
              v-for="page in pages"
              :key="page.number"
              class="
                bg-white
                border-gray-300
                text-gray-500
                hover:bg-gray-50
                relative
                inline-flex
                items-center
                px-4
                py-2
                border
                text-sm
                font-medium
              "
              :class="{
                'z-10 bg-indigo-50 border-indigo-500 text-indigo-600':
                  page.number === currentPage,
              }"
              @click="setCurrentPage(page.number)"
            >
              <span v-if="page.number"> {{ page.number }}</span>
              <span v-if="page.number === null">...</span>
            </a>
            <a
              href="#"
              :class="nextClass"
              @click="setCurrentPage(Math.min(pageCount, currentPage + 1))"
            >
              <span class="">Next</span>
              <!-- Heroicon name: solid/chevron-right -->
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </a>
          </nav>
        </div>
      </div>
    </div>
    <transition
      enter-active-class="animated faster fadeIn"
      leave-active-class="animated faster fadeOut"
    >
      <div
        class="
          fixed
          z-50
          w-full
          h-full
          top-0
          left-0
          flex
          items-center
          justify-center
        "
        v-if="showPageSelector"
      >
        <div class="absolute w-full h-full bg-grey-darker opacity-50"></div>
        <div
          class="
            animated
            fadeInUp
            relative
            align-top
            m-auto
            justify-center
            px-8
            bg-white
            rounded
            w-full
            shadow
            flex flex-col
          "
          :style="'width: 50%'"
        >
          <h2
            class="
              text-4xl text-center
              font-hairline
              leading-loose
              text-grey-darker
              mt-2
              mb-8
            "
          >
            Select page
          </h2>
          <div
            class="
              text-xl
              leading-normal
              mb-8
              form-group
              flex
              justify-center
              items-center
            "
          >
            <label>Page #</label>
            <input
              type="number"
              class="p-2 mx-2 border rounded"
              :max="pageCount"
              v-model="pageSelectorPageNum"
            />
          </div>
          <div class="inline-flex justify-center my-4">
            <button @click="setCurrentPage(pageSelectorPageNum)" class="button">
              Jump to Page
            </button>
          </div>
          <span
            @click="showPageSelector = false"
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
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, Ref, ref, SetupContext, toRefs } from "vue";
import { IPaginationPage } from "./../../types";

export default defineComponent({
  props: {
    currentPage: {
      required: true,
      type: Number,
    },
    pageCount: {
      required: true,
      type: Number,
    },
    totalRecords: {
      required: true,
      type: Number,
    },
    from: {
      required: true,
      type: Number,
    },
    to: {
      required: true,
      type: Number,
    },
  },

  setup(props, context: SetupContext) {
    let showPageSelector = ref(false);
    let pageSelectorPageNum: Ref<number> = ref(0);

    const makeRange = (start: number, end: number): IPaginationPage[] => {
      let range = [];
      for (let i = start; i <= end; i++) {
        range.push({
          number: i,
        });
      }
      return range;
    };

    const setCurrentPage = (newPageNumber: number) => {
      if (!newPageNumber) {
        showPageSelector.value = true;
        return;
      }

      // pageSelectorPageNum = false;
      showPageSelector.value = false;
      context.emit("updatePageNumber", newPageNumber);
    };

    let classText =
      "relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50";

    const previousClass = computed(() => {
      if (props.currentPage === 1) {
        return classText + " rounded-l-md disabled";
      }

      return classText + " rounded-l-md cursor-pointer";
    });

    const nextClass = computed(() => {
      if (props.currentPage === props.pageCount) {
        return classText + " rounded-r-md disabled";
      }

      return classText + " rounded-r-md cursor-pointer";
    });

    const pages = computed(() => {
      let pages: IPaginationPage[] = [];

      if (props.pageCount > 10) {
        if (props.currentPage >= 7 && props.currentPage < props.pageCount - 5) {
          pages = pages.concat(makeRange(1, 2));
          pages.push({
            number: null,
          });
          pages = pages.concat(
            makeRange(props.currentPage - 3, props.currentPage + 3)
          );
          pages.push({
            number: null,
          });
          pages = pages.concat(makeRange(props.pageCount - 1, props.pageCount));
        } else if (props.currentPage < 7) {
          pages = pages.concat(makeRange(1, 8));
          pages.push({
            number: null,
          });
          pages = pages.concat(makeRange(props.pageCount - 1, props.pageCount));
        } else if (props.currentPage >= props.pageCount - 5) {
          pages = pages.concat(makeRange(1, 2));
          pages.push({
            number: null,
          });
          pages = pages.concat(makeRange(props.pageCount - 5, props.pageCount));
        }
      } else {
        pages = makeRange(1, props.pageCount);
      }

      return pages;
    });

    return {
      showPageSelector,
      pageSelectorPageNum,
      setCurrentPage,
      previousClass,
      nextClass,
      pages,
      ...toRefs(props),
    };
  },
});
</script>
