<template>
    <div>
        <v-grid
            record-url="/api/forms/configuration"
            :headers="['Name', 'Type', 'Active', 'Entity Name', 'Entity Model', 'Created', 'Updated']"
            record-type="home-form-configuration-row"
        ></v-grid>
    </div>
</template>
<script>
    export default {

    }
</script>
