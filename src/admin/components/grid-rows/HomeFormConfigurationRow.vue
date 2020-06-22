<template>
    <tr>
        <td class="px-4 py-2">
            {{ record.name }}
        </td>
        <td class="px-4 py-2">
            {{ record.type }}
        </td>
        <td class="px-4 py-2">
            <font-awesome-icon v-if="record.active" :icon="checkIcon"></font-awesome-icon>
            <span v-else>-</span>
        </td>
        <td class="px-4 py-2">
            {{ record.entity_name }}
        </td>
        <td class="px-4 py-2">
            {{ record.entity_model }}
        </td>
        <td class="px-4 py-2">
            {{ created }}
        </td>
        <td class="px-4 py-2">
            {{ updated }}
        </td>
        <td class="px-4 py2 cursor-pointer" @click="$router.push({name: 'formAdmin.form_configurations.edit', params: {id: record.id}})">
            <font-awesome-icon :icon="editIcon"></font-awesome-icon>
        </td>
    </tr>
</template>
<script>
    import moment from 'moment'
    import { faEdit, faCheck } from '@fortawesome/free-solid-svg-icons';
    export default {


        props: {
            record: {
                required: true,
                type: Object,
            }
        },

        data() {
            return {
                editIcon: faEdit,
                checkIcon: faCheck
            }
        },

        computed:{

            created() {
                return moment.utc(this.record.created_at).local().format('MM/DD/YYYY h:mm a')
            },
            updated() {
                return moment.utc(this.record.updated_at).local().format('MM/DD/YYYY h:mm a')
            }
        }

    }
</script>
