<script lang="ts">
import {computed, defineComponent, getCurrentInstance} from 'vue';
import { useRoute } from "vue-router";
import Logo from "./components/Logo.vue";
// Uncomment import and local "components" registration if library is not registered globally.
// import { LaravelVueFormsSample } from '@/entry.esm';

import store from './store/store';
import { authModule } from "./store/authStore";

export default defineComponent({
  name: 'ServeDev',
  components: {Logo},

  setup() {
    const route = useRoute();
    /** @ts-ignore **/
    const globalProperties = getCurrentInstance().appContext.config.globalProperties;

    let authModule = store.getModule('auth') as authModule;
    const setUpSession = async () => {
      await authModule.login();
    }

    const getUser = async () => {
      await authModule.getUser();
      globalProperties.$notify.success('Successfully got user!', 'Success');
    }

    let hasAuth = computed(() => {
      return authModule.hasAuth
    })

    return {
      route,
      hasAuth,
      setUpSession,
      getUser
    };
  }
});
</script>

<template>
  <div id="app" class="flex flex-wrap bg-gray-200 w-full h-screen">
    <div class="w-3/12 bg-white rounded p-3 shadow-lg">
      <div class="flex items-center space-x-4 p-2 mb-5">
        <logo></logo>
        <div>
          <h4 class="font-semibold text-lg text-gray-700 capitalize font-poppins tracking-wide">Laravel Vue Forms</h4>
          <div class="text-sm tracking-wide flex items-center space-x-1">
            <div v-if="hasAuth">
              <svg class="h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span class="text-gray-600">Has Login Session</span>
            </div>
            <div v-else class="text-center">
              <div class="flex justify-between">
                <svg class="h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M13 15.5a1 1 0 11-2 0 1 1 0 012 0zm-.25-8.25a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5z"/><path fill-rule="evenodd" d="M11.46.637a1.75 1.75 0 011.08 0l8.25 2.675A1.75 1.75 0 0122 4.976V10c0 6.19-3.77 10.705-9.401 12.83a1.699 1.699 0 01-1.198 0C5.771 20.704 2 16.19 2 10V4.976c0-.76.49-1.43 1.21-1.664L11.46.637zm.617 1.426a.25.25 0 00-.154 0L3.673 4.74a.249.249 0 00-.173.237V10c0 5.461 3.28 9.483 8.43 11.426a.2.2 0 00.14 0C17.22 19.483 20.5 15.46 20.5 10V4.976a.25.25 0 00-.173-.237l-8.25-2.676z"/>
                </svg>
                <span class="text-gray-600 ml-2">Missing Login Session</span>
              </div>
              <button class="p-1 bg-blue-300" @click="setUpSession">
                Get Login Session
              </button>
            </div>
          </div>
          <button class="p-1 bg-gray-300" @click="getUser">Get User</button>
        </div>
      </div>
      <ul class="space-y-2 text-sm">
        <li>
          <router-link to="/" class="flex items-center space-x-3 text-gray-700 p-2 rounded-md font-medium hover:bg-gray-200 focus:shadow-outline" active-class="bg-gray-200">
                    <span class="text-gray-600">
                        <svg class="h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </span>
            <span>Dashboard</span>
          </router-link>
        </li>
        <li>
          <router-link to="/404" class="flex items-center space-x-3 text-gray-700 p-2 rounded-md font-medium hover:bg-gray-200 focus:shadow-outline" active-class="bg-gray-200">
                    <span class="text-gray-600">
                        <svg class="h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </span>
            <span>404</span>
          </router-link>
        </li>
      </ul>
    </div>
    <div class="w-9/12">
      <div class="w-full h-12 bg-white flex flex-col justify-center items-center">
        <h1>{{ route.meta.title }}</h1>
      </div>
      <router-view class="p-2"></router-view>
    </div>
  </div>
</template>
