import VueStore from "vue-class-store";
import { LVFStore } from "./LVFStore";
import Collection from "./../classes/collection";
import { FormConfiguration } from "./../classes/models/formConfiguration";
import config from "./../classes/configuration";
import Parser from "./../classes/jsonapi_parser";
import { reactive } from "vue";
import { FormField } from "./../classes/models/formField";
import { IJSONAPIResponse } from "./../types";
import Generic from "./../classes/models/generic";

@VueStore
export class FormConfigurationStore extends LVFStore {
  public loadingFormConfig = false;
  public formConfigurations = new Collection<FormConfiguration>([], {
    model: FormConfiguration,
  });

  public formConfigFieldOrder: Record<number, Record<string, any>[]> = [];
  public formFieldWidgetTypes: Collection<Generic> = new Collection([], {
    model: Generic,
  });

  public standardValidationRules: Collection<Generic> = new Collection([], {
    model: Generic,
  });

  public getFormConfigurationByName(
    formConfigName?: string,
    formConfigType?: string,
    include?: string[]
  ) {
    const params: Record<string, any> = {};
    if (formConfigName) {
      params.formConfigName = formConfigName;
    }

    if (formConfigType) {
      params.formConfigType = formConfigType;
    }

    if (include && Array.isArray(include)) {
      params.include = include;
    }

    return this.getFormConfigRequest(params);
  }

  public async getFormConfigurationById(
    formConfigId: number,
    include?: string[]
  ): Promise<FormConfiguration> {
    const formConfig = this.formConfigurations.find({ id: formConfigId });

    if (formConfig) {
      // already loaded
      return formConfig;
    }

    const params: Record<string, any> = {};
    if (include && Array.isArray(include)) {
      params.include = include;
    }

    return await this.getFormConfigRequest(params, formConfigId);
  }

  public async getFormConfigRequest(
    params: Record<string, any>,
    formConfigId?: number
  ): Promise<FormConfiguration> {
    let formConfig: FormConfiguration | undefined;

    let url = config.apiPrefix + "/configuration";
    if (formConfigId) {
      url += "/" + formConfigId;
    }

    const response = await this.apiClient.get(url, {
      searchParams: params,
    });

    if (this.useJsonApi) {
      formConfig = Parser.parseJSONAPIResponse<FormConfiguration>(
        response.data as IJSONAPIResponse
      ) as FormConfiguration;
    } else {
      formConfig = new FormConfiguration(response.data as Record<string, any>);
    }

    this.addFormConfigToLoadedForms(formConfig);

    return formConfig;
  }

  public addFormConfigToLoadedForms(formConfig: FormConfiguration) {
    this.formConfigurations.add(formConfig);
  }

  public updateFormConfigurationModel(
    formConfig: Record<string, any> | FormConfiguration
  ) {
    let formConfigAttributes = formConfig;
    if (formConfig instanceof FormConfiguration) {
      formConfigAttributes = formConfig.toJSON();
    }

    const currentFormConfiguration = this.formConfigurations
      .getModels()
      .find((fConfig: FormConfiguration) => {
        return fConfig._attributes.id === formConfigAttributes.id;
      });

    if (!currentFormConfiguration) {
      throw Error(
        "Unable to update form configuration, no valid configuration found"
      );
    }

    currentFormConfiguration.assign(formConfigAttributes);
  }

  public async getFormFieldWidgetTypes() {
    const widgetTypesResponse = await this.apiClient.get(
      config.adminApiPrefix + "/widget_types"
    );

    if (this.useJsonApi) {
      this.formFieldWidgetTypes = Parser.parseJSONAPIResponse(
        widgetTypesResponse.data as IJSONAPIResponse
      ) as Collection<Generic>;
    } else {
      this.formFieldWidgetTypes = new Collection<Generic>(
        widgetTypesResponse.data as Record<string, any>[],
        {
          model: Generic,
        }
      );
    }
  }

  public async getStandardValidationRules() {
    const standardValidationRulesResponse = await this.apiClient.get(
      config.adminApiPrefix + "/validation_rules"
    );

    if (this.useJsonApi) {
      this.standardValidationRules = Parser.parseJSONAPIResponse(
        standardValidationRulesResponse.data as IJSONAPIResponse
      ) as Collection<Generic>;
    } else {
      this.standardValidationRules = new Collection<Generic>(
        standardValidationRulesResponse.data as Record<string, any>[],
        {
          model: Generic,
        }
      );
    }

    this.standardValidationRules.add({
      name: "Other",
      value: "other",
    });
  }

  public setFormConfigFieldOrderForFormId(
    formConfigId: number
  ): Record<string, any>[] {
    const formConfig = this.formConfigurations
      .filter({ id: formConfigId })
      .first();

    if (!formConfig || !formConfig.fields) {
      return [];
    }

    this.formConfigFieldOrder[formConfigId] = [];
    const fieldArray = this.getFieldArrayFromFields(formConfig.fields);

    // push all root fields first to ensure they are present for parsing children
    fieldArray
      .filter((field) => {
        return !field.parent_id;
      })
      .forEach((field) => {
        const item: Record<string, any> = reactive({});
        item.id = field.id;
        item.children = [];
        this.getStructuredChildrenIds(field, fieldArray, item);
        this.formConfigFieldOrder[formConfigId].push(item);
      });

    return this.formConfigFieldOrder[formConfigId];
  }

  public getFieldArrayFromFields(
    fields: FormField[] | Collection<FormField>
  ): FormField[] {
    let fieldArray = [];
    if (Array.isArray(fields)) {
      fieldArray = fields;
    } else if (typeof fields.getModels === "function") {
      fieldArray = fields.getModels();
    } else {
      return [];
    }

    return fieldArray;
  }

  public sortFields(fields: FormField[]) {
    // sort children
    return fields.sort((f1, f2) => {
      if (!f1.order || !f2.order) {
        return 0;
      }

      if (f1.order < f2.order) {
        return -1;
      }
      if (f1.order > f2.order) {
        return 1;
      }

      return 0;
    });
  }

  public getFlattenedChildrenIds(
    field: FormField,
    fieldArray: FormField[]
  ): number[] {
    const children = fieldArray.filter((f) => f.parent_id == field.id);

    const childItems: number[] = [];
    children.forEach((child) => {
      childItems.push(child.id);
      childItems.concat(this.getFlattenedChildrenIds(child, fieldArray));
    });

    return childItems;
  }

  public getStructuredChildrenIds(
    field: Record<string, any>,
    fieldArray: FormField[],
    parent: Record<string, any>
  ) {
    let children = fieldArray.filter((f: FormField) => f.parent_id == field.id);

    children = this.sortFields(children);
    children.forEach((child: Record<string, any>) => {
      const item: Record<string, any> = reactive({});
      item.id = child.id;
      item.children = [];
      this.getStructuredChildrenIds(child, fieldArray, item);
      parent.children.push(item);
    });
  }

  public getFormFieldFromId(formConfigId: number, fieldId: number) {
    const formConfig = this.formConfigurations
      .filter({ id: formConfigId })
      .first();

    if (!formConfig) {
      throw Error("invalid form configuration Id");
    }

    return formConfig.fields.filter({ id: fieldId }).first();
  }

  public addNewFieldToFormConfig(
    formConfigId: number,
    widgetType: string
  ): FormField {
    const formConfiguration = this.formConfigurations
      .filter({ id: formConfigId })
      .first();

    if (!formConfiguration) {
      throw new Error("Invalid form configuration id: " + formConfigId);
    }

    const formField = new FormField({ widget: widgetType });
    formConfiguration.fields.add(formField);

    return formField;
  }

  public async addExistingFieldToFormConfig(
    formConfigId: number,
    fieldId: number
  ): Promise<FormField> {
    const response = await this.apiClient.post(
      config.adminApiPrefix +
        "/form_configurations/" +
        formConfigId +
        "/form_fields",
      {
        requestBody: {
          existingFieldId: fieldId,
        },
      }
    );
    let formField: FormField;
    if (this.useJsonApi) {
      formField = Parser.parseJSONAPIResponse<FormField>(
        response.data as IJSONAPIResponse
      ) as FormField;
    } else {
      formField = new FormField(response.data as Record<string, any>);
    }

    const formConfiguration = this.formConfigurations
      .filter({ id: formConfigId })
      .first();

    if (!formConfiguration) {
      throw new Error("Invalid form configuration id: " + formConfigId);
    }

    formConfiguration.fields.add(formField);

    return formField;
  }

  public updateFormFieldOnFormConfig(
    formConfigurationId: number,
    fieldId: number,
    formField: FormField
  ) {
    const formConfiguration = this.formConfigurations
      .filter({ id: formConfigurationId })
      .first();

    if (!formConfiguration) {
      throw new Error("Invalid form configuration id: " + formConfigurationId);
    }

    const existingField = formConfiguration.fields.find({ id: fieldId });
    if (existingField) {
      existingField.assign(formField);
    } else {
      formConfiguration.fields.add(formField);
    }
  }

  public async deleteFieldPermanently(formConfigId: number, fieldId: number) {
    await this.apiClient.delete(
      config.adminApiPrefix + "/form_fields/" + fieldId
    );

    this.removeFieldFromConfig(formConfigId, fieldId);

    console.log(fieldId);
  }

  public async removeFieldFromForm(formConfigId: number, fieldId: number) {
    await this.apiClient.delete(
      config.adminApiPrefix +
        "/form_configurations/" +
        formConfigId +
        "/form_fields/" +
        fieldId
    );

    this.removeFieldFromConfig(formConfigId, fieldId);
  }

  public removeFieldFromConfig(formConfigId: number, fieldId: number) {
    const formConfiguration = this.formConfigurations
      .filter({ id: formConfigId })
      .first();

    if (!formConfiguration) {
      throw new Error("Invalid form configuration id: " + formConfigId);
    }

    formConfiguration.fields.remove(fieldId);
  }

  public async updateFormConfigFieldOrder(
    formConfigId: number,
    formConfigurationFieldOrder: Record<string, any>
  ) {
    const updatedFieldsResponse = await this.apiClient.patch(
      config.adminApiPrefix +
        "/form_configurations/" +
        formConfigId +
        "/form_fields/order",
      {
        requestBody: {
          formConfigurationFieldOrder,
        },
      }
    );

    let updatedFields: Collection<FormField>;
    if (this.useJsonApi) {
      updatedFields = Parser.parseJSONAPIResponse<FormField>(
        updatedFieldsResponse.data as IJSONAPIResponse
      ) as Collection<FormField>;
    } else {
      updatedFields = new Collection<FormField>(
        updatedFieldsResponse.data as Record<string, any>[],
        {
          model: FormField,
        }
      );
    }

    const formConfiguration = this.formConfigurations
      .filter({ id: formConfigId })
      .first();

    if (!formConfiguration) {
      throw new Error("Invalid form configuration id: " + formConfigId);
    }

    updatedFields.getModels().forEach((updatedField: FormField) => {
      /** @ts-ignore **/ // for some reason ts doesn't see the check for form configuration being empty
      const currentField = formConfiguration.fields
        .filter({ id: updatedField.id })
        .first();

      if (!currentField) {
        return;
      }

      currentField.assign(updatedField);
    });
  }

  public getDefaultFormConfiguration(): FormConfiguration {
    return new FormConfiguration({});
  }
}
