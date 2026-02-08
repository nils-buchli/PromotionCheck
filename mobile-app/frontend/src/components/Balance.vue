<template>
    <h4>Balance</h4>
    <h1 id="balance">${{ transactionStore.getBalance }}</h1>
</template>

<script setup>
    import { useTransactionsStore } from '../stores/transactions'

    const transactionStore = useTransactionsStore()
</script>