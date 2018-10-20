<template>
    <div class="datepicker form-group">
        <label class="form-control-label">{{ fieldConfig.label }}
            <span v-if="withHelpIcon" :class="fieldConfig.field_extra.withIcon" :title="fieldConfig.field_extra.helpText"></span>
        </label>
        <div>
            <div class="input-group date" :id="datePickerId" data-target-input="nearest">
                <vue-ctk-date-time-picker
                    :label="''"
                    formatted="MM/DD/Y"
                    format="MM/DD/Y"
                    :value="value"
                    @input="updateValue"
                    :disable-time="true"
                    :without-header="true"
                    :auto-close="true"
                ></vue-ctk-date-time-picker>
            </div>
            <div v-if="hasHelpText">
                <span v-html="fieldConfig.field_extra.helpText"></span>
            </div>
        </div>
    </div>
</template>
<script>
    import { guid } from './../utilities/utils';
    import FormField from '../mixins/FormField';
    import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
    import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.min.css';
    export default {

        name: 'form-datepicker',

        mixins: [FormField],

        components: {
            VueCtkDateTimePicker
        },

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

        // mounted() {
        //     var vm = this;
        //
        //     this.datepicker = window.jQuery('#' + this.datePickerId).datetimepicker( {
        //         allowInputToggle: true,
        //         format: 'L',
        //     });
        //
        //     window.jQuery('#' + this.datePickerId).on('change.datetimepicker', e => {
        //         this.updateValue(e.date.format('MM/DD/YYYY'));
        //     });
        // },

        methods: {
            updateValue(value) {
                this.form.errors.clear(this.fieldConfig.value_field);
                this.$emit('input', value);
            }
        }

    }
</script>
