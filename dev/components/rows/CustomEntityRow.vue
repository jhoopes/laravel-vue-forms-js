<script lang="ts">
import { computed, defineComponent, SetupContext, toRefs } from "vue";
import { getDefaultRawColumns } from "./../composition/custom_entity_utils";
import { faEdit } from "@fortawesome/free-solid-svg-icons/faEdit";
import { useRouter } from "vue-router";
import store from "./../../store/store";
import apiClientInstance from "./../../classes/apiClient";
import { EntityStore } from "laravel-vue-forms";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";

export default defineComponent({
  emits: ["refresh"],

  setup(props, context: SetupContext) {
    const entityStore = store.getModule("entity") as EntityStore;
    entityStore.api(apiClientInstance);
    entityStore.jsonApi(true);

    const router = useRouter();

    const entityTypeRecord = computed(() => {
      return props.args.entityTypeRecord;
    });

    const displayColumns = getDefaultRawColumns(entityTypeRecord);

    const canDelete = computed(() => {
      if (!entityTypeRecord.value) {
        return false;
      }

      if (
          typeof entityTypeRecord.value.entity_configuration.allowDelete ===
          "boolean" &&
          !entityTypeRecord.value.entity_configuration.allowDelete
      ) {
        return false;
      }

      return true;
    });

    const editForm = () => {
      if (!entityTypeRecord.value) {
        throw new Error("Unable to edit");
      }

      router.push({
        name: "formAdmin.entities_update",
        params: {
          entityType: entityTypeRecord.value.name,
          entityId: props.record._attributes.id,
        },
      });
    };

    const removeRecord = async () => {
      if (!entityTypeRecord.value) {
        throw new Error("Unable to delete");
      }
      await entityStore.deleteEntityForId(
          entityTypeRecord.value.name,
          props.record._attributes.id
      );

      context.emit("refresh");
    };

    return {
      displayColumns,
      canDelete,
      editForm,
      removeRecord,
      deleteIcon: faTimes,
      editIcon: faEdit,
      ...toRefs(props),
    };
  },

  props: {
    record: {
      required: true,
      type: Object,
    },
    args: {
      required: true,
      type: Object,
    },
  },
});
</script>
<template>
  <tr>
    <td v-for="column in displayColumns" :key="column">
      {{ record[column] }}
    </td>
    <td class="px-4 py2 cursor-pointer flex justify-end">
      <lvf-button @click="editForm" class="button mx-2">
        <span class="flex items-center">
          <font-awesome-icon
              class="text-white"
              :icon="editIcon"
          ></font-awesome-icon
          >&nbsp;Edit
        </span>
      </lvf-button>
      <lvf-button @click="removeRecord" class="button mx-2" v-if="canDelete">
        <span class="flex items-center">
          <font-awesome-icon :icon="deleteIcon"></font-awesome-icon>&nbsp;Delete
        </span>
      </lvf-button>
    </td>
  </tr>
</template>
