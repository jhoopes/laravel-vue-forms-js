import VueStore from "vue-class-store";
import { LVFStore } from "./LVFStore";
import Collection from "./../classes/collection";
import Parser from "./../classes/jsonapi_parser";
import { IJSONAPIResponse } from "./../types";

import Generic from "./../classes/models/generic";

@VueStore
export class EntityStore extends LVFStore {
  public entities: Record<string, Collection<Generic>> = {};

  public async getEntityForId(entityTypeName: string, entityId: number) {
    const response = await this.apiClient.get(
      "/api/entities/" + entityTypeName + "/" + entityId,
      {
        searchParams: {
          include: ["files"],
        },
      }
    );

    let entity: Generic;
    if (this.useJsonApi) {
      entity = Parser.parseJSONAPIResponse(
        response.data as IJSONAPIResponse
      ) as Generic;
    } else {
      entity = new Generic(response.data as Record<string, any>);
    }

    return this.addEntityToStore(entityTypeName, entity);
  }

  public async deleteEntityForId(entityTypeName: string, entityId: number) {
    await this.apiClient.delete(
      "/api/entities/" + entityTypeName + "/" + entityId
    );
    return this.removeEntityFromStore(entityTypeName, entityId);
  }

  public addEntityToStore(entityTypeName: string, entity: Generic) {
    if (!this.entities[entityTypeName]) {
      this.entities[entityTypeName] = new Collection<Generic>([], {
        model: Generic,
      });
    }

    this.entities[entityTypeName].add(entity);
  }

  public removeEntityFromStore(entityTypeName: string, entityId: number) {
    if (!this.entities[entityTypeName]) {
      return; // silently return if there is no record, but API succeeded
    }

    const exitingEntity: Generic | undefined = this.entities[entityTypeName]
      .getModels()
      .find((entity: Generic) => {
        return entity._attributes.id === entityId;
      });

    if (!exitingEntity) {
      return;
    }

    this.entities[entityTypeName].remove(exitingEntity);
  }

  public getDefaultEntity() {
    return new Generic({});
  }
}
