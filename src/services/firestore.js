import { collection, addDoc, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'

const usersCol = (uid) => collection(db, 'users', uid, 'meta')
const clientsCol = (uid) => collection(db, 'clients')
const budgetsCol = (uid) => collection(db, 'budgets')

export async function createBudget(uid, data) {
  const docRef = await addDoc(budgetsCol(uid), {
    ...data,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateBudget(id, data) {
  const ref = doc(db, 'budgets', id)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

export async function deleteBudget(id) {
  const ref = doc(db, 'budgets', id)
  await deleteDoc(ref)
}

export async function getBudgetsByUser(uid) {
  const q = query(collection(db, 'budgets'), where('userId', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
