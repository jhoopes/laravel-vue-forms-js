<script lang="ts">
import {defineComponent, inject, PropType, Ref, ref, toRefs} from "vue";
import vueFilePond, {VueFilePondComponent} from "vue-filepond";
import {ProgressServerConfigFunction} from "filepond"
import "filepond/dist/filepond.min.css";
import {IApiClient, IFormFieldFieldConfig} from "./../../../types";
import {guid} from "./../../../utilities/utils"
import {Form} from "./../../../classes/Form";
import defaultApiClient from "./../../../classes/apiClient";

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


type ServerLoadFunction = (p: (string | Record<string, any>)) => void;


export default defineComponent({
  props: {
    fieldConfig: {
      required: true,
      type: Object as PropType<IFormFieldFieldConfig>
    },
    form: {
      required: true,
      type: Object as PropType<Form>
    },
    apiClient: {
      type: Object as PropType<IApiClient>,
    },
  },

  components: {
    FilePond
  },

  setup(props) {

    const dropzoneId: Ref<string> = ref(guid());
    let openDropzone = ref(false);

    let filePondInstance = ref();
    let files: Ref<Record<string, any>[]> = ref([]);

    let apiClient: IApiClient
    if (typeof props.apiClient !== "undefined" && props.apiClient !== null) {
      // eslint-disable-next-line
      apiClient = props.apiClient; // don't need to watch after initial setup
    } else {
      apiClient = inject("apiClient", defaultApiClient);
    }


    const getCookie = (name: string): string | null => {
      // Split cookie string and get all individual name=value pairs in an array
      const cookieArr = document.cookie.split(";");

      // Loop through the array elements
      for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split("=");

        /* Removing whitespace at the beginning of the cookie name
              and compare it with the given string */
        if (name == cookiePair[0].trim()) {
          // Decode the cookie value and return
          return decodeURIComponent(cookiePair[1]);
        }
      }

      return null
    }

    const server = {
      process: (
          fieldName: string,
          file: File,
          metadata: Record<string, any>,
          load: ServerLoadFunction,
          error: (errorText: string) => void,
          progress: ProgressServerConfigFunction,
          abort: () => void
      ) => {

        const formData = new FormData();
        formData.append(fieldName, file, file.name);
        formData.append('collectionType', props.fieldConfig.fieldName);
        formData.append('fileable_id', String(props.form.id));
        if(props.form.formConfig.entity_type_id) {
          formData.append('entity_type_id', String(props.form.formConfig.entity_type_id));
        } else if(props.form.formConfig.entity_model !== null) {
          formData.append('fileable_type', props.form.formConfig.entity_model);
        }

        formData.append('metaData', JSON.stringify(metadata));

        const request = new XMLHttpRequest();
        const url = apiClient.urlBase + props.fieldConfig.options.fileApiUrl
        request.open('POST', url);
        for (var rHeader in apiClient.defaultHeaders) {
          if (Object.hasOwnProperty.call(apiClient.defaultHeaders, rHeader)) {
            request.setRequestHeader(rHeader, apiClient.defaultHeaders[rHeader]);
          }
        }

        const XSRFToken = getCookie("XSRF-TOKEN");
        if (XSRFToken !== null) {
          request.setRequestHeader('X-XSRF-TOKEN', XSRFToken);
        }

        request.withCredentials = apiClient.withCredentials;
        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
          if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
          } else {
            error('unable to upload file');
          }
        };

        request.send(formData);
        return {
          abort: () => {
            // This function is entered if the user has tapped the cancel button
            request.abort();
            abort();
          },
        };

      }
    }

    return {
      dropzoneId,
      openDropzone,
      filePondInstance,
      files,
      server,
      ...toRefs(props)
    }
  }


  // data() {
  //   return {
  //     dropzone: {},
  //     dropzoneId: "",
  //     autoProcessQueue: false,
  //   };
  // },
  //
  // created() {
  //   this.dropzoneId = this.randomizeId();
  //
  //   if (this.typeId) {
  //     this.autoProcessQueue = true;
  //   }
  // },
  //
  // watch: {
  //   typeId() {
  //     this.dropzone.processQueue();
  //     this.autoProcessQueue = true;
  //   },
  // },
  //
  // mounted() {
  //   var headers = null;
  //   if (window.dropzoneHeaders) {
  //     headers = window.dropzoneHeaders;
  //   }
  //
  //   this.dropzone = new Dropzone("#" + this.dropzoneId, {
  //     url: this.uploadApiUrl,
  //     autoProcessQueue: this.autoProcessQueue,
  //     uploadMultiple: this.uploadMultiple,
  //     parallelUploads: this.maxFiles,
  //     maxFiles: this.maxFiles,
  //     addRemoveLinks: true,
  //     headers: headers,
  //   });
  //
  //   if (this.uploadMultiple) {
  //     this.dropzone.on("sendingmultiple", this.handleSending);
  //     this.dropzone.on("successmultiple", this.handleSuccess);
  //   } else {
  //     this.dropzone.on("sending", this.handleSending);
  //     this.dropzone.on("success", this.handleSuccess);
  //   }
  //   this.dropzone.on("error", this.handleError);
  // },
  //
  // methods: {
  //   handleSending(file, xhr, formData) {
  //     formData.append("_token", window.csrfToken);
  //     formData.append("fileable_type", this.type);
  //     formData.append("fileable_id", this.typeId);
  //     if (this.stepId) {
  //       formData.append("step_id", this.stepId);
  //     }
  //
  //     for (var key in this.uploadParams) {
  //       if (!Object.prototype.hasOwnProperty.call(this.uploadParams, key)) {
  //         continue;
  //       }
  //
  //       formData.append(key, this.uploadParams[key]);
  //     }
  //
  //     formData.append("meta_type", this.metaType);
  //   },
  //   handleSuccess(file, response) {
  //     // add logic to add the file to the files viewer
  //     if (Array.isArray(response.file)) {
  //       // check if there were multiple files
  //       response.file.forEach((file) => {
  //         this.$emit("addFile", file);
  //       });
  //
  //       file.forEach((dzFile) => {
  //         // remove the file from the dropzone element on success
  //         this.dropzone.removeFile(dzFile);
  //       });
  //     } else {
  //       this.$emit("addFile", response.file);
  //       // remove the file from the dropzone element on success
  //       this.dropzone.removeFile(file);
  //     }
  //     window.notify.message("Successfully uploaded file", "success");
  //   },
  //   handleError() {
  //     window.notify.message("Error Uploading File", "error");
  //   },
  //   openDropzone() {
  //     this.dropzone.hiddenFileInput.click();
  //   },
  //   randomizeId() {
  //     var text = "";
  //     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  //
  //     for (var i = 0; i < 20; i++)
  //       text += possible.charAt(Math.floor(Math.random() * possible.length));
  //
  //     return text;
  //   },
  // },
});
</script>

<template>
  <div class="form-file-dropzone" :id="dropzoneId">
    <file-pond
        name="file"
        ref="filePondInstance"
        :allow-multiple="true"
        :server="server"
        :files="files"
        accepted-file-types="image/jpeg, image/png, application/pdf"
    ></file-pond>
  </div>
</template>