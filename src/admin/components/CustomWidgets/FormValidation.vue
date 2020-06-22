<template>
    <div>
        <table class="table" v-if="standardValidationRules && standardValidationRules.length > 0">
            <thead>
            <th></th>
            <th>Validation Rule</th>
            <th>Options</th>
            </thead>
            <tbody>
            <tr
                v-for="(rule, index) in validationRules"
                :key="index"
                is="form-validation-rule"
                :rule="rule"
                @input="(updatedRule) => updateAtIndex(updatedRule, index)"
                @remove="removeRuleAtIndex(index)"
            >
            </tr>
            </tbody>
        </table>
        <div class="text-center" v-else>
            <font-awesome-icon :icon="icons.spinner" :spin="true" size="3x"></font-awesome-icon>
        </div>
        <div class="mt-4 text-right">
            <button class="button" @click="addRule">
                <font-awesome-icon :icon="icons.plus"></font-awesome-icon> Add Rule
            </button>
        </div>
    </div>
</template>
<script>
    import axios from 'axios';
    import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons'
    import FormValidationRule from './FormValidationRule'
    export default {

        inject: {
            apiClient: {
                default() {
                    return axios;
                }
            }
        },

        props: {
            value: {
                required: true,
                type: Array
            }
        },

        components: {
            FormValidationRule
        },

        data() {
            return {
                icons: {
                    plus: faPlus,
                    spinner: faSpinner
                }
            }
        },

        created() {
            if(!this.standardValidationRules || !Array.isArray(this.standardValidationRules) || this.standardValidationRules.length === 0) {
                this.$store.dispatch('form_admin/getStandardValidationRules')
            }
        },

        computed: {
            validationRules: {
                get() {
                    return this.value;
                },
                set(validationRules) {
                    this.$emit('input', validationRules);
                }
            },
            standardValidationRules() {
                return this.$store.state.form_admin.standardValidationRules;
            }
        },

        methods: {
            addRule() {
                this.validationRules.push('')
            },
            updateAtIndex(newRule, index) {
                this.validationRules.splice(index, 1, newRule);
            },
            removeRuleAtIndex(index) {
                this.validationRules.splice(index, 1);
            }
        }

    }
</script>
