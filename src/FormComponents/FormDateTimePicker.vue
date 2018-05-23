<template>
    <div class="datepicker form-group row"
         :id="fieldName + '-datetime-field'"
         :class="{ 'has-error': form.errors.has(fieldConfig.value_field) }">
        <label class="col-sm-2 control-label">{{ fieldConfig.label }}</label>
        <div class="col-sm-10">
            <div class="input-group date" style="position: static" :id="datePickerId" data-target-input="nearest">
                <input type="text"
                       class="form-control datetimepicker-input"
                       :data-target="'#' + datePickerId"
                       @input="updateValue($event.target.value)"
                       @change="updateValue($event.target.value)"
                       @focus="showPicker"
                       @blur="hidePicker"
                />
                <span class="input-group-addon" :data-target="'#' + datePickerId" data-toggle="datetimepicker">
                        <span class="glyphicon glyphicon-calendar"></span>
                </span>
            </div>
            <span class="help-block" v-if="form.errors.has(fieldConfig.value_field)">
                {{ form.errors.get(this.fieldConfig.value_field, true) }}
            </span>
        </div>
        <div v-if="validateBillAccountFields(fieldConfig.field_extra)" class="col-xs-1">
            <span class="requiredbox fa fa-info-circle" :title="fieldConfig.field_extra.helpText"></span>
         </div>
    </div>
</template>
<script>
    import { guid } from '../utilities/utils';
    import FormField from './../mixins/FormField';
    export default {

        name: 'form-datetimepicker',

        mixins: [FormField],

        data() {
            return {
                guid: guid(),
                datePicker: {},
            }
        },

        computed: {
            datePickerId() {
                return this.guid + '-datepicker';
            }
        },

        mounted() {
            let vm = this;
            this.datepicker = window.jQuery('#' + this.datePickerId).datetimepicker( {
                allowInputToggle: true,
                widgetPositioning: {
                    horizontal: 'auto',
                    vertical: 'bottom'
                }
            });
            window.jQuery('#' + this.datePickerId).on('change.datetimepicker', function(e) {
                vm.updateValue(e.date.format('MM/DD/YYYY hh:mm A'));
            });
            window.jQuery('#' + this.datePickerId).on('update.datetimepicker', function(e) {
                vm.updateValue(e.viewDate.format('MM/DD/YYYY hh:mm A'));
            });
        },

        methods: {

            showPicker() {
                window.jQuery('#' + this.datePickerId).datetimepicker('show');
            },
            hidePicker() {
                window.jQuery('#' + this.datePickerId).datetimepicker('hide');
            },
            updateValue(value) {
                this.form.errors.clear(this.fieldConfig.value_field);
                this.$emit('input', value);
            }
        }

    }
</script>
