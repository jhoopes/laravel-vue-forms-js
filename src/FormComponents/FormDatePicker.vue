<template>
    <div class="datepicker form-group row">
        <label class="col-sm-2 control-label">Date Picking</label>
        <div class="col-sm-10">
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
    </div>
</template>
<script>
    import { guid } from '../utilities/utils';
    import jQuery from 'jquery';
    export default {

        name: 'form-datepicker',

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
