<template>
    <div :id="'grid-' + uniqueId" class="grid">
        <div class="top-bar flex justify-end">
            <button v-if="allowRefresh" @click="runRefresh">
                <font-awesome-icon :icon="faIcons.faSync"></font-awesome-icon>
            </button>
            <div v-if="selectedRecords.length > 0">
                <multi-select
                    :options="bulkActions"
                    track-by="name"
                    label="title"
                    placeholder="Select Action"
                    @input="runBulkAction"
                    class="bulk-options-selector"
                    :show-labels="false"
                ></multi-select>
            </div>
            <div v-if="filters.length > 0">
                <multi-select
                    :options="filters"
                    track-by="name"
                    label="title"
                    placeholder="Select filter"
                    :value="currentFilter"
                    @input="runFilter"
                    class="bulk-options-selector"
                    :show-labels="false"
                ></multi-select>
            </div>
            <div v-if="sorts.length > 0">
                <multi-select
                    :options="sorts"
                    track-by="name"
                    label="title"
                    placeholder="Select field to sort by"
                    :value="sortBy"
                    @input="runSort"
                    class="bulk-options-selector"
                    :show-labels="false"
                ></multi-select>
            </div>
        </div>
        <div v-show="!loadingData">
            <component
                :is="gridType"
                v-model:records="records"
                :record-type="recordType"
                :args="gridArgs"
                :selected-records="selectedRecords"
                :records-are-selectable="bulkActions.length > 0"
                @record-selected="addRecordToSelections"
                @record-unselected="removeRecordFromSelections"
            ></component>
        </div>
        <div
            v-show="loadingData"
            style="
                min-height: 75vh;
                display: flex;
                align-items: center;
                justify-content: center;
            "
        >
            <font-awesome-icon
                :icon="faIcons.faSpinner"
                :spin="true"
                size="3x"
            ></font-awesome-icon>
        </div>
        <div class="flex justify-between controls" v-show="!loadingData">
            <div>
                <pagination
                    :current-page="currentPage"
                    :page-count="totalPages"
                    @updatePageNumber="updatePagination"
                ></pagination>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import MultiSelect from "vue-multiselect";
import tableView from "./grid/grid-views/Grid-TableView.vue";
import divRow from "./grid/grid-views/Grid-DivRow.vue";
import Pagination from "./grid/Pagination.vue";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { faSync } from "@fortawesome/free-solid-svg-icons/faSync";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
    computed,
    defineComponent,
    onMounted,
    PropType,
    reactive,
    ref,
    SetupContext,
    toRefs,
    watch,
    Ref,
} from "vue";
import apiClient, { ApiClient } from "./../classes/apiClient";
import { guid } from "./../utilities/utils";
import {
    getApiParamsForGrid,
    getRecordsFromAPI,
} from "./../composition/gridApi";
import {
    ILengthAwarePaginator,
} from "./../types";
import Model from "./../classes/model";
import Collection from "./../classes/collection";
import { setupPagination } from "./../composition/gridPagination";

export default defineComponent({
    name: "v-grid",

    emits: ["updatePagination", "actionRun", "updateFilter", "updateSort"],

    setup(props, context: SetupContext) {
        const uniqueId = guid();
        let loadingData = ref(false);
        let selectedRecords: Record<string, any>[] = reactive([]);
        let sortBy = ref();
        let currentFilter = ref();
        let gridData:
            | Ref<Collection<Model>>
            | Ref<ILengthAwarePaginator<Model>>
            | Ref<Record<string, any>[]> = ref([]);

        let {
            data,
            recordUrlParams,
            apiClient,
            recordUrl,
            useJsonApi,
            pagination,
            refreshRecords,
            updateAfterBulkAction,
            externalLoading,
            queueRefresh,
        } = toRefs(props);

        const assignGridData = (
            newGridData?:
                | Collection<Model>
                | ILengthAwarePaginator<Model>
                | Record<string, any>[]
                | unknown
        ) => {
            if (!newGridData) {
                console.log("is empty");
                gridData.value = {
                    data: [] as Model[],
                    total: 0,
                    per_page: 10,
                    current_page: 1,
                    last_page: 1,
                } as ILengthAwarePaginator<Model>;
            } else if (newGridData instanceof Collection) {
                console.log("Is Collection");
                gridData.value = newGridData.getModels();
            } else if (Array.isArray(gridData)) {
                console.log("Is Array");
                gridData.value = newGridData as Record<string, any>[];
            } else {
                console.log("Is Length aware paginator");
                gridData.value = newGridData as ILengthAwarePaginator<Model>;
            }
        };

        const getRecords = async (page?: number) => {
            if (!page) {
                page = 1;
            }

            loadingData.value = true;
            let data = await getRecordsFromAPI(
                getApiParamsForGrid(
                    page,
                    sortBy,
                    currentFilter,
                    recordUrlParams
                ),
                apiClient.value,
                recordUrl.value,
                useJsonApi.value
            );
            console.log(data);
            assignGridData(data);
            loadingData.value = false;
        };

        watch(
            recordUrlParams,
            () => {
                getRecords();
            },
            { deep: true }
        );

        let {
            internalPagination,
            internalCurrentPage,
            currentPage,
            totalPages,
            internalPage,
        } = setupPagination(gridData.value, pagination);

        const updatePagination = (newPage: number) => {
            if (internalPagination.value) {
                internalCurrentPage.value = newPage;
            } else if (recordUrl) {
                getRecords(newPage);
            } else {
                context.emit("updatePagination", newPage);
            }
        };

        const addRecordToSelections = (record: Record<string, any>) => {
            selectedRecords.push(record);
        };

        const removeRecordFromSelections = (record: Record<string, any>) => {
            let recordIndex = selectedRecords.findIndex((selectedRecord) => {
                return selectedRecord.id === record.id;
            });

            selectedRecords.splice(recordIndex, 1);
        };

        const runRefresh = () => {
            if (refreshRecords && refreshRecords.value) {
                refreshRecords.value();
                return;
            }

            if (recordUrl) {
                getRecords();
            }
        };

        const runBulkAction = (action: Record<string, any>) => {
            action.action(selectedRecords);

            if (recordUrl && updateAfterBulkAction) {
                getRecords();
            }
            context.emit("actionRun", action);
            selectedRecords = [];
        };

        const runFilter = (filter: Record<string, any>) => {
            if (!filter) {
                // reset filter
                currentFilter.value = null;
                context.emit("updateFilter", null);
                if (recordUrl) {
                    getRecords();
                }
                return;
            }

            if (!filter.params) {
                throw new Error("Invalid filter option");
            }

            currentFilter.value = filter;
            context.emit("updateFilter", filter);
            if (recordUrl) {
                getRecords();
            }
        };

        const runSort = (sort: Record<string, any>) => {
            if (!sort) {
                // reset sort
                sortBy.value = null;
                context.emit("updateSort", null);
                if (recordUrl) {
                    getRecords();
                }
                return;
            }

            if (typeof sort.action === "function") {
                sort.action();
            } else if (!sort.by) {
                throw new Error("Invalid sort option");
            }

            sortBy.value = sort;
            if (recordUrl) {
                getRecords();
            }
            context.emit("updateSort", sort);
        };

        watch(externalLoading, (newLoading: boolean) => {
            loadingData.value = newLoading;
        });

        watch(queueRefresh, (newRefresh) => {
            if (newRefresh) {
                runRefresh();
            }

            context.emit("update:queueRefresh", false);
        });

        assignGridData(data);

        if(data) {
          watch(
              data,
              () => {
                assignGridData(data);
              },
              { deep: true }
          );
        }


        let records = computed((): Model[] | Record<string, any>[] => {
            if (gridData.value instanceof Collection) {
                return gridData.value.getModels();
            } else if (Array.isArray(gridData.value)) {
                if (internalPagination && internalPage.value !== null) {
                    return internalPage.value;
                }
                return gridData.value as Record<string, any>[];
            } else if (Array.isArray(gridData.value.data)) {
                return gridData.value.data;
            }

            return [];
        });

        onMounted(() => {
            if (typeof recordUrl !== "undefined" && recordUrl !== null) {
                getRecords();
            }
        });

        return {
            uniqueId,
            loadingData,
            selectedRecords,
            sortBy,
            currentFilter,
            records,
            currentPage,
            totalPages,
            updatePagination,
            addRecordToSelections,
            removeRecordFromSelections,
            runRefresh,
            runBulkAction,
            runFilter,
            runSort,
            faIcons: {
                faPlus,
                faSync,
                faSpinner,
            },
        };
    },

    props: {
        // Specify the grid type of the component
        // Currently only 2 options: tableView, divRow
        gridType: {
            type: String,
            default: "tableView",
        },

        // the record type to use when displaying each row
        // By default the grid type is set to table-row if the grid type is also table view
        recordType: {
            type: String,
            default: "table-row",
        },

        // Specify headers to display on top of the table view grid type
        headers: {
            type: Array,
        },

        // Specify Data Directly
        data: {
            type: [Object, Array],
        },

        // record url that a GET request will be made if this property is set
        recordUrl: {
            type: String,
            default: null,
        },

        recordUrlParams: {
            type: Object,
            default: () => {
                return {};
            },
        },

        allowRefresh: {
            type: Boolean,
            default: false,
        },

        // Refresh records function.  This is the function to refresh the records for the existing parameters
        refreshRecords: {
            type: Function,
        },

        /** Whether we are loading data externally to simulate loading within component **/
        externalLoading: {
            type: Boolean,
            default: false,
        },

        /**
         * An array of objects to define bulk actions.
         *
         * The addition of actions will add simple selection actions, however, if your row contains complex functionality
         * it is usually better use the selfSelection functionality in order allow them to select themselves, otherwise
         * vue click events may overlap each other
         */
        bulkActions: {
            type: Array as PropType<Record<string, any>[]>,
            default: () => {
                return [];
            },
        },

        updateAfterBulkAction: {
            type: Boolean,
            default: true,
        },

        /**
         * An array of filters
         */
        filters: {
            type: Array as PropType<Record<string, any>[]>,
            default: () => {
                return [];
            },
        },

        /**
         *
         */
        sorts: {
            type: Array as PropType<Record<string, any>[]>,
            default: () => {
                return [];
            },
        },

        /**
         * Instead of using the default method for clicking the entire row which will 'select' it, the rows
         * can emit an event an even for 'bulk-selected' of a boolean for true/false if selection is part of the row's
         * functionality
         */
        rowsSelfSelect: {
            type: Boolean,
            default: false,
        },

        pagination: {
            type: Object as PropType<Record<string, any>>,
            default: () => {
                return {};
            },
        },

        // Arguments that are passed into each of the individual records for grid rows
        gridArgs: {
            type: Object as PropType<Record<string, any>>,
            default: () => {
                return {};
            },
        },

        // ability to define a custom apiClient like axios instead of using the default fetch
        apiClient: {
            type: Object as PropType<ApiClient>,
            default: () => {
                return apiClient;
            },
        },

        /**
         * Whether or not we parse the api response returned through using the api client as a JSON:API response
         */
        useJsonApi: {
            type: Boolean,
            default: false,
        },

        queueRefresh: {
            type: Boolean,
            default: false,
        },
    },

    components: {
        FontAwesomeIcon,
        tableView,
        divRow,
        Pagination,
        MultiSelect,
    },
});
</script>
