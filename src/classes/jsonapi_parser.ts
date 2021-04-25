import {Collection} from "./collection";
import {
    IJSONAPIResponse,
    ITypedCollection,
    IJSONAPIResource,
    IJSONAPIRelationshipResource
} from "./../types/index";
import Model from "./model";
import Generic from "./models/generic";
import {FormConfiguration} from "./models/formConfiguration";
import {FormField} from "./models/formField";

export class Parser {
    public models: Record<string, typeof Model> = {
        generic: Generic,
        form_configuration: FormConfiguration,
        form_field: FormField
    };

    constructor(initialModels?: Record<string, typeof Model>) {
        if(initialModels) {
            Object.assign(this.models, initialModels);
        }
    }

    appendModels(type: string | Record<string, typeof Model>, model?: typeof Model): void | never {
        if(typeof type === "string" && !model) {
            throw new Error("Invalid argument set.  You must supply model if type is string");
        } else if(typeof type === "string" && typeof model !== "undefined") {
            this.models[type] = model;
        }

        Object.assign(this.models, type);
    }

    getModelForJSONAPIType(type: string): typeof Model {
        if(typeof this.models[type] === "undefined") {
            return this.models.generic;
        }

        return this.models[type];
    }

    parseRelationships<MT extends Model>(
        resource: IJSONAPIResource,
        model: MT,
        included?: IJSONAPIResource[]
    ) {
        if (!resource.relationships) {
            return;
        }

        for (var relKey in resource.relationships) {
            let related = null;

            if (
                !Object.prototype.hasOwnProperty.call(resource.relationships, relKey)
            ) {
                continue;
            }

            let relationshipType: typeof Model;
            if (model.hasRelationship(relKey)) {
                relationshipType = model.relationships()[relKey]
            } else {
                relationshipType = this.models.generic;
            }
            const relationshipSet = [] as Array<Model>;

            if (Array.isArray(resource.relationships[relKey].data)) {
                const relatedRecords = resource.relationships[relKey]
                    .data as IJSONAPIRelationshipResource[];
                relatedRecords.forEach(relRecord => {
                    if (!relRecord || !relRecord.type) {
                        return;
                    }

                    var relatedRecord;
                    if (!included) {
                        return;
                    }

                    // check to see if it is in our includes
                    relatedRecord = included.find(include => {
                        return (
                            include.type === relRecord.type && include.id === relRecord.id
                        );
                    });

                    if (relatedRecord) {
                        relationshipSet.push(this.parseSingleResource(relatedRecord));
                    }
                });

                // create and set related collection on model
                related = new Collection(relationshipSet, {
                    model: relationshipType
                });
            } else {
                const relRecord = resource.relationships[relKey]
                    .data as IJSONAPIRelationshipResource;

                if (!relRecord || !included) {
                    continue;
                }

                const relatedRecord = included.find(include => {
                    return include.type === relRecord.type && include.id === relRecord.id;
                });

                if (relatedRecord) {
                    related = this.parseSingleResource(relatedRecord);
                }
            }

            model.set(relKey, related);
        }
    }

    parseSingleResource<MT extends Model>(
        resource: IJSONAPIResource,
        included?: IJSONAPIResource[],
        meta?: Record<string, any>
    ): MT {
        const attributes = resource.attributes;
        let ModelType: typeof Model;
        if (!this.models[resource.type]) {
            ModelType = this.models.generic;
        } else {
            ModelType = this.models[resource.type];
        }

        const model = new ModelType(attributes);

        // assign meta to model's options
        if (meta) {
            model.setOptions(meta);
        }

        this.parseRelationships(resource, model, included);

        return model as MT;
    }

    parseMultipleResources<MT extends Model>(
        resources: IJSONAPIResource[],
        included?: IJSONAPIResource[],
        meta?: Record<string, any>
    ): ITypedCollection<MT> {
        const models = [] as MT[];
        resources.forEach(resource => {
            models.push(this.parseSingleResource<MT>(resource, included, meta));
        });

        return new Collection<MT>(models, {}, meta) as ITypedCollection<MT>;
    }

    parseJSONAPIResponse<MT extends Model>(
        response?: IJSONAPIResponse
    ): MT | ITypedCollection<MT> {
        if (!response || (!response.data && response.meta && response.errors)) {
            throw new Error(
                "Invalid JSON:API response.  Unable to parse response.  Missing data, meta, or errors"
            );
        }

        if (Array.isArray(response.data)) {
            return this.parseMultipleResources<MT>(
                response.data,
                response.included,
                response.meta
            );
        } else if (response.data) {
            return this.parseSingleResource<MT>(
                response.data,
                response.included,
                response.meta
            );
        } else if (response.meta) {
            // info response, need to force convert the model to generic since there's no type from
            // JSON API response
            const GenericModel = this.models.generic;
            return new GenericModel(response.meta) as unknown as MT;
        }

        throw new Error(
            "Invalid JSON:API response.  Unable to determine how to parse response"
        );
    }
}

const parser = new Parser();
export default parser;
