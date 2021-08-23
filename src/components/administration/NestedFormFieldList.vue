<script lang="ts">
import { computed, defineComponent, SetupContext, toRefs } from "vue";
import draggable from "vuedraggable";
export default defineComponent({
  props: {
    modelValue: {
      type: Array,
      default: () => {
        return null;
      },
    },
    list: {
      type: Array,
      default: () => {
        return null;
      },
    },
    formConfigurationId: {
      required: true,
      type: Number,
    },
  },

  emits: [
    "update:modelValue",
    "formFieldCreated",
    "formFieldDeleted",
    "changed",
  ],

  components: {
    draggable,
  },

  setup(props, context: SetupContext) {
    const dragOptions = computed(() => {
      return {
        animation: 0,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      };
    });

    const realValue = computed(() => {
      return props.modelValue ? props.modelValue : props.list;
    });
    //
    // watch(props.modelValue, (updatedValue) => {
    //   context.emit("changed", updatedValue)
    // }, {deep: true});

    // methods
    const emitter = (value: Record<string, any>[]) => {
      context.emit("update:modelValue", value);
    };

    const formFieldCreated = (newFormField: Record<string, any>) => {
      context.emit("formFieldCreated", newFormField);
    };

    const formFieldDeleted = (deletedFormField: Record<string, any>) => {
      context.emit("formFieldDeleted", deletedFormField);
    };

    return {
      dragOptions,
      realValue,
      emitter,
      formFieldCreated,
      formFieldDeleted,
      ...toRefs(props),
    };
  },
});
</script>

<template>
  <draggable
    v-bind="dragOptions"
    tag="div"
    class="item-container"
    :list="list"
    item-key="id"
  >
    <template #item="{ element }">
      <div class="item-group">
        <div class="item">
          <form-configuration-form-field
            :field-id="element.id"
            class="form-field"
            :form-configuration-id="formConfigurationId"
            @formFieldCreated="formFieldCreated"
            @formFieldDeleted="formFieldDeleted"
          ></form-configuration-form-field>
        </div>
        <nested-form-field-list
          class="ml-4"
          :list="element.children"
          :form-configuration-id="formConfigurationId"
          @formFieldCreated="formFieldCreated"
          @formFieldDeleted="formFieldDeleted"
        />
      </div>
    </template>
  </draggable>
</template>
