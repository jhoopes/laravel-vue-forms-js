import { computed, ref } from "vue";
import { ILengthAwarePaginator } from "./../types";
import Model from "./../classes/model";
import Collection from "./../classes/collection";

export const setupPagination = (
    gridData:
        | Collection<Model>
        | ILengthAwarePaginator<Model>
        | Record<string, any>[],
    propPagination: Record<string, any>
) => {
    const internalPagination = ref(false);
    const internalCurrentPage = ref(0);
    const internalTotalPages = ref(0);

    const canPaginate = computed(() => {
        if (gridData instanceof Collection) {
            return gridData.isPaginating();
        } else if (Array.isArray(gridData)) {
            if (propPagination.per_page) {
                internalPagination.value = true;
                internalCurrentPage.value = 1;
                internalTotalPages.value = Math.ceil(
                    gridData.length / propPagination.per_page
                );
                return true;
            }
        } else if (gridData.current_page) {
            return true;
        }

        return false;
    });

    const currentPage = computed(() => {
        if (gridData instanceof Collection) {
            return 0;
        } else if (!Array.isArray(gridData) && gridData.current_page) {
            return gridData.current_page;
        } else if (Array.isArray(gridData) && internalPagination.value) {
            return internalCurrentPage.value;
        }
        return 0;
    });

    const totalPages = computed(() => {
        if (gridData instanceof Collection) {
            return gridData.totalPages();
        } else if (Array.isArray(gridData)) {
            if (internalPagination.value) {
                return internalTotalPages.value;
            }
        } else if (gridData.last_page) {
            return gridData.last_page;
        }

        return 0;
    });

    const internalPage = computed(() => {
        if (!Array.isArray(gridData) || !propPagination.per_page) {
            return null; // internal pagination is only valid for array data
        }

        const perPage = propPagination.per_page;

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

        const data = gridData;
        if (end) {
            return data.slice(start, end);
        } else {
            return data.slice(start);
        }
    });

    return {
        internalPagination,
        internalCurrentPage,
        internalTotalPages,
        canPaginate,
        currentPage,
        totalPages,
        internalPage,
    };
};
