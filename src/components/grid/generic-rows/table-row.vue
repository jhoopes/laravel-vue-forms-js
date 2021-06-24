<template>
    <tr>
        <td v-for="value in record" :key="value" class="px-2">
            {{ value }}
        </td>
    </tr>
</template>
<script lang="ts">
import { defineComponent, toRefs } from "vue";
export default defineComponent({
    props: {
        record: {
            type: [Object, Array],
            required: true,
        },
        baseRecordId: {
            type: Number,
            default: 0,
        },
    },

    setup(props) {
        return toRefs(props);
    },
});
</script>
