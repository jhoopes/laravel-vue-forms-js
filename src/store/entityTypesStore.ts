import VueStore from "vue-class-store";
import { LVFStore } from "./LVFStore";
import Collection from "./../classes/collection";
import { EntityType } from "./../classes/models/entityType";
import config from "./../classes/configuration";
import Parser from "./../classes/jsonapi_parser";
import { IJSONAPIResponse } from "./../types";

@VueStore
export class EntityTypesStore extends LVFStore {
  public entityTypesCollection = new Collection<EntityType>([], {
    model: EntityType,
  });

  public async getAllEntityTypes() {
    const response = await this.apiClient.get(
      config.adminApiPrefix + "/entity_types?pp=0"
    );
    let entityTypesCollection: Collection<EntityType>;
    if (this.useJsonApi) {
      entityTypesCollection = Parser.parseJSONAPIResponse<EntityType>(
        response.data as IJSONAPIResponse
      ) as Collection<EntityType>;
    } else {
      entityTypesCollection = new Collection<EntityType>(
        response.data as Record<string, any>[],
        {
          model: EntityType,
        }
      );
    }

    entityTypesCollection.getModels().forEach((entityType) => {
      this.entityTypesCollection.add(entityType);
    });
  }

  public async getEntityTypeForId(id: number): Promise<EntityType> {
    let entityType: EntityType | undefined;
    entityType = this.entityTypesCollection.find({ id: id });
    if (entityType) {
      return entityType;
    }

    const url = config.adminApiPrefix + "/entity_types/" + id;
    const response = await this.apiClient.get(url);

    if (this.useJsonApi) {
      entityType = Parser.parseJSONAPIResponse<EntityType>(
        response.data as IJSONAPIResponse
      ) as EntityType;
    } else {
      entityType = new EntityType(response.data as Record<string, any>);
    }

    this.entityTypesCollection.add(entityType);

    return entityType;
  }

  get customEntityTypes(): Collection<EntityType> {
    return this.entityTypesCollection.filter({ type: "custom" });
  }

  public updateEntityTypeModel(entityType: Record<string, any> | EntityType) {
    let entityTypeAttributes = entityType;
    if (entityType instanceof EntityType) {
      entityTypeAttributes = entityType.toJSON();
    }

    const currentEntityType = this.entityTypesCollection
      .getModels()
      .find((entityType: EntityType) => {
        return entityType._attributes.id === entityTypeAttributes.id;
      });

    if (!currentEntityType) {
      throw Error("Unable to update entityType, no valid type found");
    }

    currentEntityType.assign(entityTypeAttributes);
  }

  public getDefaultEntityType(): EntityType {
    return new EntityType({});
  }
}
