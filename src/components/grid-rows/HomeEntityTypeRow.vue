<script lang="ts">
import { computed, defineComponent, toRefs } from "vue";
import { useRouter } from "vue-router";
import { DateTime } from "luxon";
import { faEdit } from "@fortawesome/free-solid-svg-icons/faEdit";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { EntityType } from "./../../classes/models/entityType";

export default defineComponent({
  props: {
    record: {
      required: true,
      type: Object,
    },
  },

  setup(props) {
    let { record } = toRefs(props);
    const router = useRouter();

    const created = computed(() => {
      if (record.value instanceof EntityType) {
        //
        // already a model with presumably formatting the created at
        return record.value.created_at;
      }

      return DateTime.fromISO(record.value.created_at, {
        zone: "UTC",
      })
        .setZone("local")
        .toLocaleString(DateTime.DATETIME_FULL);
    });

    const updated = computed(() => {
      if (record.value instanceof EntityType) {
        //
        // already a model with presumably formatting the updated at
        return record.value.updated_at;
      }

      return DateTime.fromISO(record.value.updated_at, {
        zone: "UTC",
      })
        .setZone("local")
        .toLocaleString(DateTime.DATETIME_FULL);
    });

    const editForm = () => {
      router.push({
        name: "formAdmin.entity_types_form",
        params: { id: record.value.id },
      });
    };

    return {
      created,
      updated,
      editForm,
      editIcon: faEdit,
      checkIcon: faCheck,
    };
  },
});
</script>

<template>
  <tr>
    <td class="px-4 py-2">
      {{ record.name }}
    </td>
    <td class="px-4 py-2">
      {{ record.title }}
    </td>
    <td class="px-4 py-2">
      {{ record.type }}
    </td>
    <td class="px-4 py-2">
      {{ created }}
    </td>
    <td class="px-4 py-2">
      {{ updated }}
    </td>
    <td class="px-4 py2 cursor-pointer" @click="editForm">
      <font-awesome-icon :icon="editIcon"></font-awesome-icon>
    </td>
  </tr>
</template>
