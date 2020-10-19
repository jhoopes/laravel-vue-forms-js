<template>
  <div
    class="form-group"
    :id="fieldName + '-code-field'"
    :class="{ 'has-error': form.errors.has(this.fieldConfig.value_field) }"
  >
    <label class="form-control-label"
      ><span v-html="fieldConfig.label"></span>
      <span class="required" v-if="fieldConfig.field_extra.required"
        >&nbsp;&nbsp;(*)</span
      >
      <span
        v-if="withHelpIcon"
        :class="fieldConfig.field_extra.withIcon"
        :title="fieldConfig.field_extra.helpText"
      ></span>
    </label>
    <div class="">
      <pre
        class="m-0"
        :style="'height: ' + height"
        :id="'code-' + randomId"
      ></pre>
      <span class="errors" v-if="form.errors.has(this.fieldConfig.value_field)">
        {{ form.errors.get(this.fieldConfig.value_field, true) }}
      </span>
    </div>
    <div v-if="hasHelpText">
      <span v-html="fieldConfig.field_extra.helpText"></span>
    </div>
  </div>
</template>
<script>
import FormField from "../../mixins/FormField";
import { debounce } from "lodash";

import Ace from "ace-builds";
import "ace-builds/src-min-noconflict/ext-emmet";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/ext-beautify";
import { guid } from "../../utilities/utils";
var themeMonokai = require("ace-builds/src-noconflict/theme-monokai");

const CDN = "https://cdn.jsdelivr.net/npm/ace-builds@1.3.3/src-min-noconflict";

export default {
  mixins: [FormField],
  name: "form-code",

  props: {
    initialEditorOptions: {
      type: Object,
      default() {
        return {
          height: "400px",
          mode: "json",
          ace_options: []
        };
      }
    }
  },

  data() {
    return {
      randomId: guid(),
      editor: null
    };
  },

  created() {
    if (
      this.findInForm &&
      this.form &&
      this.form.formConfig &&
      (Array.isArray(this.form.formConfig.fields) ||
        typeof this.form.formConfig.fields[Symbol.iterator] === "function")
    ) {
      this.form.formConfig.fields.forEach(field => {
        if (field.name === this.fieldName) {
          this.$set(this.fieldConfig, "editorOptions", {});
          if (field.field_extra.editorOptions) {
            this.fieldConfig.editorOptions = field.field_extra.editorOptions;
          }
        }
      });
    } else {
      this.$set(this.fieldConfig, "editorOptions", this.initialEditorOptions);
    }

    Ace.config.set("basePath", CDN);
    Ace.config.set("modePath", CDN);
    Ace.config.set("themePath", CDN);
    Ace.config.set("workerPath", CDN);
  },

  mounted() {
    this.editor = Ace.edit("code-" + this.randomId);
    this.editor.setTheme(themeMonokai);
    this.editor.session.setMode("ace/mode/" + this.mode);
    this.editor.setOptions(this.aceOptions);
    this.setValueOnEditor();
    this.editor.session.on("change", this.updateValue);
  },

  computed: {
    aceOptions() {
      let defaultOptions = {
        showLineNumbers: true,
        enableBasicAutocompletion: true,
        enableSnippets: false,
        enableLiveAutocompletion: false,
        enableEmmet: true
      };

      if (!this.fieldConfig.editorOptions.ace_options) {
        return defaultOptions;
      }

      return Object.assign(
        defaultOptions,
        this.fieldConfig.editorOptions.ace_options
      );
    },
    height() {
      if (!this.fieldConfig.editorOptions.height) {
        return "400px";
      }
      return this.fieldConfig.editorOptions.height;
    },
    mode() {
      if (!this.fieldConfig.editorOptions.mode) {
        return "javascript";
      }

      return this.fieldConfig.editorOptions.mode;
    }
  },

  methods: {
    updateValue: debounce(function() {
      var value = this.editor.session.getValue();
      if (this.mode === "json") {
        try {
          value = JSON.stringify(JSON.parse(this.editor.session.getValue()));
        } catch {
          return;
        }
      }

      this.form.errors.clear(this.fieldConfig.value_field);
      this.$emit("input", value);
    }, 1000),
    setValueOnEditor() {
      var beautify = Ace.require("ace/ext/beautify");

      if (this.mode === "json" && typeof this.value === "object") {
        let jsonString = JSON.stringify(this.value);
        this.editor.session.setValue(jsonString);
        beautify.beautify(this.editor.session);
        this.$emit("input", jsonString);
        return;
      }

      if (typeof this.value !== "string") {
        console.log(this.value);
        console.error("Invalid value for code form field");
      }

      this.editor.session.setValue(this.value);

      beautify.beautify(this.editor.session);
    }
  }
};
</script>
<style>
#code {
  position: absolute;
  width: 94%;
}
</style>
