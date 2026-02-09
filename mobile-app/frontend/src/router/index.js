import { createRouter, createWebHistory } from 'vue-router'

import YearsView from '../views/YearsView.vue'
import SubjectsView from '../views/SubjectsView.vue'
import GradesView from '../views/GradesView.vue'
import { useSubjectStore } from '../stores/subjects'
import Error from '../components/Error.vue'
import { useGradeStore } from '../stores/grades'

const routes = [
  {
    path: '/', 
    redirect: (to) => ({
        name: 'years', 
        params: {}
    })
  }, 
  {
    path: '/years',
    name: 'years',
    component: YearsView,
  },
  {
    path: '/subjects/:yearsId', 
    name: 'subjects', 
    component: SubjectsView, 
    props: true, 
    beforeEnter: (to) => {
        const subjectStore = useSubjectStore()
        if (!Object.hasOwn(subjectStore.subjectsByYear, to.params.yearId)) {
            return {
                name: "error", 
                query: {
                    m: "Invalid Year.", 
                }
            }
        }
    }
  }, 
  {
    path: '/grades/:subjectId', 
    name: 'grades', 
    component: GradesView, 
    props: true, 
    beforeEnter: (to) => {
        const gradeStore = useGradeStore()
        if (!Object.hasOwn(gradeStore.gradesBySubject, to.params.subjectId)) {
            return {
                name: "error", 
                query: {
                    m: "Invalid Subject."
                }
            }
        }
    }
  }, 
  {
    path: '/error', 
    name: 'error', 
    component: Error
  }, 
  {
      path: '/:pathMatch(.*)*',
      redirect: to => ({
        name: 'error', 
        query: {
            m: '404'
        }, 
        params: {}
      })
   }

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


export default router
