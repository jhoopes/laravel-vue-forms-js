<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import config from "../../classes/configuration";
import { useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const apiClient = inject("lvfApiClient");
    const useJsonApi = inject("lvfUseJsonApi");
    const router = useRouter();

    const formConfigsUrl = computed(() => {
      return config.adminApiPrefix + "/form_configurations";
    });

    const goToCreate = () => {
      router.push({
        name: "formAdmin.form_configurations.edit",
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
    <div class="controls-row">
      <lvf-button @clicked="goToCreate">Create Form Configuration</lvf-button>
    </div>
    <v-grid
      :record-url="formConfigsUrl"
      :api-client="apiClient"
      :use-json-api="useJsonApi"
      :allow-refresh="true"
      :headers="[
        'Name',
        'Type',
        'Active',
        'Entity Name',
        'Entity Model',
        'Created',
        'Updated',
        '',
      ]"
      record-type="home-form-configuration-row"
    ></v-grid>
  </div>
</template>
