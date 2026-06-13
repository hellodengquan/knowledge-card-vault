<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <h1>📚 知识卡片库</h1>
        <p class="subtitle">轻量级知识管理，卡片 + 标签 + 复习</p>
      </div>
      <button class="btn btn-primary btn-add" @click="openCreateModal">
        ➕ 新建卡片
      </button>
    </header>

    <main class="app-main">
      <aside class="sidebar">
        <TagFilter
          :tags="allTags"
          v-model:tags="selectedTags"
          v-model:status="statusFilter"
          v-model:search="searchText"
          :stats="stats"
        />
      </aside>

      <section class="card-list">
        <div class="list-header">
          <h2>卡片列表 ({{ filteredCards.length }})</h2>
          <div class="sort-controls">
            <label for="sort-select">排序：</label>
            <select id="sort-select" v-model="sortBy" class="sort-select">
              <option value="updatedAt">按更新时间倒序</option>
              <option value="mastery">按掌握度倒序</option>
              <option value="tagCount">按标签数倒序</option>
            </select>
          </div>
        </div>
        
        <div class="cards-container" v-if="filteredCards.length">
          <CardItem
            v-for="card in filteredCards"
            :key="card.id"
            :card="card"
            @edit="openEditModal"
            @delete="handleDelete"
            @update-status="updateStatus"
          />
        </div>
        
        <div class="empty-state" v-else>
          <div class="empty-icon">📭</div>
          <h3>暂无卡片</h3>
          <p v-if="searchText || selectedTags.length || statusFilter !== 'all'">
            没有找到匹配的卡片，试试调整筛选条件
          </p>
          <p v-else>点击右上角「新建卡片」开始添加你的第一张知识卡片吧！</p>
          <button 
            class="btn btn-primary" 
            v-if="!searchText && !selectedTags.length && statusFilter === 'all'"
            @click="openCreateModal"
          >
            创建第一张卡片
          </button>
        </div>
      </section>
    </main>

    <CardForm
      v-if="showModal"
      :card="editingCard"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCards } from './composables/useCards'
import CardItem from './components/CardItem.vue'
import CardForm from './components/CardForm.vue'
import TagFilter from './components/TagFilter.vue'

const { 
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
  needsReview
} = useCards()

const showModal = ref(false)
const editingCard = ref(null)
const selectedTags = ref([])
const statusFilter = ref('all')
const searchText = ref('')
const sortBy = ref('updatedAt')

const filteredCards = computed(() => {
  let result = cards.value
  
  result = processEbbinghaus(result)
  
  if (statusFilter.value !== 'all') {
    result = result.filter(c => c.status === statusFilter.value)
  }
  
  if (selectedTags.value.length > 0) {
    result = result.filter(c => 
      selectedTags.value.some(tag => c.tags.includes(tag))
    )
  }
  
  if (searchText.value.trim()) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(c => 
      c.title.toLowerCase().includes(keyword) || 
      c.content.toLowerCase().includes(keyword)
    )
  }
  
  result = sortCards(result, sortBy.value)
  
  return result
})

const openCreateModal = () => {
  editingCard.value = null
  showModal.value = true
}

const openEditModal = (card) => {
  editingCard.value = card
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCard.value = null
}

const handleSubmit = (formData) => {
  if (editingCard.value) {
    updateCard(editingCard.value.id, formData)
  } else {
    addCard(formData)
  }
  closeModal()
}

const handleDelete = (id) => {
  if (confirm('确定要删除这张卡片吗？')) {
    deleteCard(id)
  }
}
</script>
