<script lang="ts">
import { defineComponent, SetupContext, PropType, Ref, ref, toRefs } from "vue";
import vueFilePond, { VueFilePondComponent } from "vue-filepond";
import { FilePondFile } from "filepond";
import "filepond/dist/filepond.min.css";
import { IApiClient } from "./../../../types";
import { guid } from "./../../../utilities/utils";
import processFileUploadFactory, {
  FileUploadServerObject,
} from "./../../../classes/fileUploadServerFactory";

// Import image preview plugin styles
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";

// Import image preview and file type validation plugins
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

// Create component
const FilePond = vueFilePond(
  FilePondPluginFileValidateType,
  FilePondPluginImagePreview
) as VueFilePondComponent;

export default defineComponent({
  props: {
    apiClient: {
      required: true,
      type: Object as PropType<IApiClient>,
    },
    processFileUpload: {
      type: Object as PropType<FileUploadServerObject>,
    },
    fileApiUrl: {
      required: true,
      type: String,
    },
    allowableTypes: {
      required: true,
      type: String,
    },
    maxFiles: {
      type: Number,
      default: 1,
    },
  },

  components: {
    FilePond,
  },

  emits: ["addFile"],

  setup(props, context: SetupContext) {
    const dropzoneId: Ref<string> = ref(guid());
    let openDropzone = ref(false);

    let filePondInstance = ref();
    let files: Ref<Record<string, any>[]> = ref([]);

    /** @ts-ignore **/
    let fileUploadServerObject: FileUploadServerObject;
    if (!props.processFileUpload) {
      fileUploadServerObject = processFileUploadFactory(
        props.apiClient,
        {
          fileApiUrl: props.fileApiUrl,
        },
        (file: Record<string, any>) => {
          context.emit("addFile", file);
        },
        (fileId: string) => {
          context.emit("removeFile", fileId);
        }
      );
    } else {
      // eslint-disable-next-line
      fileUploadServerObject = props.processFileUpload
    }

    const removeFileFromInstance = (
      uploadErr: string | null,
      file: FilePondFile
    ) => {
      if (uploadErr) {
        console.error(uploadErr);
      }
      file.abortLoad();
    };

    return {
      dropzoneId,
      openDropzone,
      filePondInstance,
      files,
      removeFileFromInstance,
      ...toRefs(props),
    };
  },
});
</script>

<template>
  <div class="form-file-dropzone" :id="dropzoneId">
    <file-pond
      ref="filePondInstance"
      name="file"
      :allow-multiple="true"
      :server="fileUploadServerObject"
      :onprocessfile="removeFileFromInstance"
      :max-files="maxFiles"
      :max-parallel-uploads="1"
      :accepted-file-types="allowableTypes"
      credits="false"
    ></file-pond>
  </div>
</template>
