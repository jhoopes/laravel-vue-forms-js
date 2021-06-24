<template>
    <div class="table-responsive">
        <table class="table table-hover" v-if="records.length > 0">
            <thead>
            <tr>
                <th v-for="headerName in tableHeaders" :key="headerName">
                    {{ getHeaderName(headerName) }}
                </th>
            </tr>
            </thead>
            <tbody>
            <component
                v-for="record in records"
                :key="record.id"
                :is="recordType"
                :record="record"
                :base-record-id="baseRecordId"
                :args="args"
            ></component>
            </tbody>
        </table>

        <div v-if="records.length === 0">
            {{ noRecordsText }}
        </div>
    </div>
</template>
<script lang="ts">
import {
    computed,
    defineComponent,
    getCurrentInstance,
    PropType,
    reactive,
    ref,
    toRefs,
} from "vue";
import TableRow from "./../generic-rows/table-row.vue";

export default defineComponent({
    props: {
        records: {
            type: Array,
            required: true,
        },
        recordType: {
            type: String,
            required: true,
        },
        args: {
            type: Object as PropType<Record<string, any>>,
            default: () => {
                return {};
            },
        },
        selectedRecords: {
            type: Array as PropType<Record<string, any>[]>,
            default: () => {
                return [];
            },
        },
        recordsAreSelectable: {
            type: Boolean,
            default: false,
        },
    },

    setup(props) {
        const instance = getCurrentInstance();

        let tableHeaders: Record<string, any>[] = reactive([]);
        let baseRecordId = ref(0);

        if (instance && instance.parent && instance.parent.props.headers) {
            tableHeaders = instance.parent.data.headers as Record<
                string,
                any
                >[];
        }

        if (instance && instance.parent && instance.parent.props.baseRecordId) {
            baseRecordId.value = instance.parent.data.baseRecordId as number;
        }

        const getHeaderName = (name: string): string => {
            return name;
        };

        let noRecordsText = computed(() => {
            if (typeof props.args.noRecordsText !== "undefined") {
                return props.args.noRecordsText;
            }

            return "No Records";
        });

        const runRefresh = () => {
            if(instance && instance.parent && instance.parent.exposed) {
                instance.parent.exposed.runRefresh();
            }
        }

        return {
            getHeaderName,
            tableHeaders,
            baseRecordId,
            noRecordsText,
            runRefresh,
            ...toRefs(props),
        };
    },

    components: {
        TableRow,
    },
});
</script>
