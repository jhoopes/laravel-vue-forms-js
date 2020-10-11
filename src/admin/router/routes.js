import { config } from "@/admin/classes/configuration";

export default {
    generate() {
        let adminPrefix = config.webAdminPrefix;

        return [
            {
                path: adminPrefix + "/",
                component: () => import("@/admin/views/Home.vue"),
                name: "formAdmin.home"
            },
            {
                path: adminPrefix + "/form_configurations",
                component: () => import("@/admin/views/FormConfiguration.vue"),
                meta: {
                    title: "Form Configuration Form"
                },
                children: [
                    {
                        path: "create",
                        component: () =>
                            import("@/admin/views/FormConfigurationForm.vue"),
                        name: "formAdmin.form_configurations.create",
                        props: () => {
                            return {
                                id: null
                            };
                        },
                        meta: {
                            title: "Create Form Configuration"
                        }
                    },
                    {
                        path: ":id",
                        component: () =>
                            import("@/admin/views/FormConfigurationForm.vue"),
                        name: "formAdmin.form_configurations.edit",
                        props: route => {
                            return {
                                id: parseInt(route.params.id)
                            };
                        },
                        meta: {
                            title: "Update Form Configuration"
                        }
                    }
                ]
            }
        ];
    }
};
