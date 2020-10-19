import Collection from "./collection";
import Generic from "./models/generic";
import FormConfiguration from "./../admin/classes/models/formConfiguration";
import FormField from "./../admin/classes/models/formField";

class Parser {
    constructor() {
        this._models = {
            generic: Generic,
            form_configuration: FormConfiguration,
            form_field: FormField
        };
    }

    modelTypeForRelKey(relKey, model) {
        var modelType = this._models.generic;
        if (model.hasRelationship(relKey)) {
            modelType = model.relationships()[relKey];
        }

        return modelType;
    }

    parseRelationships(resource, model, included) {
        if (!resource.relationships) {
            return;
        }

        for (var relKey in resource.relationships) {
            if (
                !Object.prototype.hasOwnProperty.call(
                    resource.relationships,
                    relKey
                )
            ) {
                continue;
            }

            var relationshipSet = [];

            if (Array.isArray(resource.relationships[relKey].data)) {
                resource.relationships[relKey].data.forEach(relRecord => {
                    if (!relRecord || !relRecord.type) {
                        return;
                    }

                    var relatedRecord;
                    if (!included) {
                        // create model with id so the relationship presence exists
                        let modelType = this.modelTypeForRelKey(relKey, model);
                        relatedRecord = new modelType({
                            id: relRecord.id
                        });

                        relationshipSet.push(relatedRecord);
                        return;
                    }

                    // check to see if it is in our includes
                    relatedRecord = included.find(include => {
                        return (
                            include.type === relRecord.type &&
                            include.id === relRecord.id
                        );
                    });

                    if (relatedRecord) {
                        relationshipSet.push(
                            this.parseSingleResource(relatedRecord)
                        );
                        return;
                    }

                    // create model with id so the relationship presence exists
                    let modelType = this.modelTypeForRelKey(relKey, model);
                    relatedRecord = new modelType({
                        id: relRecord.id
                    });

                    relationshipSet.push(relatedRecord);
                });

                // create and set related collection on model
                var related = new Collection(relationshipSet, {
                    model: this.modelTypeForRelKey(relKey, model)
                });
            } else {
                let relRecord = resource.relationships[relKey].data;

                if (relRecord) {
                    relationshipSet = relRecord;
                    if (included) {
                        let relatedRecord = included.find(include => {
                            return (
                                include.type === relRecord.type &&
                                include.id === relRecord.id
                            );
                        });

                        if (relatedRecord) {
                            related = this.parseSingleResource(relatedRecord);
                        }
                    }
                }
            }

            model.set(relKey, related);
        }
    }

    parseSingleResource(resource, included, meta) {
        let attributes = resource.attributes;

        var modelType = this._models.generic;
        if (this._models[resource.type]) {
            modelType = this._models[resource.type];
        }

        var model = new modelType(attributes);

        // assign meta to model's options
        if (meta || resource.meta) {
            meta = Object.assign(meta, resource.meta);
            model.setOptions(meta);
        }

        this.parseRelationships(resource, model, included);

        return model;
    }

    parseMultipleResources(resources, included, meta) {
        var models = [];
        resources.forEach(resource => {
            models.push(this.parseSingleResource(resource, included));
        });

        return new Collection(models, {}, meta);
    }

    parseJSONAPIResponse(response) {
        if (!response.data && response.meta && response.errors) {
            console.error(
                "Invalid JSON:API response.  Unable to parse response",
                response
            );
            return;
        }

        if (Array.isArray(response.data)) {
            return this.parseMultipleResources(
                response.data,
                response.included,
                response.meta
            );
        }

        return this.parseSingleResource(
            response.data,
            response.included,
            response.meta
        );
    }
}

export default new Parser();
