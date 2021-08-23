import Dashboard from "../components/Pages/Dashboard.vue";
import EntityTypesHome from "../components/Pages/EntityTypesHome.vue";
import FormsHome from "../components/Pages/FormsHome.vue";
import {
  FormsAdminHome,
  AdminFormConfigurationForm,
  EntitiesAdminHome,
  AdminEntityTypesForm,
} from "@/entry.esm";
import EntitiesHome from "../components/Pages/EntitiesHome.vue";
import EntitiesListing from "../components/Pages/EntitiesListing.vue";
import EntityForm from "../components/Pages/EntityForm.vue";

export default [
  {
    path: "/",
    name: "dashboard",
    component: Dashboard,
    meta: {
      title: "Laravel Vue Forms - Dashboard",
    },
  },
  {
    path: "/entity_types",
    component: EntityTypesHome,
    meta: {
      title: "Laravel Vue Forms - Entities Types Configuration",
    },
    children: [
      {
        path: "",
        component: EntitiesAdminHome,
        name: "formAdmin.entity_types",
      },
      {
        path: ":id",
        component: AdminEntityTypesForm,
        name: "formAdmin.entity_types_form",
        props: (route: Record<string, any>) => {
          return {
            id: parseInt(route.params.id),
          };
        },
        meta: {
          title: "Laravel Vue Forms - Update Entity Type",
        },
      },
    ],
  },
  {
    path: "/forms",
    component: FormsHome,
    meta: {
      title: "Laravel Vue Forms - Forms",
    },
    children: [
      {
        path: "",
        component: FormsAdminHome,
        name: "formAdmin.home",
      },
      {
        path: ":id",
        component: AdminFormConfigurationForm,
        name: "formAdmin.form_configurations.edit",
        props: (route: Record<string, any>) => {
          return {
            id: parseInt(route.params.id),
          };
        },
        meta: {
          title: "Update Form Configuration",
        },
      },
    ],
  },
  {
    path: "/entities",
    component: EntitiesHome,
    meta: {
      title: "Laravel Vue Forms - Entities",
    },
    children: [
      {
        path: "",
        component: EntitiesListing,
        name: "formAdmin.custom_entities_listing",
      },
      {
        path: ":entityType",
        component: EntityForm,
        name: "formAdmin.entities_create",
        props: (route: Record<string, any>) => {
          return {
            entityType: route.params.entityType,
            entityId: 0,
          };
        },
      },
      {
        path: ":entityType/:entityId",
        component: EntityForm,
        name: "formAdmin.entities_update",
        props: (route: Record<string, any>) => {
          return {
            entityType: route.params.entityType,
            entityId: parseInt(route.params.entityId),
          };
        },
      },
    ],
  },
];
