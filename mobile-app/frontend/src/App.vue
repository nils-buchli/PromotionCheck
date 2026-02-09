<template>
  <div class="min-h-screen flex flex-col">
    <AppBar />
    <router-view />
    <BottomBar />
  </div>
</template>

<script setup>
  import AppBar from './components/AppBar.vue'
  import BottomBar from './components/BottomBar.vue'
  import ElementList from './components/ElementList.vue'
  
  import Header from './components/Header.vue'; 
  import Balance from './components/Balance.vue';
  import IncomeExpenses from './components/IncomeExpenses.vue';
  import TransactionList from './components/TransactionList.vue';
  import AddTransaction from './components/AddTransaction.vue'; 
</script>