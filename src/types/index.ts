/* eslint-disable */

import Model from "./../classes/model";
import { ComputedRef, SetupContext } from "vue";
import { Form } from "./../classes/Form";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import Collection from "./../classes/collection";
import { FormField } from "./../classes/models/formField";

export interface ITypedCollection<T extends Model> {
    models: Array<T>;
}

export interface ILengthAwarePaginator<T> {
    current_page: number;
    data: T[];
    from: number;
    to: number;
    per_page: number;
    last_page: number;
    total: number;
}

export interface IModel extends Model {
    id: number;
}

export interface IPaginationPage {
    number: number | null
}

export interface IHTTPClientResponse {
    data?: IJSONAPIResponse | Record<string, any>;
    response: Response;
}

export interface IJSONAPIResponse {
    data?: IJSONAPIResource | IJSONAPIResource[];
    errors?: any;
    meta?: Record<string, any>;
    included?: IJSONAPIResource[];
}

export interface IJSONAPIResource {
    type: string;
    id: string;
    attributes: Record<string, any>;
    relationships?: Record<string, IJSONAPIRelationship>;
}

export interface IJSONAPIRelationship {
    links: Record<string, string>;
    data: IJSONAPIRelationshipResource | IJSONAPIRelationshipResource[];
}

export interface IJSONAPIRelationshipResource {
    type: string;
    id: string;
}

export interface IHTTPClientBody {
    searchParams?: Record<string, string | number | boolean>;
    requestBody?: Record<string, any> | FormData;
}

export interface ILengthAwarePaginatedResponse<T> {
    data: T[];
    current_page: number;
    from: number;
    to: number;
    per_page: number;
    last_page: number;
    total: number;
}

export enum HTTPWebProtocol {
    HTTP = "http:",
    HTTPS = "https:",
}

export interface IApiClient {
    urlBase: string;
    fetch: typeof fetch;
    protocol: HTTPWebProtocol;
    defaultHeaders: Record<string, string>;
    withCredentials: boolean;

    header(header: string, value: string): void;

    get(
        path: string,
        body?: IHTTPClientBody,
        headers?: Record<string, string>,
        config?: RequestInit
    ): Promise<IHTTPClientResponse>;

    post(
        path: string,
        body: IHTTPClientBody,
        headers?: Record<string, string>,
        config?: RequestInit
    ): Promise<IHTTPClientResponse>;

    put(
        path: string,
        body: IHTTPClientBody,
        headers?: Record<string, string>,
        config?: RequestInit
    ): Promise<IHTTPClientResponse>;

    patch(
        path: string,
        body: IHTTPClientBody,
        headers?: Record<string, string>,
        config?: RequestInit
    ): Promise<IHTTPClientResponse>;

    delete(
        path: string,
        body?: IHTTPClientBody,
        headers?: Record<string, string>,
        config?: RequestInit
    ): Promise<IHTTPClientResponse>;
}

export type SaveSuccessFunction = {
    (
        record: Record<string, any> | Model,
        actionType: string,
        context: SetupContext,
        passThru: boolean,
        closeOnSave: boolean
    ): void;
};

export interface IStore {
    addModule(key: string, module: object): void;
    getModule(key: string): object;
}

export interface ISubmitFormElements {
    passThru: boolean;
    saveSuccess: SaveSuccessFunction;
    useJsonApi: boolean;
    apiClient: IApiClient;
    formSubmitUrl: string;
    formSubmitMethod?: string
    context: SetupContext;
    closeOnSave: boolean;
}

export interface ISubmitFormFunction {
    (): void
}

export interface ICustomActionFunction {
    (form: Form): void
}


export enum HTTPMethods {
    GET = "get",
    POST = "post",
    PATCH = "patch",
    PUT = "put",
    DELETE = "delete",
}

export interface IVueFormData {
    form: Form;
    formDataWatcher?: Function;
    saving: boolean;
    spinnerIcon: IconDefinition;
    warningIcon: IconDefinition;
    infoIcon: IconDefinition;
    topFields: ComputedRef<Collection<FormField>>;
    layoutType: ComputedRef<"tabs" | "normal">;
    columnCount: ComputedRef<number>;
    columnWidth: ComputedRef<string | null>;
}

/**
 * Form Field Config Interface
 * Interface's "options" key should be used for additional config items, as needed
 */
export interface IFormFieldFieldConfig {
    fieldName: string;
    label?: string;
    valueField: string;
    disabled: boolean;
    fieldExtra: Record<string, any>;
    options: Record<string, any>;
    default?: any;
}

export interface IFormFieldExtraCondition {
    fieldValue: string;
    valueField: string;
}

export interface IFormFieldExtra {
    default?: string;
    required?: boolean;
    condition?: IFormFieldExtraCondition;
    options_config: Record<string, any>;
    validation_rules: string[];
}

export interface IFormField {
    name: string;
    value_field: string;
    label: string;
    widget: string;
    visible: boolean;
    disabled: boolean;
    is_eav: boolean;
    parent_id: number | null;
    cast_to: string | null;
    field_extra: IFormFieldExtra;
}
