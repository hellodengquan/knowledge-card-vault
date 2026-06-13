import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'knowledge-card-vault'

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
    updateStatus
  }
}
