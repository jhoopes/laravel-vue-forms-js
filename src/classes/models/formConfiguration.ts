import Model from "./../model";
import { FormField } from "./formField";
import { DateTime } from "luxon";
import Collection from "./../collection";

export class FormConfiguration extends Model {
  public id = 0;
  public name = "";
  public type = "";
  public active = false;
  public entity_name: string | null = null;
  public entity_model: string | null = null;
  public entity_type_id: number | null = null;
  public options: Record<string, any> = {};
  public created_at: DateTime = DateTime.now();
  public updated_at: DateTime = DateTime.now();

  /** @ts-ignore **/
  public fields: Collection<FormField> = new Collection<FormField>([]);

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

  relationships(): Record<string, typeof Model> {
    return {
      fields: FormField,
    };
  }
}
