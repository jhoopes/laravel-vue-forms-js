<template>
  <div>
    <v-grid
      :record-url="formConfigsUrl"
      :headers="[
        'Name',
        'Type',
        'Active',
        'Entity Name',
        'Entity Model',
        'Created',
        'Updated',
        ''
      ]"
      record-type="home-form-configuration-row"
      :use-json-api="useJsonApi"
    ></v-grid>
  </div>
</template>
<script>
import { config } from "@/admin/classes/configuration";
export default {
  inject: ["useJsonApi"],
  computed: {
    formConfigsUrl() {
      return config.adminApiPrefix + "/form_configurations";
    }
  }
};
</script>
