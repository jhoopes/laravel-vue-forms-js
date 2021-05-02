<template>
    <div class="vue-form">
        <div class="text-right" v-if="showCloseIcon">
            <span class="close-icon fa fa-times" @click="close"></span>
        </div>
        <div v-if="form.errors.hasGeneralMessage()">
            <div
                class="m-4 p-4 flex items-center"
                :class="{
          'bg-red-300': form.errors.getGeneralMessageType() === 'error',
          'bg-blue-300': form.errors.getGeneralMessageType() === 'info'
        }"
            >
                <font-awesome-icon
                    :icon="warningIcon"
                    v-if="form.errors.getGeneralMessageType() === 'error'"
                ></font-awesome-icon>
                <font-awesome-icon
                    :icon="infoIcon"
                    v-if="form.errors.getGeneralMessageType() === 'info'"
                ></font-awesome-icon>
                <span class="mx-4">{{ form.errors.getGeneralMessage() }}</span>
            </div>
        </div>
        <form @submit.prevent="">
            <div v-if="layoutType === 'tabs'" class="form-tabs">
                <form-tabs>
                    <component
                        v-for="field in topFields"
                        :key="field.id"
                        :name="field.field_extra ? field.field_extra.name : field.name"
                        :is="getFormFieldComponent(field.widget)"
                        :field-name="field.name"
                        :disabled="disabled"
                        :auto-save="autoSave"
                        :actions="actions"
                        :saving="saving"
                        :show-saving="showSaving"
                        :saving-text="savingText"
                        @runAction="runAction"
                        v-show="field.visible && conditionValues[field.name]"
                        :children="field.children || null"
                        :class="columnWidth + ' ' + 'm-2'"
                    ></component>
                </form-tabs>
            </div>
            <div :class="{ flex: columnCount > 1 }" v-else>
                <component
                    v-for="field in topFields"
                    :key="field.id"
                    :is="getFormFieldComponent(field.widget)"
                    v-show="field.visible && form.fieldMeetsConditions[field.name]"
                    :field-name="field.name"
                    :modelValue="form.getFieldValue(field)"
                    @update:modelValue="newVal => form.updateValueAndConditionals(newVal, field)"
                    @options-updated="
            newOptions => form.updateOptionsForField(newOptions, field)
          "
                    :class="columnWidth + ' ' + 'm-2'"
                    :find-in-form="true"
                ></component>
            </div>
            <div
                class="controls-row"
                v-if="disabled === false && autoSave === false && layoutType !== 'tabs'"
            >
                <button
                    class="button"
                    v-for="action in actions"
                    :key="action.action"
                    @click.prevent="runAction(action.action)"
                    v-html="action.label"
                    :disabled="showSaving && saving"
                ></button>
                <span v-if="saving && showSaving"
                ><font-awesome-icon
                    :icon="spinnerIcon"
                    :spin="true"
                ></font-awesome-icon
                >{{ savingText }}</span
                >
            </div>
            <div
                class="controls-row"
                v-if="showSaving && saving && autoSave === true"
            >
                <font-awesome-icon :icon="spinnerIcon" :spin="true"></font-awesome-icon
                >{{ savingText }}
            </div>
        </form>
    </div>
</template>
<script lang="ts">

import {defineComponent, toRefs, ref, reactive, SetupContext, provide} from "vue";
import { Form } from "../classes/Form";
import FormText from "./FormComponents/FormText.vue";

import {
    faSpinner,
    faExclamationTriangle,
    faInfoCircle
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import apiClient from "./../classes/apiClient";
import {FormConfiguration} from "./../classes/models/formConfiguration";
import {
    defaultFields,
    submitForm,
    saveSuccess as saveSuccessDefault,
    setupComputed, setupWatchers, emitOrRunCustomAction, cancelForm
} from "./../composition/vueForm";
import {IApiClient, ISubmitFormElements, IVueFormData, SaveSuccessFunction} from "./../types";
import ApiError from "./../classes/ApiError";

export default defineComponent({
    name: "vue-form",

    components: {
        FormText,
        FontAwesomeIcon
    },



    setup(props, context: SetupContext) {


        let formData = defaultFields(props.formData, props.formConfig)
        let formObj = new Form(formData, props.formConfig)

        let {
            topFields,
            layoutType,
            columnCount,
            columnWidth
        } = setupComputed(formObj)

        let vueFormData = reactive({
            form: formObj,
            formDataWatcher: null,
            saving: false,
            spinnerIcon: faSpinner,
            warningIcon: faExclamationTriangle,
            infoIcon: faInfoCircle,
            topFields,
            layoutType,
            columnCount,
            columnWidth,
        }) as unknown as IVueFormData;


        const submitFormFunc = () => {
            vueFormData.saving = true;

            let saveSuccess: SaveSuccessFunction = props.saveSuccess as SaveSuccessFunction;
            if(!props.saveSuccess) {
                saveSuccess = saveSuccessDefault
            }
            try {
                submitForm(formObj, {
                    passThru: props.passThru,
                    saveSuccess,
                    useJsonApi: props.useJsonApi,
                    apiClient: props.apiClient as IApiClient,
                    formSubmitUrl: props.formSubmitUrl,
                    context,
                    closeOnSave: props.closeOnSave
                } as ISubmitFormElements)
                vueFormData.saving = false;
            }catch(err) {
                console.log(err);
                vueFormData.saving = false;
                props.errorHandler(err, formObj);
            }
        }



        provide('form', vueFormData.form);
        provide('apiClient', props.apiClient);
        provide('formHasJsonApi', props.useJsonApi);

        vueFormData.form.generateConditionValues();

        setupWatchers(vueFormData, submitFormFunc, props, context);


        const runAction = (action: string | Function) =>{

            if(typeof action === "string" && (action === "submitForm" || action === "cancelForm")) {
                switch(action) {
                    case "submitForm":
                        submitFormFunc();
                        break;
                    case "cancelForm":
                        cancelForm(context);
                        break;
                }
            }else {
                emitOrRunCustomAction(action, vueFormData.form, context);
            }
        }

        return {
            runAction,
            ...toRefs(vueFormData)
        };
    },





    props: {
        formConfig: {
            required: true,
            type: FormConfiguration
        },
        formData: {
            required: true,
            type: Object
        },
        formSubmitUrl: {
            type: String,
            default: "/api/forms/submit"
        },
        apiClient: {
            default: apiClient
        },
        saveSuccess: {
            type: Function,
        },
        errorHandler: {
            type: Function,
            default: (error: ApiError, form: Form) => {
                form.errors.report(error);
            }
        },
        formErrors: {
            type: Object,
            default: null
        },
        disabled: {
            type: Boolean,
            default: false
        },
        closeOnSave: {
            type: Boolean,
            default: false
        },
        showCloseIcon: {
            type: Boolean,
            default: false
        },
        passThru: {
            type: Boolean,
            default: false
        },
        autoSave: {
            type: Boolean,
            default: false
        },
        autoSaveTimeout: {
            type: Number,
            default: 4000
        },
        // ability to define custom actions, custom actions will emit the action if the function does not exist on the form
        actions: {
            type: Array,
            default: [
                {
                    name: "submit",
                    label: "Submit",
                    action: "submitForm"
                },
                {
                    name: "cancel",
                    label: "Cancel",
                    action: "cancelForm"
                }
            ]
        },
        // whether or not to show the saving functionality
        showSaving: {
            type: Boolean,
            default: true
        },
        // allows parent components to define if its saving
        isSaving: {
            type: Boolean,
            default: false
        },
        // text to show with the spinner if it's saving
        savingText: {
            type: String,
            default: "Saving..."
        },
        useJsonApi: {
            type: Boolean,
            default: false
        },
        forceUpdate: {
            type: Boolean,
            default: false
        }
    },



    methods: {
        getFormFieldComponent(fieldWidget: string) {
            switch (fieldWidget) {
                case "column":
                    return "form-column";
                case "tab":
                    return "form-tab";
                case "static":
                    return "form-static";
                case "text":
                    return "form-text";
                case "autocomplete":
                    return "form-autocomplete";
                case "textarea":
                    return "form-textarea";
                case "dropdown":
                    return "form-select";
                case "multidropdown":
                    return "form-multi-select";
                case "checkbox":
                    return "form-checkbox";
                case "radio":
                    return "form-radio";
                case "datepicker":
                    return "form-datepicker";
                case "timepicker":
                    return "form-timepicker";
                case "datetimepicker":
                    return "form-datetimepicker";
                case "files":
                    return "form-files";
                case "wysiwyg":
                    return "form-wysiwyg";
                case "code":
                    return "form-code";
                default:
                    return fieldWidget;
            }
        },





        // getFormFieldFieldExtra(field) {
        //   var fieldExtra = field.field_extra;
        //   if (!fieldExtra) {
        //     fieldExtra = {};
        //   }
        //   return fieldExtra;
        // },
        // updateValueAndConditionals(newVal, field) {
        //   this.updateFormValue(field, newVal);
        //   this.generateConditionValues();
        // },
        // getConditionOptions(valueField) {
        //   return byString(this.form.formFieldOptions, valueField);
        // },
        // updateOptionsForField(newOptions, field) {
        //   assignOnObject(this.form.formFieldOptions, field.value_field, newOptions);
        //   this.generateConditionValues();
        // }
    }

});
</script>
