import { defineStore } from 'pinia'
import {Transaction} from '../models/transaction'

export const useTransactionsStore = defineStore('transactions', {
    state : () => ({
        transactions: [
            new Transaction({id: 1, text: "Cash", amount: 200})
        ], 
        currentId: 0
    }), 

    getters: {
        getBalance: (state) => {
            let sum = 0
            for (let t of state.transactions) {
                sum += t.amount
            }

            return sum
        }, 

        getExpenses: (state) => {
            let sums = {positive: 0, negative: 0}
            for (let t of state.transactions) {
                if (t.amount < 0) {
                    sums.negative += t.amount
                } else {
                    sums.positive += t.amount
                }
            }
            return sums 
        }
    },

    actions: {
        addTransaction(text, amount) {
            this.transactions.push(
                new Transaction({id: this.currentId, text: text, amount: amount})
            )
            this.currentId++ 
        }, 
        deleteTransaction(id) {
            this.transactions = this.transactions.filter(t => t.id !== id)
        }
    }

})