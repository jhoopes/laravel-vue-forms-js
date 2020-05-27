<template>
    <div>
        <vue-form
            v-if="formConfigForm"
            :form-config="formConfigForm"
            :form-data="{}"
            :use-json-api="useJsonApi"
        ></vue-form>
    </div>
</template>
<script>
    export default {

        inject: {
            useJsonApi: {
                default: false,
            }
        },

        props: {
            id: {
                required: true
            }
        },

        created() {
            if(!this.formConfigForm) {
                this.$store.dispatch('form_admin/getFormConfigurationByName', { formConfigName: 'form_configuration_form'});
            }
        },

        computed: {
            formConfigForm() {
                return this.$store.getters["form_admin/getFormConfigByName"]('form_configuration_form');
            }
        }
    }
</script>
