<script lang="ts">
import {defineComponent, ref} from "vue";
import FormSelect from "@/components/form-components/FormSelect.vue";

export default defineComponent({
  name: 'Dashboard',
  components: {FormSelect},
  setup() {


    let formTextValue = ref('');
    let formPasswordValue = ref('');
    let code = ref('')
    let formSelectValue = ref('');

    return {
      formTextValue,
      formPasswordValue,
      code,
      formSelectValue
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
      <form-code
          field-name="code"
          label="Form Code Field"
          v-model="code"
      ></form-code>
      <span class="mx-4" v-text="code"></span>
    </div>

  </div>
</template>