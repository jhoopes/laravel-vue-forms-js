import { FormErrors } from "./FormErrors";
import { assignOnObject, byString } from "./../utilities/utils";
import { FormConfiguration } from "./models/formConfiguration";
import { FormField } from "./models/formField";
import { reactive } from "vue";
import { IApiClient } from "./../types";
import { Collection } from "./collection";

export class Form {
  public data: Record<string, any>;
  public initialData: Record<string, any>;
  public fields: FormField[];
  public disabled: boolean;
  public formFieldOptions: Record<string, any>;
  public id: number | null;
  public formConfig: FormConfiguration;
  public errors: FormErrors;
  public fieldMeetsConditions: Record<string, boolean>;

  public useJsonApi: boolean;
  public apiClient: IApiClient;

  constructor(
    data: Record<string, any>,
    config: FormConfiguration,
    useJsonApi: boolean,
    apiClient: IApiClient,
    disabled?: boolean
  ) {
    this.initialData = reactive(data);
    this.fields = reactive([]);
    /** @ts-ignore **/
    this.disabled = false;
    this.formFieldOptions = reactive({});
    this.data = reactive({});
    this.fieldMeetsConditions = reactive({});
    this.useJsonApi = useJsonApi;
    this.apiClient = apiClient;

    config.fields.forEach((field) => {
      this.fields.push(field);

      if (!field.value_field) {
        return;
      }

      if (field.widget === "files" && typeof data.files !== "undefined") {
        if (data.files && data.files instanceof Collection) {
          assignOnObject(
            this.data,
            field.value_field,
            data.files
              .filter({
                meta_type: field.value_field,
              })
              .getModels()
          );
        } else if (data.files && Array.isArray(data.files)) {
          assignOnObject(
            this.data,
            field.value_field,
            data.files.filter((file: Record<string, any>) => {
              return file.meta_type === field.value_field;
            })
          );
        } else {
          assignOnObject(this.data, field.value_field, []);
        }
      } else {
        const value = byString(data, field.value_field);
        if (typeof value !== "undefined" && value !== null) {
          assignOnObject(this.data, field.value_field, value);
        } else {
          assignOnObject(this.data, field.value_field, null);
        }
      }
    });

    if (data.id) {
      this.id = data.id;
    } else {
      this.id = null;
    }

    if (disabled) {
      this.disabled = true;
    }

    this.formConfig = config;
    /** @ts-ignore **/
    this.errors = reactive(new FormErrors());
  }

  /** Get the data for the form based on initial data fields **/
  getData(): Record<string, any> {
    const data = {} as Record<string, any>;

    if (this.initialData.id) {
      data.id = this.initialData.id;
    }

    this.fields.forEach((field) => {
      if (!field.value_field) {
        return;
      }

      let value: any;
      if (field.widget === "files") {
        const potentialFiles = byString(this.data, field.value_field);
        value = [];
        if (Array.isArray(potentialFiles)) {
          value = potentialFiles.filter((file: Record<string, any>) => {
            return file.temporary;
          });
        }
      } else {
        value = byString(this.data, field.value_field);
      }

      assignOnObject(data, field.value_field, value);
    });

    return data;
  }

  /** Set the updated data for the form **/
  updateData(newFormData: Record<string, any>, force?: boolean) {
    if (typeof force !== "boolean") {
      force = false;
    }

    this.formConfig.fields.forEach((formField) => {
      if (!formField.value_field) {
        return;
      }

      const newFormDataValue = byString(newFormData, formField.value_field);
      if (!newFormDataValue) {
        return;
      }

      if (!force) {
        const initialDataValue = byString(
          this.initialData,
          formField.value_field
        );
        const currentDataValue = byString(this.data, formField.value_field);

        if (initialDataValue == currentDataValue) {
          assignOnObject(this.data, formField.value_field, newFormDataValue);
          assignOnObject(
            this.initialData,
            formField.value_field,
            newFormDataValue
          );
        }
      } else if (force) {
        assignOnObject(this.data, formField.value_field, newFormDataValue);
        assignOnObject(
          this.initialData,
          formField.value_field,
          newFormDataValue
        );
      }
    });

    if (this.id === null && newFormData.id) {
      this.id = newFormData.id;
      this.data.id = newFormData.id;
    }
  }

  /** Reset the form to the initial data **/
  reset() {
    this.formConfig.fields.forEach((field) => {
      this.data[field.value_field] = this.initialData[field.value_field];
    });
  }

  clearFields() {
    this.formConfig.fields.forEach((field) => {
      this.data[field.value_field] = null;
    });
  }

  // pulling more functionality into form class, maybe separate some out to different sub-like classes like errors
  // but for now, keeping it here.

  getFieldValue(field: FormField | string) {
    if (field instanceof FormField) {
      return this.data[field.value_field];
    }

    return this.data[field];
  }

  updateFormValue(field: FormField | string, newValue: any) {
    if (field instanceof FormField) {
      this.data[field.value_field] = newValue;
      return;
    }

    this.data[field] = newValue;
  }

  updateValueAndConditionals(newVal: any, field: FormField | string) {
    this.updateFormValue(field, newVal);
    this.generateConditionValues();
  }

  updateOptionsForField(newOptions: Record<string, any>[], field: FormField) {
    assignOnObject(this.formFieldOptions, field.value_field, newOptions);
    this.generateConditionValues();
  }

  generateConditionValues() {
    this.formConfig.fields.forEach((field) => {
      this.meetsConditions(field);
    });
  }

  meetsConditions(field: FormField) {
    const fieldExtra = this.getFormFieldFieldExtra(field);

    if (
      fieldExtra.condition &&
      fieldExtra.condition.valueField &&
      fieldExtra.condition.fieldValue
    ) {
      const conditionFieldCollection = this.formConfig.fields.filter(
        (f: FormField) => {
          return f.value_field === fieldExtra.condition.valueField;
        }
      );

      const conditionField = conditionFieldCollection.first();
      let conditionFieldFieldExtra: Record<string, any> = {};
      if (conditionField !== null) {
        conditionFieldFieldExtra = this.getFormFieldFieldExtra(conditionField);
      } else {
        // if the valueField from the condition was not found set the view to be false
        this.fieldMeetsConditions[field.name] = false;
        console.log(
          "Invalid condition field. [ " +
            field.name +
            " ] Is your configuration correct?"
        );
        return;
      }

      if (this.getConditionOptions(fieldExtra.condition.valueField)) {
        // Default option label field to name, as this is the default from FormSelect
        if (!conditionFieldFieldExtra.options_config.optionLabelField) {
          conditionFieldFieldExtra.options_config.optionLabelField = "name";
        }

        // Default the option value field to id, as this is the default from FormSelect
        if (!conditionFieldFieldExtra.options_config.optionValueField) {
          conditionFieldFieldExtra.options_config.optionValueField = "id";
        }

        const validConditionOptions = this.getConditionOptions(
          fieldExtra.condition.valueField
        ).filter((option: Record<string, any>) => {
          if (Array.isArray(fieldExtra.condition.fieldValue)) {
            let hasOption = false;
            fieldExtra.condition.fieldValue.forEach(
              (conditionFValue: string) => {
                if (
                  conditionFValue.includes(
                    option[
                      conditionFieldFieldExtra.options_config.optionLabelField
                    ]
                  )
                ) {
                  hasOption = true;
                }
              }
            );

            return hasOption;
          } else {
            return fieldExtra.condition.fieldValue.includes(
              option[conditionFieldFieldExtra.options_config.optionLabelField]
            );
          }
        });

        let value = byString(this.data, conditionField.value_field);
        if (!isNaN(value)) {
          value = Number(value);
        }

        const conditionValueOption = validConditionOptions.find(
          (conditionOption) => {
            return (
              conditionOption[
                conditionFieldFieldExtra.options_config.optionValueField
              ] === value
            );
          }
        );

        if (validConditionOptions && conditionValueOption) {
          this.fieldMeetsConditions[field.name] = true;
        } else {
          this.fieldMeetsConditions[field.name] = false;
        }
      } else if (
        byString(this.data, conditionField.value_field) ===
        fieldExtra.condition.fieldValue
      ) {
        this.fieldMeetsConditions[field.name] = true;
      } else {
        this.fieldMeetsConditions[field.name] = false;
      }
    } else {
      this.fieldMeetsConditions[field.name] = true;
    }
  }

  getFormFieldFieldExtra(field: FormField) {
    let fieldExtra = field.field_extra;
    if (!fieldExtra) {
      fieldExtra = {};
    }
    return fieldExtra;
  }

  setFormFieldOptions(valueField: string, options: Record<string, any>[]) {
    this.formFieldOptions[valueField] = options;
    this.generateConditionValues();
  }

  getConditionOptions(valueField: string): Record<string, any>[] {
    return byString(this.formFieldOptions, valueField);
  }
}
