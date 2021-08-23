<script lang="ts">
import {
  inject,
  watch,
  ref,
  onBeforeMount,
  defineComponent,
  computed,
  SetupContext,
  PropType,
  reactive,
} from "vue";
import { getFormFieldComponent } from "../../composition/vueForm";
import { setupFormField } from "../../composition/formField";
import { FormField } from "../../classes/models/formField";

export default defineComponent({
  name: "FormTab",

  emits: ["runAction"],

  setup(props, context: SetupContext) {
    let { form, fieldConfig } = setupFormField(props, context);
    const isActive = ref(false);
    const tabsProvider: Record<string, any> = inject(
      "tabsProvider",
      reactive({
        activeTabHash: "",
        lastActiveTabHash: "",
        tabs: [],
      })
    );
    const header = props.prefix + props.name + props.suffix;
    const computedId = props.id
      ? props.id
      : props.name.toLowerCase().replace(/ /g, "-");
    const hash = "#" + (!props.isDisabled ? computedId : "");
    watch(
      () => tabsProvider.activeTabHash,
      () => {
        isActive.value = hash === tabsProvider.activeTabHash;
      }
    );
    onBeforeMount(() => {
      tabsProvider.tabs.push({
        name: props.name,
        header: header,
        isDisabled: props.isDisabled,
        hash: hash,
        index: tabsProvider.tabs.length,
      });
    });

    const visibleChildren = computed(() => {
      return props.children.filter((child: FormField) => {
        return child.visible;
      });
    });

    const runAction = (action: string) => {
      context.emit("runAction", action);
    };

    return {
      form,
      fieldConfig,
      header,
      computedId,
      hash,
      isActive,
      visibleChildren,
      runAction,
      getFormFieldComponent,
    };
  },

  props: {
    panelClass: {
      type: String,
      default: "tabs-component-panel",
    },
    children: {
      type: Array as PropType<FormField[]>,
      default: () => {
        return [];
      },
    },
    id: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    prefix: {
      type: String,
      default: "",
    },
    suffix: {
      type: String,
      default: "",
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    autoSave: {
      required: true,
    },
    actions: {
      required: true,
    },
    saving: {
      required: true,
    },
    showSaving: {
      required: true,
    },
    savingText: {
      required: true,
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
});
</script>

<template>
  <section
    v-show="isActive"
    :aria-hidden="!isActive"
    :class="panelClass"
    :id="computedId"
    role="tabpanel"
    ref="tab"
  >
    <div v-show="isActive">
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
        :children="field.children || null"
        :find-in-form="findInForm"
      ></component>
      <div class="controls-row" v-if="disabled === false && autoSave === false">
        <button
          class="button"
          v-for="action in actions"
          :key="action.action"
          @click.prevent="runAction(action.action)"
          v-html="action.label"
          :disabled="showSaving && saving"
        ></button>
        <span v-if="saving && showSaving"
          ><font-awesome-icon :icon="spinner" :spin="true"></font-awesome-icon
          >{{ savingText }}</span
        >
      </div>
    </div>
  </section>
</template>
