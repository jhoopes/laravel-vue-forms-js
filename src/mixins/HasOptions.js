import { get } from 'lodash';
export default {

    props: {
        options: {
            type: Array,
            default() {
                return []
            }
        },
        optionsUrl: {
            type: String,
            default: null,
        },
        optionLabelField: {
            type: String,
            default: '',
        },
        optionValueField: {
            type: String,
            default: ''
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

                    if(field.field_extra.options_config.default) {
                        this.fieldConfig.default = field.field_extra.options_config.default;
                    }

                }
            });
        }else {
            this.$set(this.fieldConfig, 'options', this.options);
            this.$set(this.fieldConfig, 'optionValueField',  this.optionValueField);
            this.$set(this.fieldConfig, 'optionLabelField',  this.optionLabelField);
            this.$set(this.fieldConfig, 'optionsURL', this.optionsUrl);
        }
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
                if(option[this.fieldConfig.optionValueField] == this.value) {
                    return selectedOption = option;
                }
            });
            return selectedOption;
        }
    },

    watch: {
        'currentOptionsURL': function(newURL) {
            this.getOptions();
        },
        'options' : function(newOptions) {
            this.$set(this.fieldConfig, 'options', newOptions);

            this.defaultField()
        },
        'fieldConfig.options': function(newOptions) {
            this.$emit('options-updated', newOptions);
            this.defaultField();
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
                this.apiClient.get(this.currentOptionsURL).then( response => {

                    this.fieldConfig.options = response.data;

                }).catch( error => {
                    window.notify.apiError(error);
                });

            }

        },
        defaultField() {

            try {

                if(!this.optionValue && this.fieldConfig.default) {
                    this.fieldConfig.options.forEach(option => {
                        if(option[this.fieldConfig.optionLabelField] === this.fieldConfig.default) {
                            this.updateValue(option);
                        }else {
                        }
                    })
                }

            }catch (error) {
                //console.trace(error);
            }
        }

    }


}
