<template>
    <h3>History</h3>
    <ul id="list" class="list">
        <li v-for="transaction in transactionStore.transactions" 
            :key="transaction.id"
            :class="transaction.amount < 0 ? 'minus' : 'plus'">
            {{ transaction.text }} <span>${{ transaction.amount }}</span> 
            <button @click="deleteTransaction(transaction.id)" class="delete-btn">x</button>
        </li>
    </ul>
</template>

<script setup>
    import { useTransactionsStore } from '../stores/transactions'
    
    const transactionStore = useTransactionsStore()

    function deleteTransaction(id) {
        transactionStore.deleteTransaction(id)
    }

</script>