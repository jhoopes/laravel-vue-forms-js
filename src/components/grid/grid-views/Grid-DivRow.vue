<script lang="ts">
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  SetupContext,
  toRefs,
  PropType,
} from "vue";
import { Model } from "./../../../classes/model";
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
    baseRecordId: {
      type: Number,
      default: 0,
    },
  },

  emits: ["record-selected", "record-unselected"],

  setup(props, context: SetupContext) {
    const instance = getCurrentInstance();

    let tableHeaders: Record<string, any>[] = reactive([]);
    if (instance && instance.parent && instance.parent.props.headers) {
      tableHeaders = instance.parent.data.headers as Record<string, any>[];
    }

    const getHeaderName = (name: string): string => {
      return name;
    };

    const selectRecord = (record: Record<string, any> | Model): void => {
      context.emit("record-selected", record);
    };

    const deSelectRecord = (record: Record<string, any> | Model): void => {
      context.emit("record-unselected", record);
    };

    const handleSelectionClick = (
        record: Record<string, any> | Model
    ): void => {
      if (!props.recordsAreSelectable) {
        return;
      }

      let foundRecord = props.selectedRecords.find(
          (rec: Record<string, any> | Model) => {
            return rec.id === record.id;
          }
      );

      if (foundRecord) {
        deSelectRecord(record);
      } else {
        selectRecord(record);
      }
    };

    const runRefresh = () => {
      context.emit("refresh");
    };

    return {
      getHeaderName,
      handleSelectionClick,
      selectRecord,
      deSelectRecord,
      runRefresh,
      tableHeaders,
      ...toRefs(props),
    };
  },
});
</script>

<template>
  <div id="records">
    <table class="table table-hover">
      <tr>
        <th v-for="headerName in tableHeaders" :key="headerName">
          {{ getHeaderName(headerName) }}
        </th>
      </tr>
    </table>

    <component
      v-for="record in records"
      :key="record.id"
      :is="recordType"
      :record="record"
      :base-record-id="baseRecordId"
      :class="{
        selected: selectedRecords.find((r) => r.id === record.id),
        'cursor-pointer': recordsAreSelectable,
      }"
      @click="handleSelectionClick(record)"
      @record-selected="selectRecord(record)"
      @record-unselected="deSelectRecord(record)"
      @refresh="runRefresh"
      :args="args"
    ></component>
    <div v-if="records.length === 0"></div>
  </div>
</template>