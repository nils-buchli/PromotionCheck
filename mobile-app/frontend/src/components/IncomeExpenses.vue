<template>
    <div class="inc-exp-container">
        <div>
            <h4>Income</h4>
            <p id="money-plus" class="money plus">${{ expenses.positive }}</p>
        </div>
        <div>
            <h4>Expense</h4>
            <p id="money-minus" class="money minus">${{ expenses.negative }}</p>
        </div>
    </div>
</template>

<script setup>
    import { storeToRefs } from 'pinia'
    import { useTransactionsStore } from '../stores/transactions'

    const transactionStore = useTransactionsStore()
    const {getExpenses: expenses} = storeToRefs(transactionStore)
</script>