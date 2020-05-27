<template>
    <div>
        <v-grid
            record-url="/api/forms/admin/form_configurations"
            :headers="['Name', 'Type', 'Active', 'Entity Name', 'Entity Model', 'Created', 'Updated']"
            record-type="home-form-configuration-row"
            :use-json-api="useJsonApi"
        ></v-grid>
    </div>
</template>
<script>
    export default {

        inject: ['useJsonApi']

    }
</script>
