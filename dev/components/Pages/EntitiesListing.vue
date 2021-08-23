<script lang="ts">
import {defineComponent, ComputedRef, ref, inject, computed} from "vue";
import {IStore} from "laravel-vue-forms";
import {EntityType} from "laravel-vue-forms";
import {ApiClient} from "@/classes/apiClient";
import {EntityTypesStore} from "laravel-vue-forms";
import {useRouter} from "vue-router";
import {getDefaultColumns} from "../composition/custom_entity_utils";

export default defineComponent({

  setup() {
    const loading = ref(true);
    const router = useRouter();
    const apiClient = inject("lvfApiClient") as ApiClient;
    const useJsonApi = inject("lvfUseJsonApi") as boolean;
    const store = inject("lvfStore") as IStore;
    const entityTypesStore = store.getModule("entityType") as EntityTypesStore;
    entityTypesStore.api(apiClient);
    entityTypesStore.jsonApi(useJsonApi);

    let selectedEntityType = ref(0)

    const entityTypeRecord: ComputedRef<EntityType | undefined> = computed(
        () => {
          return entityTypesStore.entityTypesCollection.find({
            id: selectedEntityType.value,
          });
        }
    );

    entityTypesStore.getAllEntityTypes();

    const headers = computed(() => {
      if(!entityTypeRecord.value) {
        return [];
      }

      return getDefaultColumns(entityTypeRecord)
    })

    const goToCreate = () => {

      if(!entityTypeRecord.value) {
        throw new Error("Invalid entity type selection");
      }

      router.push({
        name: "formAdmin.entities_create",
        params: {
          entityType: entityTypeRecord.value.name
        }
      })
    }

    return {
      loading,
      apiClient,
      useJsonApi,
      selectedEntityType,
      entityTypeRecord,
      headers,
      entityTypes: entityTypesStore.entityTypesCollection.getModels(),
      goToCreate
    }

  },

});
</script>
<template>

  <div>
    <div class="mx-4 p-4 bg-white" v-if="entityTypes.length > 0">
      <form-select
          field-name="entity-type-selector"
          :options="entityTypes"
          v-model="selectedEntityType"
          option-label-field="title"
      ></form-select>
    </div>
    <div v-else class="mx-4 p-4 bg-white">
      Loading...
    </div>


    <div v-if="entityTypeRecord">
      <h1 class="font-bold text-3xl mb-4 md:mb-16">
        {{ entityTypeRecord.title }}
      </h1>

      <div class="controls-row">
        <button class="button" @click="goToCreate">
          Create {{ entityTypeRecord.title }}
        </button>
      </div>

      <v-grid
          :record-url="'/api/entities/' + entityTypeRecord.name"
          :api-client="apiClient"
          :use-json-api="useJsonApi"
          :allow-refresh="true"
          :headers="headers"
          :grid-args="{ entityTypeRecord }"
          record-type="custom-entity-row"
      ></v-grid>
    </div>
  </div>

</template>