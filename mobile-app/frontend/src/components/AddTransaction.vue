<template>
    <h3>Add new transaction</h3>
    <form id="form" @submit.prevent="onSubmit">
        <div class="form-control">
            <label for="text">Text</label>
            <input v-model="text" autocomplete="off" type="text" id="text" placeholder="Enter text...">
        </div>
        <div class="form-control">
            <label for="amount">
                Amount <br/> (negative - expense, positive - income)
            </label>
            <input v-model.number="amount" type="number" id="amount" placeholder="Enter amount...">
            <button class="btn">Add transaction</button>
        </div>
    </form>
</template>

<script setup>
    import { ref } from 'vue'
    import { useTransactionsStore } from '../stores/transactions'

    const text = ref('')
    const amount = ref(null)

    const transactionStore = useTransactionsStore()

    function onSubmit() {
        if (!text.value || amount.value === null) 
            return 

        transactionStore.addTransaction(text.value, amount.value)

        text.value = ''
        amount.value = null
    }

</script>