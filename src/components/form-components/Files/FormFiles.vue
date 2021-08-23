<script lang="ts">
import {
  defineComponent,
  ref,
  SetupContext,
  toRefs,
  watch,
  watchEffect,
    PropType
} from "vue";
import {
  setupFormField,
  helpTextComputedProperties,
  errorComputedProperties,
  getFormFieldFieldExtra,
} from "./../../../composition/formField";
import config from "@/classes/configuration";
import {IApiClient} from "@/types";


// import FormFile from "./FormFile.vue";
// import FormFileUpload from "./FormFileUpload.vue";

export default defineComponent({
  name: "form-files",

  setup(props, context: SetupContext) {
    let { form, fieldConfig } = setupFormField(props, context);
    let { withHelpIcon, hasHelpText } = helpTextComputedProperties(fieldConfig);
    let { hasError, errorMessages } = errorComputedProperties(
      form,
      fieldConfig
    );

    let hasIdentity = ref(Boolean(form.id));
    let showUploadContainer = ref(Boolean(form.id));

    if (
      props.findInForm &&
      (Array.isArray(form.formConfig.fields) ||
        typeof form.formConfig.fields[Symbol.iterator] === "function")
    ) {
      form.formConfig.fields.forEach((field) => {
        if (field.name === props.fieldName) {
          var fieldExtra = getFormFieldFieldExtra(field);

          if (form.formConfig.entity_type_id) {
            fieldConfig.options.entity_type_id = form.formConfig.entity_type_id;
          } else {
            fieldConfig.options.fileable_type = form.formConfig.entity_model;
          }

          if (form.id) {
            fieldConfig.options.fileable_id = form.id;
          }

          fieldConfig.options.maxFiles = 100;
          if (fieldExtra.maxFiles) {
            fieldConfig.options.maxFiles = fieldExtra.maxFiles;
          }

          fieldConfig.options.fileApiUrl = props.fileApiUrl;
          if (fieldExtra.fileApiUrl) {
            fieldConfig.options.fileApiUrl = fieldExtra.filApiUrl;
          }

          fieldConfig.options.uploadParams = {};
          if (fieldExtra.uploadParams) {
            fieldConfig.options.uploadParams = fieldExtra.uploadParams;
          }
        }
      });
    } else {
      // eslint-disable-next-line
      fieldConfig.options.fileable_type = props.fileableType;
      // eslint-disable-next-line
      fieldConfig.options.fileable_id = props.fileableId;
      // eslint-disable-next-line
      fieldConfig.options.maxFiles = props.maxFiles;
      // eslint-disable-next-line
      fieldConfig.options.fileApiUrl = props.fileApiUrl;
      // eslint-disable-next-line
      fieldConfig.options.uploadParams = props.uploadParams;
    }

    watch(form, function (newForm, oldForm) {
      if (!oldForm.id) {
        fieldConfig.options.fileable_id = newForm.id;
      }
    }, {deep: true});

    watchEffect(() => {
      showUploadContainer.value = false;
      if (
        Array.isArray(props.modelValue) &&
        props.modelValue.length >= fieldConfig.options.maxFiles
      ) {
        showUploadContainer.value = false;
      } else if(form.id) {
        showUploadContainer.value = true;
      }
    });

    const addFile = (file: Record<string, any>) => {

      if(!Array.isArray(props.modelValue)) {
        return;
      }

      let newFiles: Record<string, any>[] = props.modelValue;
      if (!newFiles) {
        newFiles = [];
      }

      newFiles.push(file);
      context.emit("update:modelValue", newFiles);
    };

    const deleteFile = (deletedFile: Record<string, any>) => {
      if (!Array.isArray(props.modelValue)) {
        throw new Error(
          "Invalid model value for form files.  Please pass in an array"
        );
      }

      context.emit(
        "update:modelValue",
        props.modelValue.filter((file: Record<string, any>) => {
          return file.id !== deletedFile.id;
        })
      );
    };

    // if(!props.modelValue ||
    //     (
    //         !Array.isArray(props.modelValue) &&
    //         props.modelValue !instanceof Collection
    //     )
    //   ) {
    //   context.emit("update:modelValue", []);
    // }

    return {
      form,
      fieldConfig,
      withHelpIcon,
      hasHelpText,
      hasError,
      errorMessages,
      hasIdentity,
      showUploadContainer,
      addFile,
      deleteFile,
      ...toRefs(props),
    };
  },

  props: {
    // formField Props
    label: {
      type: String,
    },
    fieldName: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Array as PropType<Record<string, any>[]>
    },
    showLabel: {
      type: Boolean,
      default: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    findInForm: {
      type: Boolean,
      default: false,
    },
    apiClient: {
      type: Object as PropType<IApiClient>,
    },
    useJsonApi: {
      type: Boolean,
    },
    children: {},

    // file props
    uploadParams: {
      type: Object,
      default: () => {
        return {};
      }
    },
    metaType: {
      type: String,
    },
    maxFiles: {
      type: Number,
      default: 100,
    },
    fileableType: {
      type: String,
    },
    fileableId: {
      type: Number,
    },
    fileApiUrl: {
      type: String,
      default: () => {
        return config.apiPrefix + '/files'
      }
    },
  },
});
</script>
<template>
  <div
    class="form-group form-file-upload-container"
    :id="fieldName + '-text-field'"
    :class="{ 'has-error': hasError }"
  >
    <label class="form-control-label"
      ><span v-html="fieldConfig.label"></span>
      <span class="required" v-if="fieldConfig.fieldExtra.required"
        >&nbsp;&nbsp;(*)</span
      >
      <span
        v-if="withHelpIcon"
        :class="fieldConfig.fieldExtra.withIcon"
        :title="fieldConfig.fieldExtra.helpText"
      ></span>
    </label>
    <div>
      <form-file
        :files="modelValue"
        :field-config="fieldConfig"
        @deletedFile="deleteFile"
      ></form-file>
      <form-file-upload
        v-if="showUploadContainer"
        :field-config="fieldConfig"
        :form="form"
        @addFile="addFile"
      ></form-file-upload>
      <div class="help-block text-center" v-if="!hasIdentity">
        Please create your record before being able to upload files
      </div>
      <span class="help-block" v-if="hasError">
        {{ errorMessages }}
      </span>
    </div>
    <div v-if="hasHelpText">
      <span v-html="fieldConfig.fieldExtra.helpText"></span>
    </div>
  </div>
</template>
