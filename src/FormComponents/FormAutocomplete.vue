<template>

    <div class="form-group autocomplete"
         v-on:keyup.esc="isOpen = false"
         v-on:keyup.up="previousItem"
         v-on:keyup.down="nextItem"
         :id="fieldName + '-text-field'"
         :class="{ 'has-error': form.errors.has(this.fieldConfig.value_field) }"
    >
        <label class="form-control-label" v-if="showLabel"><span v-html="fieldConfig.label"></span>
            <span class="required" v-if="fieldConfig.field_extra.required">&nbsp;&nbsp;(*)</span>
            <span v-if="withHelpIcon" :class="fieldConfig.field_extra.withIcon" :title="fieldConfig.field_extra.helpText"></span>
        </label>
        <div class="">
            <input
                class="form-control"
                type="text"
                v-model="search"
                @input="onChange"
                @keydown.down.once="nextItem"
                @keydown.up.once="previousItem"
                @keydown.enter="onEnter"
            />
            <ul
                v-show="isOpen"
                class="autocomplete-results"
            >
                <li
                    v-for="(result, i) in results"
                    :key="i"
                    @click="setResult(result)"
                    class="autocomplete-result"
                    :class="{ 'is-active': i === arrowCounter }"
                    v-if="loading === false"
                >
                    {{ result }}
                </li>
                <li v-if="results.length === 0 && tagging && loading === false"
                    class="autocomplete-result"
                    @click="createItem"
                >
                    Create this {{ fieldConfig.label }}
                </li>
                <li v-if="loading === true">Loading... <fa-icon icon="spinner" :spin="true"></fa-icon></li>
            </ul>
            <span class="help-block" v-if="form.errors.has(this.fieldConfig.value_field)">
                {{ form.errors.get(this.fieldConfig.value_field, true) }}
            </span>
        </div>
        <div v-if="hasHelpText">
            <span v-html="fieldConfig.field_extra.helpText"></span>
        </div>
    </div>
</template>
<script>
    import FormField from './../mixins/FormField'
    import HasOptions from './../mixins/HasOptions'
    import {debounce} from 'lodash';
    export default {
        name: 'form-autocomplete',

        mixins: [FormField, HasOptions],

        props: {
          tagging: {
              type: Boolean,
              default: false,
          }
        },

        data() {
            return {
                search: '',
                items: [],
                results: [],
                currentItem: null,
                isOpen: false,
                loading: false,
                arrowCounter: 0
            };
        },

        created() {
            this.getOptions().then(options => {
                this.setSearch();
            });
        },

        mounted() {
            document.addEventListener('click', this.handleClickOutside);
        },
        destroyed() {
            document.removeEventListener('click', this.handleClickOutside);
        },

        computed: {
            currentOptionsURL() {
                return '';
            },
            currentOptionsUrl() {
                if(this.fieldConfig.optionsURL) {
                    var optionsURL = this.fieldConfig.optionsURL;
                    this.fieldsToWatch.forEach(match => {
                        let fieldValue = get(this.form, match[1], '');
                        optionsURL = optionsURL.replace(match[0], fieldValue);
                    });

                    var params = JSON.parse(JSON.stringify(this.fieldConfig.optionsUrlParams));
                    params.q = this.search;

                    if(!this.search && this.value) {
                        params.q = this.value;
                    }

                    let queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');

                    optionsURL += '?' + queryString;
                    return optionsURL;
                }
                return '';
            }
        },

        watch: {
            'currentOptionsUrl': function(newURL) {
                this.updateOptions();
            },
        },

        methods: {
            handleClickOutside(evt) {
                if (!this.$el.contains(evt.target)) {
                    this.isOpen = false;
                    this.arrowCounter = -1;
                }
            },
            onChange() {

                if(!this.currentOptionsURL) {
                    this.isOpen = true;
                    this.filterResults();
                }else {
                    this.loading = true;
                    this.isOpen = true;
                }

                if(this.search === '' || this.search === null) {
                    this.$emit('input', null);
                }
            },
            filterResults() {
                this.results = this.items.filter(item => item.toLowerCase().indexOf(this.search.toLowerCase()) > -1);
            },
            setResult(result) {

                this.search = result;
                this.isOpen = false;

                this.$emit('input', this.getValue());
            },
            previousItem() {
                if (this.arrowCounter > 0) {
                    this.arrowCounter = this.arrowCounter - 1;
                }
            },
            nextItem() {
                if (this.arrowCounter < this.results.length) {
                    this.arrowCounter = this.arrowCounter + 1;
                }
            },
            onEnter() {
                var result = this.results[this.arrowCounter];
                this.setResult(result);
                this.isOpen = false;
                this.arrowCounter = -1;
            },
            updateOptions: debounce(function() {
                this.getOptions()
            }, 200),
            getOptions() {
                return new Promise((resolve, reject) => {
                    if(this.currentOptionsUrl.length > 0) {
                        this.loading = true;
                        this.apiClient.get(this.currentOptionsUrl).then( response => {

                            this.fieldConfig.options = response.data;
                            this.loading = false;

                            this.setItems();
                            this.filterResults();
                            resolve(response.data);

                        }).catch( error => {
                            window.notify.apiError(error);
                            this.loading = false;
                            reject(error);
                        });
                    }else {
                        this.setItems()
                    }
                })
            },
            setItems() {
                if(this.fieldConfig.optionLabelField) {
                    this.items = this.fieldConfig.options.map(option => {
                        return option[this.fieldConfig.optionLabelField]
                    })
                }else {
                    this.items = this.fieldConfig.options;
                }
            },
            setSearch() {
                if(!this.value) {
                    return;
                }

                if(this.fieldConfig.optionValueField && this.fieldConfig.optionLabelField) {

                    let items = this.fieldConfig.options.filter(item => {
                        return item[this.fieldConfig.optionValueField] === this.value;
                    });
                    this.search = items[0][this.fieldConfig.optionLabelField];
                }else {
                    this.search = this.value;
                }
            },
            getValue() {

                var value = null;
                if(this.fieldConfig.optionValueField) {
                    value = this.fieldConfig.options.filter(item => {
                        return item[this.fieldConfig.optionLabelField] === this.search
                    });
                    if(value.length > 0) {
                        value = value[0][this.fieldConfig.optionValueField];
                    }
                }else {
                    value = this.items.filter(item => {
                        return item === this.search
                    })[0]
                }
                return value;
            },
            createItem() {

                if(!this.tagging) {
                    return;
                }

                if(this.fieldConfig.optionsURL) {
                    this.loading = true;
                    var data  = {};
                    data[this.fieldConfig.fieldName] = this.search;
                    axios.post(this.fieldConfig.optionsURL, data).then(response => {
                        this.loading = false;
                        this.fieldConfig.options.push(response.data);
                        this.setResult(response.data[this.fieldConfig.optionLabelField]);
                    }).catch(error => {
                        this.loading = false;
                    })
                }else {
                    this.$emit('create-tag', this.search);
                }
            }
        },
    }
</script>
<style>
    .autocomplete {
        position: relative;
    }

    .autocomplete-results {
        position: absolute;
        top: 0;
        left: 0;
        padding: 5px;
        margin-top: 3.5rem;
        border: 1px solid #a5a5a5;
        background: white;
        min-width: 100%;
        height: 120px;
        overflow: auto;
        z-index: 999;
    }

    .autocomplete-result {
        list-style: none;
        text-align: left;
        padding: 4px 2px;
        cursor: pointer;
    }

    .autocomplete-result:hover, .autocomplete-result.is-active {
        background-color: #4AAE9B;
        color: white;
    }
</style>
