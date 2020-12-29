<template>
  <div class=" border-2 w-full rounded">
    <div class="flex items-center p-2 shadow-md" @click="showForm = !showForm">
      <font-awesome-icon
        icon="arrows-alt"
        class="handle cursor-pointer"
        size="lg"
      ></font-awesome-icon>
      <div
        class="cursor-pointer ml-2 md:ml-8 flex justify-between items-center w-full"
      >
        <div class="flex justify-around">
          <div class="mx-2">
            <font-awesome-icon
              icon="chevron-down"
              v-if="showForm"
              size="lg"
            ></font-awesome-icon>
            <font-awesome-icon
              icon="chevron-right"
              size="lg"
              v-else
            ></font-awesome-icon>
          </div>

          <span v-if="isStructural" class="px-1 text-white text-sm bg-blue-300"
            >Structural</span
          >
          <span v-if="isNew" class="px-1 text-white text-sm bg-blue-300"
            >New</span
          >
        </div>
        <div>{{ field.name }}&nbsp;</div>
        <div>
          <button class="mx-4 md:mx-2" @click.stop="showForm = true">
            <font-awesome-icon icon="edit" size="lg"></font-awesome-icon>
          </button>
          <button @click.stop="showConfirmDelete = true">
            <font-awesome-icon icon="times" size="lg"></font-awesome-icon>
          </button>
        </div>
      </div>
    </div>
    <transition name="slide">
      <div class="shadow-inner w-full p-4" v-if="showForm">
        <vue-form
          :form-config="formFieldForm"
          :form-data="field"
          :use-json-api="useJsonApi"
          :form-submit-url="formUrl"
          @cancel-form="showForm = false"
          :api-client="$apiClient"
          @created="formFieldCreated"
          @updated="updateFormField"
        ></vue-form>
      </div>
    </transition>
    <lvf-modal v-if="showConfirmDelete" @close="showConfirmDelete = false">
      <h2 slot="header">Delete or Dissociate?</h2>
      <div slot="body">
        <p class="mb-8">
          This will remove only this field. Nested children will 'move up' one
          level to the parent's item, if applicable.
        </p>
        <div class="flex justify-around">
          <button class="button" @click="() => deleteField(true)">
            Delete Permanently
          </button>
          <button class="button" @click="() => deleteField(false)">
            Remove from Form
          </button>
        </div>
      </div>
    </lvf-modal>
  </div>
</template>
<script>
import { config } from "@/admin/classes/configuration";

export default {
  inject: {
    useJsonApi: {
      default: false
    }
  },

  props: {
    fieldId: {},
    formConfigurationId: {
      required: true,
      type: Number
    }
  },

  data() {
    return {
      showForm: false,
      showConfirmDelete: false
    };
  },

  mounted() {
    if (!this.field.id) {
      this.showForm = true;
      this.$el.scrollIntoView({ behavior: "smooth" });
    }
  },

  computed: {
    field() {
      return this.$store.getters["form_admin/getFormFieldFromId"](
        this.formConfigurationId,
        this.fieldId
      );
    },
    formUrl() {
      return (
        config.adminApiPrefix +
        "/form_configurations/" +
        this.formConfigurationId +
        "/form_fields"
      );
    },
    formFieldForm() {
      return this.$store.getters["form_admin/getFormConfigByName"](
        "form_field_form"
      );
    },
    formFieldWidgetTypes() {
      return this.$store.getters["form_admin/formFieldWidgetTypes"];
    },
    isStructural() {
      if (!this.field) {
        return false;
      }

      let fieldWidgetType = this.formFieldWidgetTypes.find(
        type => type.value === this.field.widget
      );
      if (!fieldWidgetType) {
        return false;
      }

      return Boolean(fieldWidgetType.structural);
    },
    isNew() {
      if (!this.field) {
        return false;
      }

      return !this.field.id;
    }
  },

  methods: {
    formFieldCreated(newFormField) {
      this.updateFormField(newFormField);
      this.$emit("formFieldCreated", newFormField);
    },
    updateFormField(formField) {
      this.$store.commit("form_admin/updateFormFieldOnFormConfig", {
        formConfigId: this.formConfigurationId,
        formFieldId: this.field.id,
        formField
      });
      this.showForm = false;
    },
    deleteField(permanently) {
      var promise;
      this.$emit("formFieldDeleted", this.fieldId);

      if (this.fieldId === null) {
        // new field
        this.$store.commit("form_admin/removeFieldFromForm", {
          formConfigurationId: this.formConfigurationId,
          formFieldId: this.fieldId
        });

        promise = Promise.resolve(true);
      } else if (permanently) {
        promise = this.$store.dispatch(
          "form_admin/deleteFieldPermanently",
          this.field.id
        );
      } else {
        promise = this.$store.dispatch("form_admin/removeFieldFromForm", {
          formConfigurationId: this.formConfigurationId,
          formFieldId: this.field.id
        });
      }

      promise.catch(error => {
        console.error(error);
      });
    }
  }
};
</script>
<style>
.slide-enter-active {
  -moz-transition-duration: 0.2s;
  -webkit-transition-duration: 0.2s;
  -o-transition-duration: 0.2s;
  transition-duration: 0.2s;
  -moz-transition-timing-function: ease-in;
  -webkit-transition-timing-function: ease-in;
  -o-transition-timing-function: ease-in;
  transition-timing-function: ease-in;
}

.slide-leave-active {
  -moz-transition-duration: 0.2s;
  -webkit-transition-duration: 0.2s;
  -o-transition-duration: 0.2s;
  transition-duration: 0.2s;
  -moz-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  -webkit-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  -o-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
}

.slide-enter-to,
.slide-leave {
  max-height: 100px;
  overflow: hidden;
}

.slide-enter,
.slide-leave-to {
  overflow: hidden;
  max-height: 0;
}
</style>
