import Model from "./../classes/model";
import {SetupContext, defineEmit, watch, computed} from "vue";
import {assignOnObject, getFieldValue} from "./../utilities/utils";
import {FormConfiguration} from "./../classes/models/formConfiguration";
import {FormField} from "./../classes/models/formField";
import {Form} from "./../classes/Form";
import Parser from "./../classes/jsonapi_parser";
import {
    HTTPMethods,
    IHTTPClientResponse,
    ISubmitFormElements, IVueFormData,
    SaveSuccessFunction
} from "./../types/index";
import debounce from "lodash/debounce";
import ApiError from "./../classes/ApiError";
import Collection from "./../classes/collection";

/** Prop Defaults **/

export const saveSuccess: SaveSuccessFunction = (
    record: Record<string, any> | Model,
    actionType: string,
    context: SetupContext,
    passThru: boolean = false,
    closeOnSave: boolean = false,
) => {

    if (passThru) {
        context.emit(actionType, record);
    } else {
        context.emit(actionType, record);
    }
    if (closeOnSave) {
        close(context)
    }
}

export const close = (context: SetupContext) => {
    context.emit('close-form');
}

export const cancelForm = (context: SetupContext) => {
    context.emit('cancel-form');
}

export const emitOrRunCustomAction = (action: Function | string, form: Form, context: SetupContext) => {

    if (typeof action === "function") {
        action(form);
    } else {
        context.emit('runAction', {
            action,
            form
        })
    }
}

export const updateFormValue = (form: Form, field: FormField, newValue: any) => {
    assignOnObject(form, field.value_field, newValue);
}

export const getSubmitHttpMethod = (form: Form): HTTPMethods => {
    if (form.id) {
        return HTTPMethods.PATCH;
    }

    return HTTPMethods.POST;
}

export const getSubmitData = (form: Form) => {
    var data: Record<string, any> = {};
    if (form.id) {
        data.entityId = form.id;
    }
    data.formConfigurationId = form.formConfig.id;
    data.data = form.getData();
    return data;
}

export const submitForm = async (
    form: Form,
    submitFormElements: ISubmitFormElements
) => {
    // If this form is a pass through form, run the save success for updated only to push data out of the form
    // object
    if (submitFormElements.passThru) {
        submitFormElements.saveSuccess(form.getData(),
            "updated",
            submitFormElements.context,
            submitFormElements.passThru,
            submitFormElements.closeOnSave
        );
        return;
    }

    let method = getSubmitHttpMethod(form);
    let data = getSubmitData(form);
    // TODO
    // this.saving = true;

    let options: Record<string, any> = {};
    if (submitFormElements.useJsonApi) {
        options.headers = {
            Accept: "application/vnd.api+json"
        };
    }


    let response: IHTTPClientResponse = await submitFormElements.apiClient[method](submitFormElements.formSubmitUrl, data, options);
    var record: Record<string, any> | undefined;
    if (submitFormElements.useJsonApi) {
        record = Parser.parseJSONAPIResponse(response.data);
    }else {
        record = response.data
    }

    if (method === "post" && typeof record !== "undefined") {
        // we're creating so set the response id onto the form object
        form.data.id = record.id;
        form.id = record.id;
    }

    if(typeof record !== "undefined") {
        var actionType = "updated";
        if (method === "post") {
            actionType = "created";
        }

        submitFormElements.saveSuccess(
            record,
            "updated",
            submitFormElements.context,
            submitFormElements.passThru,
            submitFormElements.closeOnSave);
    }
}



/** Vue Form Component Setup **/


export const defaultFields = (data: Record<string, any>, formConfig: FormConfiguration) => {
    formConfig.fields.forEach(field => {
        if (
            typeof getFieldValue(data, field) === "undefined" ||
            getFieldValue(data, field) === ""
        ) {
            assignOnObject(data, field.value_field, null);
            if (
                field.field_extra !== null &&
                typeof field.field_extra.default !== "undefined"
            ) {
                assignOnObject(data, field.value_field, field.field_extra.default);
            }
        }
    });

    return data;
}

export const setupComputed = (formObj: Form) => {
    let topFields = computed(() => {
        let topLevelFields:Collection<FormField> = formObj.formConfig.fields.filter((field: FormField) => {
            if (field.parent_id) {
                return false;
            }
            return true;
        });

        topLevelFields.forEach(topLevelField => {
            topLevelField.children = formObj.formConfig.fields.filter((field: FormField) => {
                return field.parent_id === topLevelField.id;
            }).getModels();
        });

        return topLevelFields;
    });

    let layoutType = computed(() => {
        let tabField = topFields.value.find((field: FormField) => {
            if (field.widget === "tab") {
                return true;
            }
            return false;
        });

        if (tabField) {
            return "tabs";
        }

        return "normal";
    });

    let columnCount = computed(() => {
        var columnCount = 0;
        topFields.value.forEach(field => {
            if (field.widget === "column") {
                columnCount++;
            }
        });

        if (columnCount === 0) {
            columnCount = 1;
        }

        return columnCount;
    });

    let columnWidth = computed(() => {
        if (columnCount.value === 0) {
            return null;
        }

        return "w-1/" + columnCount.value;
    });

    return {
        topFields,
        layoutType,
        columnCount,
        columnWidth
    }
}


export const setupWatchers = (vueFormData: IVueFormData, submitFormFunc: Function, props: Record<string, any>, context: SetupContext) => {

    let formDataWatcher: Function;
    const setupAutoSave = () => {
        formDataWatcher = watch(
            () => vueFormData.form.data,
            debounce(function() {
                submitFormFunc();
            }, props.autoSaveTimeout),
            { deep: true }
        );
    }
    if(props.autoSave) {
        setupAutoSave()
    }

    watch(
        () => vueFormData.form.data,
        (data, prevData) => {
            context.emit('changed', data);
        }
    )

    watch(
        () => props.formData,
        (newFormData) => {
            newFormData = JSON.parse(JSON.stringify(newFormData));

            if (formDataWatcher) {
                formDataWatcher();
            }

            vueFormData.form.updateData(newFormData);

            if (props.autoSave) {
                setupAutoSave();
            }
        },
        { deep: true }
    )

    watch(
        () => props.formErrors,
        (newFormErrors) => {
            if (newFormErrors && newFormErrors.fieldErrors) {
                vueFormData.form.errors.report(newFormErrors as ApiError);
            }
        },
        { deep: true}
    )

    watch(
        () => props.forceUpdate,
        (force) => {
            if (force) {
                var newFormData = JSON.parse(JSON.stringify(props.formData));

                if (formDataWatcher) {
                    formDataWatcher();
                }

                vueFormData.form.clearFields()
                vueFormData.form.updateData(newFormData, true);

                if (props.autoSave) {
                    setupAutoSave();
                }
            }

            context.emit("update:forceUpdate", false);
        }
    )


    watch(
        () => props.disabled,
        (disabled) => {
            vueFormData.form.disabled = disabled
        }
    )

    watch(
        () => props.isSaving,
        (newIsSaving) => {
            if(newIsSaving) {
                vueFormData.saving = true;
                return;
            }
            vueFormData.saving = false
        }
    )

}
