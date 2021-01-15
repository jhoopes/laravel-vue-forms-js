<template>
    <div>
        <h2>Custom Entity Types</h2>
         <v-grid
            :record-url="customEntityTypesURL"
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
            :use-json-api="useJsonApi"
            ></v-grid>
    </div>
</template>
<script>
import { config } from "@/admin/classes/configuration";
export default {
  inject: ["useJsonApi"],
  computed: {
      customEntityTypesURL() {
          return config.adminApiPrefix + '/custom_entity_types'
      }
  }
}
</script>
