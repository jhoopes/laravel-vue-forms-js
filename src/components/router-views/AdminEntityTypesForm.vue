<script lang="ts">
import { computed, defineComponent, inject, onMounted, ref } from "vue";
import { ApiClient } from "./../../classes/apiClient";
import { IStore } from "./../../types";
import { FormConfigurationStore } from "./../../store/formConfigurationStore";
import { EntityTypesStore } from "./../../store/entityTypesStore";
import { EntityType } from "./../../classes/models/entityType";
import { useRouter } from "vue-router";
export default defineComponent({
  props: {
    id: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    const loading = ref(true);
    const apiClient = inject("lvfApiClient") as ApiClient;
    const useJsonApi = inject("lvfUseJsonApi") as boolean;
    const store = inject("lvfStore") as IStore;
    const formConfigurationStore = store.getModule(
      "formConfiguration"
    ) as FormConfigurationStore;

    const entityTypeStore = store.getModule("entityType") as EntityTypesStore;

    if (!formConfigurationStore || !entityTypeStore) {
      throw new Error(
        "form configuration store or entity type store not found"
      );
    }

    formConfigurationStore.api(apiClient);
    formConfigurationStore.jsonApi(useJsonApi);
    entityTypeStore.api(apiClient);
    entityTypeStore.jsonApi(useJsonApi);

    let entityConfigForm = computed(() => {
      return formConfigurationStore.formConfigurations.find({
        name: "entity_type_form",
      });
    });

    let entityTypeToEdit = computed((): EntityType | undefined => {
      if (!parseInt(String(props.id))) {
        return entityTypeStore.getDefaultEntityType();
      }

      return entityTypeStore.entityTypesCollection.find({ id: props.id });
    });

    const router = useRouter();
    const commitAndGo = (newEntityType: EntityType) => {
      entityTypeStore.entityTypesCollection.add(newEntityType);
      router.push({
        name: "formAdmin.entity_types_form",
        params: {
          id: newEntityType.id,
        },
      });
    };

    const updateEntityType = (updatedEntityType: Record<string, any>) => {
      entityTypeStore.updateEntityTypeModel(updatedEntityType);
    };

    onMounted(async () => {
      loading.value = true;

      if (!entityConfigForm.value) {
        await formConfigurationStore.getFormConfigurationByName(
          "entity_type_form"
        );
      }

      if (!entityTypeToEdit.value && parseInt(String(props.id))) {
        await entityTypeStore.getEntityTypeForId(props.id);
      }

      loading.value = false;
    });

    return {
      loading,
      useJsonApi,
      apiClient,
      commitAndGo,
      updateEntityType,
      entityConfigForm,
      entityTypeToEdit,
    };
  },
});
</script>
<template>
  <div>
    <div v-if="!loading">
      <vue-form
        v-if="entityConfigForm && entityTypeToEdit"
        :form-config="entityConfigForm"
        :form-data="entityTypeToEdit"
        :use-json-api="useJsonApi"
        @created="commitAndGo"
        @updated="updateEntityType"
        :api-client="apiClient"
      ></vue-form>
    </div>
    <div v-else class="mx-auto">Loading ...</div>
  </div>
</template>
