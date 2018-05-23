<template>
    <div class="datepicker form-group">
        <label class="form-control-label">{{ fieldConfig.label }}</label>
        <div>
            <div class="input-group date" :id="datePickerId" data-target-input="nearest">
                <input type="text"
                       class="form-control datetimepicker-input"
                       :data-target="'#' + datePickerId"
                       @focus="showPicker"
                       @blur="hidePicker"
                />
                <span class="input-group-addon" :data-target="'#' + datePickerId" data-toggle="datetimepicker">
                        <span class="glyphicon glyphicon-calendar"></span>
                    </span>
            </div>
        </div>
        <div v-if="validateBillAccountFields(fieldConfig.field_extra)" class="col-xs-1">
            <span class="requiredbox fa fa-info-circle" :title="fieldConfig.field_extra.helpText"></span>
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
            this.datepicker = window.jQuery('#' + this.datePickerId).datetimepicker( {
                debug: true,
                allowInputToggle: true
            });
        },

        methods: {

            showPicker() {
                window.jQuery('#' + this.datePickerId).datetimepicker('show');
            },
            hidePicker() {
                window.jQuery('#' + this.datePickerId).datetimepicker('hide');
            }
        }

    }
</script>
