<template>
  <draggable
    v-bind="dragOptions"
    tag="div"
    class="item-container"
    :list="list"
    :value="value"
    @input="emitter"
  >
    <div class="item-group" :key="field.id" v-for="field in realValue">
      <div class="item">
        <form-configuration-form-field
          :field-id="field.id"
          class="form-field"
          :form-configuration-id="formConfigurationId"
          @formFieldCreated="formFieldCreated"
          @formFieldDeleted="formFieldDeleted"
        ></form-configuration-form-field>
      </div>
      <nested-form-field-list
        class="ml-4"
        :list="field.children"
        :form-configuration-id="formConfigurationId"
        @formFieldCreated="formFieldCreated"
        @formFieldDeleted="formFieldDeleted"
      />
    </div>
  </draggable>
</template>

<script>
import draggable from "vuedraggable";
export default {
  props: {
    value: {
      required: false,
      type: Array,
      default: null
    },
    list: {
      required: false,
      type: Array,
      default: null
    },
    formConfigurationId: {
      required: true,
      type: Number
    }
  },

  components: {
    draggable
  },
  computed: {
    dragOptions() {
      return {
        animation: 0,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    },
    // this.value when input = v-model
    // this.list  when input != v-model
    realValue() {
      return this.value ? this.value : this.list;
    }
  },

  watch: {
    value: {
      handler(updatedValue) {
        this.$emit("changed", updatedValue);
      },
      deep: true
    }
  },

  methods: {
    emitter(value) {
      this.$emit("input", value);
    },
    formFieldCreated(newFormField) {
      this.$emit("formFieldCreated", newFormField);
    },
    formFieldDeleted(deletedFormField) {
      this.$emit("formFieldDeleted", deletedFormField);
    }
  }
};
</script>
