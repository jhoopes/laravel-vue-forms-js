import { get } from 'lodash';
import { byString} from "../utilities/utils";
import Parser from './../admin/classes/jsonapi_parser';

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
        optionsUrlParams: {
            type: Object,
            default() {
                return {}
            }
        },
        vuexPath: {
            type: String,
            default: null,
        },
        optionLabelField: {
            type: String,
            default: 'name',
        },
        optionValueField: {
            type: String,
            default: 'id'
        }
    },

    data() {
        return {
            fieldsToWatch: [],
            vuexStorePath: null,
            vuexGetterPath: null,
        }
    },


    created() {

        if(this.findInForm && this.form && this.form.formConfig &&
            (
                Array.isArray(this.form.formConfig.fields) ||
                typeof this.form.formConfig.fields[Symbol.iterator] === 'function'
            )
        ) {
            this.form.formConfig.fields.forEach(field => {
                if(field.name === this.fieldName) {

                    if(!field.field_extra.options_config) {
                        window.notify.message('Invalid field configuration for field: ' + field.name, 'error');
                        return;
                    }
                    this.$set(this.fieldConfig, 'options',  []);
                    this.$set(this.fieldConfig, 'optionsUrlParams', {});

                    if (field.field_extra.options_config.vuex_store_path && field.field_extra.options_config.vuex_getter_path) {
                        window.notify.message('Can not specify both vuex_store_path and vuex_getter_path in configuration.');
                        return;
                    }

                   if(field.field_extra.options_config.vuex_store_path) {
                       this.vuexStorePath = field.field_extra.options_config.vuex_store_path;
                   }

                    if(field.field_extra.options_config.vuex_getter_path) {
                        this.vuexGetterPath = field.field_extra.options_config.vuex_getter_path;
                    }

                    if(field.field_extra.options_config.optionsURL) {
                        this.setUpOptionsURL(field);
                    }

                    if(field.field_extra.options_config.optionsUrlParams) {
                        this.$set(this.fieldConfig, 'optionsUrlParams', field.field_extra.options_config.optionsUrlParams);
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
            this.$set(this.fieldConfig, 'optionsUrlParams', this.optionsUrlParams);
            this.vuexStorePath = this.vuexPath;
            this.vuexGetterPath = this.vuexPath;
        }
    },

    computed: {
        currentOptionsURL() {
            if(this.fieldConfig.optionsURL) {
                var optionsURL = this.fieldConfig.optionsURL;
                this.fieldsToWatch.forEach(match => {
                    let fieldValue = get(this.form.data, match[1], '');
                    if(!fieldValue) {
                        fieldValue = '';
                    }
                    optionsURL = optionsURL.replace(match[0], fieldValue);
                });


                if(!this.paramsAreEmpty(this.fieldConfig.optionsUrlParams)) {
                    let queryString = Object.keys(this.fieldConfig.optionsUrlParams).map(key => key + '=' + params[key]).join('&');

                    optionsURL += '?' + queryString;
                }

                return optionsURL;
            }
            return '';
        },
        optionValue() {

            if(!this.value && this.value !== 0) {
                return '';
            }

            var selectedOption = {};
            this.fieldConfig.options.forEach(option => {
                if(option[this.fieldConfig.optionValueField] == this.value) {
                    return selectedOption = option;
                }
            });
            return selectedOption;
        },
        vuexOptions() {

            if (this.vuexStorePath) {
                return byString(this.$store.state, this.vuexStorePath);
            }

            if(this.vuexGetterPath) {
                return this.$store.getters[this.vuexGetterPath];
            }

            return [];
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
        'vuexOptions': function(newOptions) {
            this.$set(this.fieldConfig, 'options', newOptions);
            this.defaultField();
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

                    var options = response.data;
                    if(this.jsonApi) { // parse the response and get the array of models
                        options = Parser.parseJSONAPIResponse(response.data).getModels();
                    }

                    this.$set(this.fieldConfig, 'options', options);
                }).catch( error => {
                    console.error(error);
                    if(window.notify && typeof window.notify.apiError === 'function') {
                        window.notify.apiError(error);
                    }
                });
            }

        },
        defaultField() {

            try {
                var defaultField = false;
                if(!this.optionValue) {
                    defaultField = true;
                }else if (typeof this.optionValue === 'object' && Object.keys(this.optionValue).length === 0) {
                    defaultField = true;
                }else if (this.optionValue === this.fieldConfig.default) {
                    defaultField = true;
                }
                if(defaultField && this.fieldConfig.default) {
                    this.fieldConfig.options.forEach(option => {

                        if(option[this.fieldConfig.optionLabelField] === this.fieldConfig.default) {
                            this.updateValue(option);
                        }
                    })
                }

            }catch (error) {
                //console.trace(error);
            }
        },
        paramsAreEmpty(params) {

            for(var key in params) {
                if(params.hasOwnProperty(key))
                    return false;
            }
            return true;

        }

    }


}
