import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'knowledge-card-vault'
export const MASTERED_EXPIRE_DAYS = 14

export const statusOrder = {
  reviewed: 3,
  learning: 2,
  new: 1
}

export function isOverDue(card) {
  if (!card.mastered_at || card.status !== 'reviewed') return false
  const masteredDate = new Date(card.mastered_at)
  const now = new Date()
  const diffDays = (now - masteredDate) / (1000 * 60 * 60 * 24)
  return diffDays > MASTERED_EXPIRE_DAYS
}

export function processEbbinghaus(cardList) {
  return cardList.map(card => {
    if (isOverDue(card)) {
      const newCard = { ...card }
      newCard.status = 'learning'
      newCard.updatedAt = new Date().toISOString()
      console.log('ebbinghaus_reminder', {
        id: card.id,
        title: card.title,
        oldStatus: 'reviewed',
        newStatus: 'learning',
        mastered_at: card.mastered_at
      })
      return newCard
    }
    return card
  })
}

export function sortCards(cardList, sortBy) {
  const list = [...cardList]
  switch (sortBy) {
    case 'updatedAt':
      return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    case 'mastery':
      return list.sort((a, b) => statusOrder[b.status] - statusOrder[a.status])
    case 'tagCount':
      return list.sort((a, b) => b.tags.length - a.tags.length)
    default:
      return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }
}

export function needsReview(card) {
  return card.status === 'learning' && card.mastered_at !== null
}

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveToStorage(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}

const cards = ref(loadFromStorage())

watch(cards, (newCards) => {
  saveToStorage(newCards)
}, { deep: true })

export function useCards() {
  const allTags = computed(() => {
    const tagSet = new Set()
    cards.value.forEach(card => {
      card.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

  const addCard = (cardData) => {
    const newCard = {
      id: Date.now().toString(),
      title: cardData.title,
      content: cardData.content,
      tags: cardData.tags || [],
      status: 'new',
      reviewCount: 0,
      mastered_at: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    cards.value.unshift(newCard)
  }

  const updateCard = (id, cardData) => {
    const index = cards.value.findIndex(c => c.id === id)
    if (index !== -1) {
      cards.value[index] = {
        ...cards.value[index],
        ...cardData,
        updatedAt: new Date().toISOString()
      }
    }
  }

  const deleteCard = (id) => {
    cards.value = cards.value.filter(c => c.id !== id)
  }

  const updateStatus = (id, status) => {
    const card = cards.value.find(c => c.id === id)
    if (card) {
      card.status = status
      if (status === 'reviewed') {
        card.reviewCount++
        card.mastered_at = new Date().toISOString()
      } else if (status === 'new') {
        card.mastered_at = null
      }
      card.updatedAt = new Date().toISOString()
    }
  }

  const stats = computed(() => {
    const total = cards.value.length
    const newCount = cards.value.filter(c => c.status === 'new').length
    const learningCount = cards.value.filter(c => c.status === 'learning').length
    const reviewedCount = cards.value.filter(c => c.status === 'reviewed').length
    return { total, new: newCount, learning: learningCount, reviewed: reviewedCount }
  })

  return {
    cards,
    allTags,
    stats,
    addCard,
    updateCard,
    deleteCard,
    updateStatus,
    isOverDue,
    processEbbinghaus,
    sortCards,
    needsReview,
    MASTERED_EXPIRE_DAYS
  }
}
