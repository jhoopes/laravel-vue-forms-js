import Parser from './../admin/classes/jsonapi_parser';

export default {



    methods: {
        runAction(action) {
            if(typeof this[action] === 'function') {
                this[action]();
            }else {
                this.$emit(action, this.form.getData());
            }
        },
        cancelForm() {
            this.$emit('cancel-form');
        },
        close() {
            this.$emit('close-form');
        },
        resetForm() {
            this.form.reset();
        },
        submitForm() {

            // If this form is a pass through form, run the save success for updated only to push data out of the form
            // object
            if(this.passThru) {
                this.$nextTick(() => {
                    this.saveSuccess(this.form.getData(), 'updated');
                });
                return;
            }

            let method = this.getSubmitHttpMethod();
            let data = this.getSubmitData();
            this.saving = true;

            var options = {};
            if(this.useJsonApi) {
                options.headers = {
                    Accept: 'application/vnd.api+json'
                }
            }


            this.apiClient[method](this.formSubmitUrl, data, options).then(response => {

                var record = response.data;
                if(this.useJsonApi) {
                    record = Parser.parseJSONAPIResponse(response.data);
                }


                if(method === 'post') { // we're creating so set the response id onto the form object
                    this.$set(this.form, 'id', record.id);
                    this.$set(this.form.data, 'id', record.id);
                }
                this.$nextTick(() => {
                    var actionType = 'updated';
                    if(method === 'post') {
                        actionType = 'created';
                    }

                    this.saveSuccess(record, actionType);
                    this.saving = false;
                });

            }).catch( error => {
                this.saving = false;

                this.errorHandler(error);

                // if(error.response && error.response.status === 422) {
                //     this.form.errors.setErrors(error.response.data)
                // }else {
                //     window.notify.apiError(error);
                // }
            });
        },

        getSubmitHttpMethod() {

            if(this.form.id) {
                return 'patch';
            }

            return 'post';
        },
        getSubmitData() {
            var data = {};
            if(this.form.id) {
                data.entityId = this.form.id;
            }
            data.formConfigurationId = this.formConfig.id;
            data.data = this.form.getData();
            return data;
        }
    }

}
