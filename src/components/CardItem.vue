<template>
  <div class="card-item" :class="card.status">
    <div class="card-header">
      <h3 class="card-title">{{ card.title }}</h3>
      <div class="card-actions">
        <button class="btn-icon" @click="$emit('edit', card)" title="编辑">✏️</button>
        <button class="btn-icon" @click="$emit('delete', card.id)" title="删除">🗑️</button>
      </div>
    </div>
    <div class="card-content">{{ card.content }}</div>
    <div class="card-tags" v-if="card.tags.length">
      <span class="tag" v-for="tag in card.tags" :key="tag">#{{ tag }}</span>
    </div>
    <div class="card-footer">
      <div class="status-badge" :class="card.status">
        {{ statusText }}
      </div>
      <div class="card-meta">
        <span>复习 {{ card.reviewCount }} 次</span>
      </div>
      <div class="status-actions">
        <button 
          class="btn-status new" 
          :class="{ active: card.status === 'new' }"
          @click="$emit('update-status', card.id, 'new')"
        >新的</button>
        <button 
          class="btn-status learning" 
          :class="{ active: card.status === 'learning' }"
          @click="$emit('update-status', card.id, 'learning')"
        >学习中</button>
        <button 
          class="btn-status reviewed" 
          :class="{ active: card.status === 'reviewed' }"
          @click="$emit('update-status', card.id, 'reviewed')"
        >已掌握</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete', 'update-status'])

const statusText = computed(() => {
  const map = {
    new: '🆕 新卡片',
    learning: '📖 学习中',
    reviewed: '✅ 已掌握'
  }
  return map[props.card.status] || '🆕 新卡片'
})
</script>
