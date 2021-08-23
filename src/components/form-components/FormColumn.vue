<script lang="ts">
import { setupFormField } from "../../composition/formField";
import { FormField } from "./../../classes/models/formField";
import { getFormFieldComponent } from "./../../composition/vueForm";
import { computed, defineComponent, PropType, SetupContext, toRefs } from "vue";
export default defineComponent({
  name: "form-column",

  props: {
    children: {
      type: Array as PropType<FormField[]>,
      default: () => {
        return [];
      },
    },
    findInForm: {
      type: Boolean,
      default: false,
    },
    useJsonApi: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, context: SetupContext) {
    let { form, fieldConfig } = setupFormField(props, context);

    const visibleChildren = computed(() => {
      return props.children.filter((child: FormField) => {
        return child.visible;
      });
    });

    return {
      form,
      fieldConfig,
      visibleChildren,
      getFormFieldComponent,
      ...toRefs(props),
    };
  },
});
</script>

<template>
  <div>
    <component
      v-for="field in visibleChildren"
      :key="field.id"
      :is="getFormFieldComponent(field.widget)"
      v-show="field.visible && form.fieldMeetsConditions[field.name]"
      :field-name="field.name"
      :modelValue="form.getFieldValue(field)"
      @update:modelValue="
        (newVal) => form.updateValueAndConditionals(newVal, field)
      "
      @options-updated="
        (newOptions) => form.updateOptionsForField(newOptions, field)
      "
      :find-in-form="findInForm"
    ></component>
  </div>
</template>
