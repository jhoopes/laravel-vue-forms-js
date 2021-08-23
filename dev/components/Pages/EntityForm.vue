<script lang="ts">
import {defineComponent, toRefs, ref, computed, ComputedRef, onMounted, inject} from "vue";
import store from "./../../store/store";

import {EntityTypesStore, FormConfigurationStore, EntityStore, Generic, EntityType, ApiClient} from "laravel-vue-forms";

export default defineComponent({


  setup(props) {
    const apiClient = inject("lvfApiClient") as ApiClient;
    const useJsonApi = inject("lvfUseJsonApi") as boolean;
    const entityTypesStore = store.getModule("entityType") as EntityTypesStore;
    const formConfigurationStore = store.getModule(
        "formConfiguration"
    ) as FormConfigurationStore;
    const entityStore = store.getModule("entity") as EntityStore;
    entityTypesStore.api(apiClient);
    entityTypesStore.jsonApi(useJsonApi);
    formConfigurationStore.api(apiClient);
    formConfigurationStore.jsonApi(useJsonApi);
    entityStore.api(apiClient);
    entityStore.jsonApi(useJsonApi);

    const entityTypeRecord: ComputedRef<EntityType | undefined> = computed(
        () => {
          return entityTypesStore.entityTypesCollection.find({
            name: props.entityType,
          });
        }
    );

    const entityConfigForm = computed(() => {
      if (!entityTypeRecord.value) {
        return;
      }

      return formConfigurationStore.formConfigurations
          .filter({
            id: entityTypeRecord.value.default_form_configuration_id,
          }).first();
    });

    let entityToEdit = computed((): Generic | null => {
      if (!parseInt(String(props.entityId))) {
        return entityStore.getDefaultEntity();
      }

      if (
          !entityTypeRecord.value ||
          !entityStore.entities[entityTypeRecord.value.name]
      ) {
        return null;
      }

      return (
          entityStore.entities[entityTypeRecord.value.name]
              .getModels()
              .find((entity: Generic) => {
                return entity._attributes.id === parseInt(String(props.entityId));
              }) || null
      );
    });

    let entityFormUrl = computed((): string | undefined => {
      if (!entityTypeRecord.value) {
        return undefined;
      }

      if (!parseInt(String(props.entityId))) {
        return "/api/entities/" + entityTypeRecord.value.name;
      }

      return (
          "/api/entities/" + entityTypeRecord.value.name + "/" + props.entityId
      );
    });

    let loading = ref(false);
    onMounted(async () => {
      loading.value = true;

      if(!entityTypeRecord.value && entityTypesStore.entityTypesCollection.length === 0) {
        await entityTypesStore.getAllEntityTypes();
      }

      if (
          !entityTypeRecord.value ||
          !entityTypeRecord.value.default_form_configuration_id
      ) {
        loading.value = false;
        return;
      }

      await formConfigurationStore.getFormConfigurationById(
          entityTypeRecord.value.default_form_configuration_id
      );

      let entityIdNumber = parseInt(String(props.entityId));
      if (entityIdNumber) {
        await entityStore.getEntityForId(
            props.entityType,
            parseInt(String(props.entityId))
        );
      }

      loading.value = false;
    });


    return {
      entityTypeRecord,
      entityConfigForm,
      entityToEdit,
      entityFormUrl,
      loading,
      apiClient,
      ...toRefs(props)
    }
  },

  props: {
    entityType: {
      required: true,
      type: String
    },
    entityId: {
      required: true,
      type: Number
    }
  }
})
</script>
<template>

  <div class="mx-4 p-4 bg-white">
    <div v-if="entityConfigForm && entityConfigForm.id && entityToEdit">
      <h1 class="font-bold text-3xl">{{ entityTypeRecord.title }} - Form</h1>
      <vue-form
          :form-config="entityConfigForm"
          :form-data="entityToEdit"
          :api-client="apiClient"
          :use-json-api="true"
          :form-submit-url="entityFormUrl"
      ></vue-form>
    </div>
    <div v-else-if="loading">
      Loading ...
      <font-awesome-icon icon="spinner" :spin="true"></font-awesome-icon>
    </div>
    <div v-else>Cannot find form</div>
  </div>

</template>