import Model from "./../model";
import { DateTime } from "luxon";

export class EntityType extends Model {
  public id = 0;
  public name = "";
  public title = "";
  public type = "";
  public entity_type_id: number | null = null;
  public entity_name: string | null = null;
  public entity_model: string | null = null;
  public entity_configuration: Record<string, any> = {};
  public default_form_configuration_id: number | null = null;
  public created_at: DateTime = DateTime.now();
  public updated_at: DateTime = DateTime.now();

  constructor(attributes: Record<string, any>) {
    super({});

    this.assign(attributes);
    this.ensureAttributesAreRegistered(
      this.removeParentPropertyNames(Object.getOwnPropertyNames(this))
    );
  }

  casts(): Record<string, any> {
    return {
      created_at: this.parseDate,
      updated_at: this.parseDate,
    };
  }
}
