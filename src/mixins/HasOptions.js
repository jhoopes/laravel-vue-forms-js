import { get } from 'lodash';
export default {

    props: {
        options: {
            type: Array,
        },
        optionLabelField: {
            type: String,
        },
        optionValueField: {
            type: String,
        }
    },

    data() {
        return {
            fieldsToWatch: []
        }
    },


    created() {

        if(this.form && this.form.formConfig && Array.isArray(this.form.formConfig.fields)) {
            this.form.formConfig.fields.forEach(field => {
                if(field.name === this.fieldName) {

                    if(!field.field_extra.options_config) {
                        window.notify.message('Invalid field configuration for field: ' + field.name, 'error');
                        return;
                    }
                    this.$set(this.fieldConfig, 'options',  []);

                    if(field.field_extra.options_config.optionsURL) {
                        this.setUpOptionsURL(field);
                    }

                    if(field.field_extra.options_config.options) {
                        this.setUpOptions(field);
                    }


                    this.$set(this.fieldConfig, 'optionValueField',  'id');
                    this.$set(this.fieldConfig, 'optionLabelField',  'name');

                    if(field.field_extra.options_config.optionValueField) {
                        this.fieldConfig.optionValueField = field.field_extra.options_config.optionValueField;
                    }

                    if(field.field_extra.options_config.optionLabelField) {
                        this.fieldConfig.optionLabelField = field.field_extra.options_config.optionLabelField;
                    }

                }
            });
        }

        // TODO: Needs updating to work outside of being used in VueForm
    },

    computed: {
        currentOptionsURL() {
            if(this.fieldConfig.optionsURL) {
                var optionsURL = this.fieldConfig.optionsURL;
                this.fieldsToWatch.forEach(match => {
                    let fieldValue = get(this.form, match[1], '');
                    optionsURL = optionsURL.replace(match[0], fieldValue);
                })
                return optionsURL;
            }
            return '';
        },
        optionValue() {

            if(!this.value) {
                return '';
            }

            var selectedOption = {};
            this.fieldConfig.options.forEach(option => {
                if(option[this.fieldConfig.optionValueField] === this.value) {
                    return selectedOption = option;
                }
            })
            return selectedOption;
        }
    },

    watch: {
        'currentOptionsURL': function(newURL) {
            this.getOptions();
        }
    },


    methods: {
        // set up options based on optionsURL param in field config
        setUpOptionsURL(field) {

            this.$set(this.fieldConfig, 'optionsURL', field.field_extra.options_config.optionsURL);
            var pattern = /:([^:]*):/g, match;

            while(match = pattern.exec(this.fieldConfig.optionsURL)) {
                this.fieldsToWatch.push(match);
            }
        },
        // set up options based on options param in field config
        setUpOptions(field) {

            var options = [];
            field.field_extra.options_config.options.forEach(fieldOption => {
                options.push(fieldOption);
            });

            this.$set(this.fieldConfig, 'options', options);
        },

        getOptions() {

            if(this.currentOptionsURL.length > 0) {
                axios.get(this.currentOptionsURL).then( response => {

                    this.fieldConfig.options = response.data;

                }).catch( error => {
                    window.notify.apiError(error);
                });

            }

        }

    }


}
