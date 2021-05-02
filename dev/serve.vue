<script lang="ts">
import { defineComponent } from 'vue';
// Uncomment import and local "components" registration if library is not registered globally.
// import { LaravelVueFormsSample } from '@/entry.esm';

export default defineComponent({
  name: 'ServeDev',
  // components: {
  //  LaravelVueFormsSample,
  // }
});
</script>

<template>
  <div id="app">
    <laravel-vue-forms-sample />
  </div>
</template>
