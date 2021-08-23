<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import config from "./../../classes/configuration";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const apiClient = inject("lvfApiClient");
    const useJsonApi = inject("lvfUseJsonApi");
    const router = useRouter();

    const formConfigsUrl = computed(() => {
      return config.adminApiPrefix + "/entity_types";
    });

    const goToCreate = () => {
      router.push({
        name: "formAdmin.entity_types_form",
        params: {
          id: "new",
        },
      });
    };

    return {
      apiClient,
      useJsonApi,
      formConfigsUrl,
      goToCreate,
    };
  },
});
</script>
<template>
  <div>
    <lvf-button @clicked="goToCreate">Create</lvf-button>
    <v-grid
      :record-url="formConfigsUrl"
      :api-client="apiClient"
      :use-json-api="useJsonApi"
      :allow-refresh="true"
      :headers="['Name', 'Title', 'Entity Type', 'Created', 'Updated', '']"
      record-type="home-entity-type-row"
    ></v-grid>
  </div>
</template>
