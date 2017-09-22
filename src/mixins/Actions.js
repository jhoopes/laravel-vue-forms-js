import axios from 'axios';

export default {



    methods: {
        cancel() {
            this.$emit('cancel-form');
        },
        resetForm() {
            this.form.reset();
        },
        submitForm() {

            let method = this.getSubmitHttpMethod();
            let data = this.getSubmitData();

            axios[method](this.formSubmitUrl, data).then(response => {

                if(method === 'post') { // we're creating so set the response id onto the form object
                    this.$set(this.form, 'id', response.data.id);
                }
                this.$nextTick(() => {
                    var actionType = 'updated';
                    if(method === 'post') {
                        actionType = 'created';
                    }

                    this.saveSuccess(response, actionType);
                });

            }).catch( error => {
                if(error.response && error.response.status === 422) {
                    this.form.errors.setErrors(error.response.data)
                }else {
                    window.notify.apiError(error);
                }
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
            data.data = this.form.data();

            return data;
        }
    }

}