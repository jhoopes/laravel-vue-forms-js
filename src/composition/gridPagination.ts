import { computed, Ref, ref } from "vue";
import { ILengthAwarePaginator } from "./../types";
import Model from "./../classes/model";
import Collection from "./../classes/collection";

export const setupPagination = (
  gridData:
    | Ref<Collection<Model>>
    | Ref<ILengthAwarePaginator<Model>>
    | Ref<Record<string, any>[]>,
  propPagination: Ref<Record<string, any>>
) => {
  const internalPagination = ref(false);
  const internalCurrentPage = ref(0);
  const internalTotalPages = ref(0);

  const canPaginate = computed(() => {
    if (gridData.value instanceof Collection) {
      return gridData.value.isPaginating();
    } else if (Array.isArray(gridData.value)) {
      if (propPagination.value.per_page) {
        // eslint-disable-next-line
                internalPagination.value = true;
        // eslint-disable-next-line
                internalCurrentPage.value = 1;
        // eslint-disable-next-line
                internalTotalPages.value = Math.ceil(
          gridData.value.length / propPagination.value.per_page
        );
        return true;
      }
    } else if (gridData.value.current_page) {
      return true;
    }

    return false;
  });

  const currentPage = computed(() => {
    if (gridData.value instanceof Collection) {
      return gridData.value.getPage();
    } else if (!Array.isArray(gridData.value) && gridData.value.current_page) {
      return gridData.value.current_page;
    } else if (Array.isArray(gridData.value) && internalPagination.value) {
      return internalCurrentPage.value;
    }
    return 0;
  });

  const totalPages = computed(() => {
    if (gridData.value instanceof Collection) {
      return gridData.value.totalPages();
    } else if (Array.isArray(gridData.value)) {
      if (internalPagination.value) {
        return internalTotalPages.value;
      }
    } else if (gridData.value.last_page) {
      return gridData.value.last_page;
    }

    return 0;
  });

  const internalPage = computed(() => {
    if (!Array.isArray(gridData.value) || !propPagination.value.per_page) {
      return null; // internal pagination is only valid for array data
    }

    const perPage = propPagination.value.per_page;

    let start;
    if (currentPage.value == 1) {
      start = 0;
    } else {
      start = currentPage.value * perPage - perPage;
    }

    let end = null;
    if (currentPage.value !== totalPages.value) {
      end = currentPage.value * perPage;
    }

    const data = gridData.value;
    if (end) {
      return data.slice(start, end);
    } else {
      return data.slice(start);
    }
  });

  const totalRecords = computed(() => {
    if (gridData.value instanceof Collection) {
      return gridData.value.totalRecords();
    } else if (!Array.isArray(gridData.value) && gridData.value.current_page) {
      return gridData.value.total;
    } else if (Array.isArray(gridData.value) && internalPagination.value) {
      return gridData.value.length;
    }

    return 0;
  });

  const from = computed(() => {
    if (gridData.value instanceof Collection) {
      return gridData.value.paginationFrom();
    } else if (!Array.isArray(gridData.value) && gridData.value.current_page) {
      return gridData.value.from;
    } else if (Array.isArray(gridData.value) && internalPagination.value) {
      if (!Array.isArray(gridData.value) || !propPagination.value.per_page) {
        return 0; // internal pagination is only valid for array data
      }
      const perPage = propPagination.value.per_page;

      if (currentPage.value == 1) {
        return 1;
      } else {
        return currentPage.value * perPage - perPage;
      }
    }

    return 0;
  });

  const to = computed(() => {
    if (gridData.value instanceof Collection) {
      return gridData.value.paginationTo();
    } else if (!Array.isArray(gridData.value) && gridData.value.current_page) {
      return gridData.value.to;
    } else if (Array.isArray(gridData.value) && internalPagination.value) {
      if (!Array.isArray(gridData.value) || !propPagination.value.per_page) {
        return 0; // internal pagination is only valid for array data
      }
      const perPage = propPagination.value.per_page;

      if (currentPage.value !== totalPages.value) {
        return currentPage.value * perPage;
      }
    }

    return 0;
  });

  return {
    internalPagination,
    internalCurrentPage,
    internalTotalPages,
    canPaginate,
    currentPage,
    totalPages,
    internalPage,
    totalRecords,
    from,
    to,
  };
};
