<template>
    <div class="datepicker form-group">
        <label class="form-control-label">{{ fieldConfig.label }}
            <span v-if="withHelpIcon()" :class="fieldConfig.field_extra.withIcon" :title="fieldConfig.field_extra.helpText"></span>
        </label>
        <div>
            <div class="input-group date" :id="datePickerId" data-target-input="nearest">
                <input type="text"
                       class="form-control datetimepicker-input"
                       :data-target="'#' + datePickerId"
                       :value="value"
                       @focus="showPicker"
                       @blur="hidePicker"
                       @input="updateValue($event.target.value)"
                       @change="updateValue($event.target.value)"
                />
                <span class="input-group-addon" :data-target="'#' + datePickerId" data-toggle="datetimepicker">
                        <span class="glyphicon glyphicon-calendar"></span>
                    </span>
            </div>
        </div>
    </div>
</template>
<script>
    import { guid } from './../utilities/utils';
    import FormField from '../mixins/FormField';
    export default {

        name: 'form-datepicker',

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
            var vm = this;

            this.datepicker = window.jQuery('#' + this.datePickerId).datetimepicker( {
                allowInputToggle: true,
                format: 'L',
            });

            window.jQuery('#' + this.datePickerId).on('change.datetimepicker', e => {
                this.updateValue(e.date.format('MM/DD/YYYY'));
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
