import { App, Plugin } from "vue";

// Import vue components
import * as components from "./components/index";

// install function executed by Vue.use()
const install: Exclude<Plugin["install"], undefined> =
  function installLaravelVueForms(app: App) {
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });
  };

// Create module definition for Vue.use()
export default install;

// To allow individual component use, export components
// each can be registered via Vue.component()
export * from "./components/index";

export { Configuration } from "./classes/configuration";
export { ApiClient } from "./classes/apiClient";

export { FormConfigurationStore } from "./store/formConfigurationStore";
export { EntityTypesStore } from "./store/entityTypesStore";
export { EntityStore } from "./store/entityStore";

export { EntityType } from "./classes/models/entityType";
export { FormConfiguration } from "./classes/models/formConfiguration";
export { FormField } from "./classes/models/formField";
export { Generic } from "./classes/models/generic";

export { default as clickaway } from "./utilities/clickaway";
