<template>
  <div class="tag-filter">
    <div class="filter-section">
      <h4>状态筛选</h4>
      <div class="filter-buttons">
        <button 
          class="filter-btn" 
          :class="{ active: statusFilter === 'all' }"
          @click="$emit('update:status', 'all')"
        >全部 ({{ stats.total }})</button>
        <button 
          class="filter-btn new" 
          :class="{ active: statusFilter === 'new' }"
          @click="$emit('update:status', 'new')"
        >新卡片 ({{ stats.new }})</button>
        <button 
          class="filter-btn learning" 
          :class="{ active: statusFilter === 'learning' }"
          @click="$emit('update:status', 'learning')"
        >学习中 ({{ stats.learning }})</button>
        <button 
          class="filter-btn reviewed" 
          :class="{ active: statusFilter === 'reviewed' }"
          @click="$emit('update:status', 'reviewed')"
        >已掌握 ({{ stats.reviewed }})</button>
      </div>
    </div>
    <div class="filter-section">
      <h4>标签筛选</h4>
      <div class="tag-list" v-if="tags.length">
        <button 
          class="tag-btn" 
          :class="{ active: selectedTags.length === 0 }"
          @click="$emit('update:tags', [])"
        >全部标签</button>
        <button 
          v-for="tag in tags" 
          :key="tag"
          class="tag-btn"
          :class="{ active: selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >#{{ tag }}</button>
      </div>
      <p class="empty-tags" v-else>暂无标签，创建卡片时添加标签吧～</p>
    </div>
    <div class="filter-section">
      <h4>搜索</h4>
      <input 
        type="text" 
        class="search-input"
        :value="searchText"
        @input="$emit('update:search', $event.target.value)"
        placeholder="搜索标题或内容..."
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  },
  selectedTags: {
    type: Array,
    default: () => []
  },
  statusFilter: {
    type: String,
    default: 'all'
  },
  searchText: {
    type: String,
    default: ''
  },
  stats: {
    type: Object,
    default: () => ({ total: 0, new: 0, learning: 0, reviewed: 0 })
  }
})

const emit = defineEmits(['update:tags', 'update:status', 'update:search'])

const toggleTag = (tag) => {
  const newTags = props.selectedTags.includes(tag)
    ? props.selectedTags.filter(t => t !== tag)
    : [...props.selectedTags, tag]
  emit('update:tags', newTags)
}
</script>
