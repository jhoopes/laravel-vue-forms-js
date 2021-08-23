import { computed, ComputedRef } from "vue";
import { EntityType } from "laravel-vue-forms";

export const titleCase = (sentence: string) => {
  const newSentence = sentence.toLowerCase().split("_");
  for (let i = 0; i < newSentence.length; i++) {
    newSentence[i] = newSentence[i][0].toUpperCase() + newSentence[i].slice(1);
  }

  return newSentence.join(" ");
};

export const getDefaultColumns = (
  entityTypeRecord: ComputedRef<EntityType | undefined>
) => {
  const displayColumns: ComputedRef<string[] | undefined> = computed(() => {
    const defaultColumns: string[] = ["Id", ""];

    if (!entityTypeRecord.value) {
      return defaultColumns;
    }

    if (!entityTypeRecord.value.entity_configuration.displayColumns) {
      return defaultColumns;
    }

    if (
      !Array.isArray(
        entityTypeRecord.value.entity_configuration.displayColumns
      ) ||
      entityTypeRecord.value.entity_configuration.displayColumns.length === 0 ||
      typeof entityTypeRecord.value.entity_configuration.displayColumns[0] !==
        "string"
    ) {
      return defaultColumns;
    }

    const displayColumns: string[] = [];
    entityTypeRecord.value.entity_configuration.displayColumns.forEach(
      (column: string) => {
        displayColumns.push(titleCase(column));
      }
    );
    displayColumns.push("");
    return displayColumns;
  });

  return displayColumns;
};

export const getDefaultRawColumns = (
  entityTypeRecord: ComputedRef<EntityType | undefined>
) => {
  const displayColumns: ComputedRef<string[] | undefined> = computed(() => {
    const defaultColumns: string[] = ["id", ""];

    if (!entityTypeRecord.value) {
      return defaultColumns;
    }

    if (!entityTypeRecord.value.entity_configuration.displayColumns) {
      return defaultColumns;
    }

    if (
      !Array.isArray(
        entityTypeRecord.value.entity_configuration.displayColumns
      ) ||
      entityTypeRecord.value.entity_configuration.displayColumns.length === 0 ||
      typeof entityTypeRecord.value.entity_configuration.displayColumns[0] !==
        "string"
    ) {
      return defaultColumns;
    }

    const displayColumns: string[] = [];
    entityTypeRecord.value.entity_configuration.displayColumns.forEach(
      (column: string) => {
        displayColumns.push(column);
      }
    );
    return displayColumns;
  });

  return displayColumns;
};
