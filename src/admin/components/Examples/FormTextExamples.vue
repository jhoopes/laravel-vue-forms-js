<template>
    <div>
          <div class="flex justify-around">
            <form-text
            label=""
            field-name="first-text-field"
            v-model="text.first"
        ></form-text>
        <div class="pre">
            {{ text.first }}
        </div>
       </div>
    </div>
</template>
<script>
export default {

    data() {
       return {
            text: {
                first: null
            }
       }
    }
}
</script>
