<script lang="ts">
import { defineComponent, SetupContext, ref, computed } from "vue";
import { guid } from "../../utilities/utils";

import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import {
  errorComputedProperties,
  helpTextComputedProperties,
  setupFormField,
} from "../../composition/formField";

export default defineComponent({
  components: {
    QuillEditor,
  },

  emits: ["update:modelValue"],

  setup(props, context: SetupContext) {
    let { form, fieldConfig } = setupFormField(props, context);
    let { withHelpIcon, hasHelpText } = helpTextComputedProperties(fieldConfig);
    let { hasError, errorMessages } = errorComputedProperties(
      form,
      fieldConfig
    );

    let randomId = ref(guid());

    let updateValue = (value: string) => {
      context.emit("update:modelValue", value);
      form.errors.clear(fieldConfig.valueField);
    };

    if (
      props.findInForm &&
      (Array.isArray(form.formConfig.fields) ||
        typeof form.formConfig.fields[Symbol.iterator] === "function")
    ) {
      form.formConfig.fields.forEach((field) => {
        if (field.name === props.fieldName) {
          fieldConfig.options.editorOptions = {};
          if (field.field_extra.editorOptions) {
            fieldConfig.options.editorOptions = field.field_extra.editorOptions;
          }
        }
      });
    } else {
      // eslint-disable-next-line
      fieldConfig.options.editorOptions = props.initialEditorOptions;
    }

    const editorOptions = computed(() => {
      var defaultOptions = {
        toolbar: [
          ["style", ["bold", "italic", "underline"]],
          ["fontsize", ["fontsize"]],
          ["color", ["color"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["insert", ["hr"]],
          ["height", ["height"]],
        ],
        callbacks: {
          onChange: function (contents: string) {
            updateValue(contents);
          },
        },
      };
      if (fieldConfig.options.editorOptions) {
        return Object.assign(defaultOptions, fieldConfig.options.editorOptions);
      }

      return defaultOptions;
    });

    return {
      form,
      fieldConfig,
      withHelpIcon,
      hasHelpText,
      hasError,
      errorMessages,
      randomId,
      editorOptions,
      updateValue,
    };
  },

  props: {
    label: {
      type: String,
    },
    fieldName: {
      type: String,
      required: true,
    },
    modelValue: {
      required: true,
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
    useJsonApi: {
      type: Boolean,
    },
    children: {},

    // quill options

    initialEditorOptions: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
});
</script>

<template>
  <div class="form-wysiwyg form-group">
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
    <div class="form-wysiwyg-editor">
      <quill-editor
        theme="snow"
        toolbar="full"
        :content="modelValue"
        @update:content="updateValue"
        content-type="html"
        :read-only="fieldConfig.disabled"
      ></quill-editor>
      <span class="help-block" v-if="form.errors.has(fieldConfig.valueField)">
        {{ form.errors.get(fieldConfig.valueField, true) }}
      </span>
    </div>
    <div v-if="hasHelpText">
      <span v-html="fieldConfig.fieldExtra.helpText"></span>
    </div>
  </div>
</template>
<style>
.ql-editor {
  min-height: 200px;
}
</style>
