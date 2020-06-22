<template>
    <div>
        <vue-form
            v-if="formConfigForm && formConfigFormData"
            :form-config="formConfigForm"
            :form-data="formConfigFormData"
            :use-json-api="useJsonApi"
            @created="commitAndGo"
            :force-update.sync="forceUpdate"
        ></vue-form>

        <div class="my-12 border-2 rounded min-h-screen p-4" v-if="id && formConfigFields && formFieldForm">

            <h2 class="text-2xl font-semibold">Form Fields</h2>

            <draggable v-model="formConfigFields" draggable=".form-field" handle=".handle">
                <component
                    v-for="field in formConfigFields"
                    :key="field.id"
                    class="form-field"
                    is="form-configuration-form-field"
                    :field="field"
                    :form-configuration-id="formConfigFormData.id"
                ></component>
                <button slot="footer" @click="addNewField">Add</button>
            </draggable>

        </div>
    </div>
</template>
<script>
    import draggable from 'vuedraggable';
    import FormConfigurationFormField from "../FormConfigurationFormField";
    import FormConfiguration from "../../classes/models/formConfiguration";
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

        components: {
            draggable,
            FormConfigurationFormField
        },


        beforeRouteEnter (to, from, next) {
            next(vm => {
                if(vm.formConfigFormData) {
                    vm.$nextTick(() => {
                        vm.forceUpdate = true;
                    })
                }
            })
        },
        beforeRouteUpdate (to, from, next) {
            if(this.formConfigFormData) {
                this.$nextTick(() => {
                    this.forceUpdate = true;
                })
            }
            next()
        },

        data() {
            return {
                forceUpdate: false
            }
        },

        created() {
            if(!this.formConfigForm) {
                this.$store.dispatch('form_admin/getFormConfigurationByName', { formConfigName: 'form_configuration_form'});
            }

            if(!this.formFieldForm) {
                this.$store.dispatch('form_admin/getFormConfigurationByName', { formConfigName: 'form_field_form'});
            }

            if(!this.formConfigFormData && parseInt(this.id)) {
                this.$store.dispatch('form_admin/getFormConfigurationById', {formConfigId: this.id, include: ['fields']});
            }
        },

        computed: {
            formConfigForm() {
                return this.$store.getters["form_admin/getFormConfigByName"]('form_configuration_form');
            },
            formFieldForm() {
                return this.$store.getters["form_admin/getFormConfigByName"]('form_field_form');
            },
            formConfigFormData() {

                if(!this.id) {
                    return new FormConfiguration({
                        entity_name: 'form_configuration'
                    });
                }

                return this.$store.getters['form_admin/getFormConfigById'](this.id);
            },
            formConfigFields: {
                get() {
                    if(!this.formConfigFormData || !this.formConfigFormData.fields) {
                        return [];
                    }

                    if(Array.isArray(this.formConfigFormData.fields)) {
                        // already have an array
                        return this.formConfigFormData.fields;
                    }

                    // otherwise assume the fields are an instance of collection
                    return this.formConfigFormData.fields.getModels();
                },
                set(newOrder) {
                    console.log(newOrder)
                }
            }
        },


        methods: {
            commitAndGo(newFormConfiguration) {
                this.$store.commit('form_admin/setOrUpdateFormConfiguration', newFormConfiguration);
                this.$router.push({name: 'formAdmin.form_configurations.edit', params: {id: newFormConfiguration.id }})
            },
            addNewField(){
                this.$store.commit('form_admin/addNewFieldToFormConfig', this.formConfigFormData.id);
            }
        }
    }
</script>
