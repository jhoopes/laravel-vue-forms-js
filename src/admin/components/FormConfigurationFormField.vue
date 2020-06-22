<template>
    <div class=" border-2 w-full rounded">
        <div class="flex items-center p-2 shadow-md" @click="showForm = !showForm">
            <font-awesome-icon :icon="icons.handle" class="handle cursor-pointer"></font-awesome-icon>
            <div class="cursor-pointer ml-2 md:ml-8 flex justify-between items-center w-full">
                <font-awesome-icon :icon="icons.formOpen" v-if="showForm"></font-awesome-icon>
                <font-awesome-icon :icon="icons.formClosed" v-else></font-awesome-icon>
                <div>{{ field.name }}&nbsp;</div>
                <button @click.stop="showForm = true;">Edit Field</button>
            </div>
        </div>
        <transition name="slide">
            <div class="shadow-inner w-full p-4" v-if="showForm">
                <vue-form
                    :form-config="formFieldForm"
                    :form-data="field"
                    :use-json-api="useJsonApi"
                    :form-submit-url="formUrl"
                    @cancel-form="showForm = false"
                ></vue-form>
            </div>
        </transition>
    </div>
</template>
<script>
    import { faBars, faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons'
    import Modal from './Modal';
    export default {

        inject: {
            useJsonApi: {
                default: false,
            }
        },

        components: {
            Modal
        },

        props: {
            field: {
                required: true,
                type: Object
            },
            formConfigurationId: {
                required: true,
                type: Number,
            }
        },

        data() {
            return {
                icons: {
                    handle: faBars,
                    formClosed: faChevronRight,
                    formOpen: faChevronDown
                },
                showForm: false,
            }
        },


        computed: {
            formUrl() {
                return window.formAdmin.apiAdminPrefix + '/form_configurations/' + this.formConfigurationId + '/form_fields';
            },
            formFieldForm() {
                return this.$store.getters["form_admin/getFormConfigByName"]('form_field_form');
            },
        }

    }
</script>
<style>
    .slide-enter-active {
        -moz-transition-duration: 0.2s;
        -webkit-transition-duration: 0.2s;
        -o-transition-duration: 0.2s;
        transition-duration: 0.2s;
        -moz-transition-timing-function: ease-in;
        -webkit-transition-timing-function: ease-in;
        -o-transition-timing-function: ease-in;
        transition-timing-function: ease-in;
    }

    .slide-leave-active {
        -moz-transition-duration: 0.2s;
        -webkit-transition-duration: 0.2s;
        -o-transition-duration: 0.2s;
        transition-duration: 0.2s;
        -moz-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
        -webkit-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
        -o-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
        transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
    }

    .slide-enter-to, .slide-leave {
        max-height: 100px;
        overflow: hidden;
    }

    .slide-enter, .slide-leave-to {
        overflow: hidden;
        max-height: 0;
    }
</style>
