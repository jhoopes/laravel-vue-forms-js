<template>
  <tr>
    <td class="px-4 py-2">
      {{ record.name }}
    </td>
    <td class="px-4 py-2">
      {{ record.type }}
    </td>
    <td class="px-4 py-2">
      <font-awesome-icon
        v-if="record.active"
        :icon="checkIcon"
      ></font-awesome-icon>
      <span v-else>-</span>
    </td>
    <td class="px-4 py-2">
      {{ record.entity_name }}
    </td>
    <td class="px-4 py-2">
      {{ record.entity_model }}
    </td>
    <td class="px-4 py-2">
      {{ created }}
    </td>
    <td class="px-4 py-2">
      {{ updated }}
    </td>
    <td
      class="px-4 py2 cursor-pointer"
      @click="
        $router.push({
          name: 'formAdmin.form_configurations.edit',
          params: { id: record.id }
        })
      "
    >
      <font-awesome-icon :icon="editIcon"></font-awesome-icon>
    </td>
  </tr>
</template>
<script>
import { DateTime } from "luxon";
import { faEdit } from "@fortawesome/free-solid-svg-icons/faEdit";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
export default {
  props: {
    record: {
      required: true,
      type: Object
    }
  },

  data() {
    return {
      editIcon: faEdit,
      checkIcon: faCheck
    };
  },

  computed: {
    created() {
      return DateTime.fromISO(this.record.created_at, {
        zone: "UTC"
      })
        .setZone("local")
        .toLocaleString(DateTime.DATETIME_FULL);
    },
    updated() {
      return DateTime.fromISO(this.record.updated_at, {
        zone: "UTC"
      })
        .setZone("local")
        .toLocaleString(DateTime.DATETIME_FULL);
    }
  }
};
</script>
