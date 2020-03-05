<template>
    <div class="m-4 mx-auto w-3/4">
        <div class="flex justify-between items-center shadow p-4">
            Form Administration
            <div>
                <button class="p-2 bg-blue-300">Create Form Configuration</button>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapState, mapGetters, mapActions } from 'vuex';
    export default {



        computed: {
            ...mapState('form_admin', [
                'form_configurations'
            ])


        }

    }
</script>
