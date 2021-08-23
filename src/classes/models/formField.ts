import Model from "./../model";
import { DateTime } from "luxon";

export class FormField extends Model {
  public id = 0;
  public name = "";
  public value_field = "";
  public label = "";
  public widget = "";
  public visible = true;
  public disabled = false;
  public is_eav = false;
  public parent_id: number | null = null;
  public cast_to: string | null = null;
  public field_extra: Record<string, any> = {
    required: false,
    validation_rules: [],
  };
  public created_at: DateTime = DateTime.now();
  public updated_at: DateTime = DateTime.now();

  public order: number | undefined;
  public children: FormField[] = [];

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
