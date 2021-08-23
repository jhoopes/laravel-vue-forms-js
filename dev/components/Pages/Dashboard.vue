<script lang="ts">
import {defineComponent, ref } from "vue";

export default defineComponent({
  name: 'Dashboard',
  setup() {


    let formTextValue = ref('');
    let formPasswordValue = ref('');
    let code = ref('')
    let wysiwyg = ref('')
    let formSelectValue = ref('');

    let datepicker = ref(null);
    let files = ref([]);

    return {
      formTextValue,
      formPasswordValue,
      code,
      wysiwyg,
      formSelectValue,
      datepicker,
      files
    }
  }
})
</script>
<template>
  <div>

    <div class="mx-4 p-4 bg-white rounded">
      <form-static
          field-name="static"
          static-text="<div class='text-center w-full'>Some Static text to introduce </div>"
          :value="null"
      ></form-static>
      <span class="mx-4" v-text="formTextValue"></span>
    </div>

    <div class="mx-4 p-4 bg-white rounded">
      <form-text
          field-name="testing"
          label="Text Field"
          placeholder="Text Field Placeholder"
          v-model="formTextValue"
      ></form-text>
      <span class="mx-4" v-text="formTextValue"></span>
    </div>

    <div class="mx-4 p-4 bg-white rounded">
      <form-password
          field-name="password"
          label="Password Field"
          placeholder="Password Field Placeholder"
          v-model="formPasswordValue"
      ></form-password>
      <span class="mx-4" v-text="formPasswordValue"></span>
    </div>

    <div class="mx-4 p-4 bg-white rounded">
      <form-select
          field-name="formselect"
          label="Select Field"
          v-model="formSelectValue"
      ></form-select>
      <span class="mx-4" v-text="formPasswordValue"></span>
    </div>

    <div class="mx-4 p-4 bg-white rounded">
      <form-datepicker
          label="Datepicker field"
          field-name="datepicker"
          v-model="datepicker"
      ></form-datepicker>
      <span class="mx-4" v-text="formTextValue"></span>
    </div>

    <form-files
      fileable-type="form_configuration"
      :fileable-id="1"
      field-name="form-files-test"
      v-model="files"
    ></form-files>

    <form-wysiwyg
        field-name="wysiwyg"
        label="test"
      v-model="wysiwyg"
    ></form-wysiwyg>

    <div class="mx-4 p-4 bg-white rounded">
      <form-code
          field-name="code"
          label="Form Code Field"
          v-model="code"
      ></form-code>
      <span class="mx-4" v-text="code"></span>
    </div>

  </div>
</template>