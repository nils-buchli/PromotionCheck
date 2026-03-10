import { createRouter, createWebHistory } from 'vue-router'

import { useYearStore } from '../stores/years'
import { useSubjectStore } from '../stores/subjects'

import YearsView from '../views/YearsView.vue'
import SubjectsView from '../views/SubjectsView.vue'
import GradesView from '../views/GradesView.vue'
import Error from '../components/Error.vue'
import AddYearView from '../views/AddYearView.vue'
import AddSubjectView from '../views/AddSubjectView.vue'
import AddGradeView from '../views/AddGradeView.vue'
import SubSubjectsView from '../views/SubSubjectsView.vue'
import { useSubSubjectStore } from '../stores/subsubjects'
import UserView from '../views/UserView.vue'
import { useGlobalStatesStore } from '../stores/globalStates'
import AnalyticsView from '../views/AnalyticsView.vue'

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
    path: '/subjects/:yearId', 
    name: 'subjects', 
    component: SubjectsView, 
    props: true, 
  }, 
  {
    path: '/sub-subjects/:subjectId', 
    name: 'subSubjects', 
    component: SubSubjectsView, 
    props: true
  }, 
  {
    path: '/grades/:subjectId', 
    name: 'grades', 
    component: GradesView, 
    props: true, 
  }, 
  {
    path: '/add-year', 
    name: 'addYear', 
    component: AddYearView
  },
  {
    path: '/add-subject/:yearId', 
    name: 'addSubject', 
    component: AddSubjectView, 
    props: true, 
  }, 
  {
    path: '/add-sub-subject/:subjectId', 
    name: 'addSubSubject', 
    component: AddSubjectView, 
    props: true
  }, 
  {
    path: '/add-grade/:subjectId', 
    name: 'addGrade', 
    component: AddGradeView, 
    props: true, 
  }, 
  {
    path: '/user', 
    name: 'user', 
    component: UserView, 
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: AnalyticsView
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

router.beforeEach(async (to) => {
  const globalStateStore = useGlobalStatesStore()

  while (!globalStateStore.initComplete) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  const yearStore = useYearStore()
  const subjectStore = useSubjectStore()
  const subSubjectStore = useSubSubjectStore()
  
  if (to.params.yearId) {
    if (!Object.hasOwn(yearStore.yearsById, to.params.yearId)) {
      return { 
        name: 'error', 
        query: {m: 'Invalid Year Id.'} 
    }
    }
  }

  if (to.name == 'subSubjects') {
    if (!Object.hasOwn(subjectStore.subjectsById, to.params.subjectId)) {
      return {
        name: 'error', 
        query: {m: 'Invalid Subsubject Id.'}
      }
    }
  }

    if (to.name == 'grades') {
      if (!(Object.hasOwn(subjectStore.subjectsById, to.params.subjectId) || Object.hasOwn(subSubjectStore.subSubjectById, to.params.subjectId))) {
        return {
          name: 'error', 
          query: {m: 'Invalid Subject Id.'}
        }
      }
  }
})

export default router
