<template>
    <div>
        <nav class="bg-gray-800" @keydown.window.esc="navOpen = false">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center">
                        <div class="hidden md:block">
                            <div class="ml-10 flex items-baseline">
                                <router-link
                                    :to="{name: 'formAdmin.home'}"
                                    class="px-3 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:text-white focus:bg-gray-700"
                                    active-class="bg-gray-900"
                                    exact
                                >
                                    Dashboard
                                </router-link>
                                <router-link
                                    :to="{ name: 'formAdmin.form_configurations.create'}"
                                    class="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                                    active-class="bg-gray-900"
                                >
                                    <font-awesome-icon :icon="faPlus"></font-awesome-icon>&nbsp;Create Form Configuration
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="hidden md:hidden">
                <div class="px-2 pt-2 pb-3 sm:px-3">
                    <a href="#" class="block px-3 py-2 rounded-md text-base font-medium text-white bg-gray-900 focus:outline-none focus:text-white focus:bg-gray-700">Dashboard</a>
                </div>
            </div>
        </nav>
        <header class="bg-white shadow">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 class="text-3xl font-bold leading-tight text-gray-900">
                    {{ $route.meta.title || 'Form Admin Dashboard'}}
                </h1>
            </div>
        </header>
        <main>
            <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div class="px-4 py-6 sm:px-0">
                    <router-view></router-view>
                </div>
            </div>
        </main>
    </div>
</template>
<script>
    import { mapState, mapGetters, mapActions } from 'vuex';
    import { mixin as clickaway } from 'vue-clickaway';
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
    import { faPlus } from '@fortawesome/free-solid-svg-icons'
    export default {

        mixins: [clickaway],

        components: {
            FontAwesomeIcon
        },

        beforeRouteUpdate(to, from) {

            console.log(to);

        },

        data() {
            return {
                navOpen: false,
                faPlus
            }
        },

        computed: {
            ...mapState('form_admin', [
                'form_configurations'
            ])
        },

        methods: {
            closeNav() {
                this.navOpen = false;
            }
        }

    }
</script>
