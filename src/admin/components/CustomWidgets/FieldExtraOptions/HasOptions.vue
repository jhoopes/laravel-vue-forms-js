<template>
    <div>
        <form-text
            :find-in-form="false"
            field-name="option-label-field"
            label="Option Label Field"
            v-model="options.optionLabelField"
            ></form-text>
        <form-text
            :find-in-form="false"
            field-name="option-value-field"
            label="Option Value Field"
            v-model="options.optionValueField"
        ></form-text>
        <form-radio
            :find-in-form="false"
            field-name="select-option-type"
            label="Option Source Location"
            :options="optionTypes"
            v-model="selectedOptionType"></form-radio>
    </div>
</template>
<script>
    export default {

        props: {
            fieldExtra: {
                required: true,
            }
        },

        data() {
            return {
                options: {
                    optionLabelField: null,
                    optionValueField: null,
                },
                selectedOptionType: null,
                optionTypes: [
                    {
                        name: 'Manual Options',
                        id: 'options'
                    },
                    {
                        name: 'URL',
                        id: 'url'
                    },
                    {
                        name: 'Vuex',
                        id: 'vuex'
                    },
                ]
            }
        },

        watch: {
            options: {
                handler(options) {
                    console.log('test', options);
                },
                deep: true
            }
        }
    }
</script>
