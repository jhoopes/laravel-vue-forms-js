<script lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faFile, faDownload, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  PropType,
  SetupContext,
  defineComponent,
  ref,
  reactive,
  inject,
  computed,
} from "vue";
import { IApiClient, IFormFieldFieldConfig } from "./../../../types";
import defaultApiClient from "./../../../classes/apiClient";

export default defineComponent({
  setup(props, context: SetupContext) {
    const apiClient: IApiClient = inject("apiClient", defaultApiClient);

    let showFileDeleteModal = ref(false);
    let deleteFile: Record<string, any> = reactive({});

    const realFiles = computed(() => {
      return props.files.filter((file: Record<string, any>) => {
        return !file.temporary;
      });
    });

    const downloadFile = (file: Record<string, any>) => {
      window.open(
        props.fieldConfig.options.fileApiUrl + "/" + file.id + "/download"
      );
    };

    const previewIcon = (file: Record<string, any>): string | null => {
      if (file.thumbnail) {
        return (
          props.fieldConfig.options.fileApiUrl + "/" + file.id + "/thumbnail"
        );
      }

      return null;
    };

    const selectFileForDeletion = (file: Record<string, any>) => {
      deleteFile = file;
      showFileDeleteModal.value = true;
    };

    const deleteSelectedFile = async () => {
      if (props.fieldConfig.disabled) {
        return;
      }

      showFileDeleteModal.value = false;
      await apiClient.delete(
        props.fieldConfig.options.fileDeleteUrl + "/" + deleteFile.id
      );
      context.emit("deletedFile", deleteFile);
      deleteFile = reactive({});
    };

    return {
      showFileDeleteModal,
      deleteFile,
      realFiles,
      fileIcon: faFile,
      downloadIcon: faDownload,
      closeIcon: faTimes,
      downloadFile,
      previewIcon,
      selectFileForDeletion,
      deleteSelectedFile,
    };
  },

  props: {
    files: {
      required: true,
      type: Array as PropType<Record<string, any>[]>,
    },
    fieldConfig: {
      required: true,
      type: Object as PropType<IFormFieldFieldConfig>,
    },
  },

  components: {
    FontAwesomeIcon,
  },
});
</script>
<template>
  <div class="existing-files row">
    <div class="text-center file" v-for="file in realFiles" :key="file.id">
      <div class="file-icon">
        <div v-if="previewIcon(file)" class="thumbnail">
          <img :src="previewIcon(file)" width="80px" />
        </div>
        <font-awesome-icon
          :icon="fileIcon"
          size="4x"
          v-else
        ></font-awesome-icon>
      </div>
      <div class="flex justify-around action-row">
        <font-awesome-icon
          :icon="downloadIcon"
          @click="downloadFile(file)"
        ></font-awesome-icon>
        <font-awesome-icon
          :icon="closeIcon"
          @click="selectFileForDeletion(file)"
          v-if="!fieldConfig.disabled"
        ></font-awesome-icon>
      </div>
      <div class="file-name">
        {{ file.file_name }}
      </div>
    </div>
    <lvf-modal v-if="showFileDeleteModal" @close="showConfirmDelete = false">
      <template v-slot:header>
        <h2>Delete or Dissociate?</h2>
      </template>
      <template v-slot:body>
        <div>
          <p class="mb-8">Are you sure you want to delete this file?</p>
          <div class="flex justify-around">
            <button class="button" @click="deleteSelectedFile">
              Delete Permanently
            </button>
            <button class="button" @click="() => (showFileDeleteModal = false)">
              Cancel
            </button>
          </div>
        </div>
      </template>
    </lvf-modal>
  </div>
</template>
