<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>{{ isEdit ? '编辑卡片' : '新建卡片' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>标题</label>
          <input 
            v-model="form.title" 
            type="text" 
            placeholder="输入卡片标题..."
            required
            autofocus
          />
        </div>
        <div class="form-group">
          <label>内容</label>
          <textarea 
            v-model="form.content" 
            placeholder="输入卡片内容..."
            rows="6"
            required
          ></textarea>
        </div>
        <div class="form-group">
          <label>标签（用逗号或空格分隔）</label>
          <input 
            v-model="tagsInput" 
            type="text" 
            placeholder="例如：Vue, JavaScript, 前端"
          />
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">取消</button>
          <button type="submit" class="btn btn-primary">{{ isEdit ? '保存' : '创建' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  card: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'submit'])

const isEdit = computed(() => !!props.card)

const form = ref({
  title: '',
  content: ''
})

const tagsInput = ref('')

watch(() => props.card, (newCard) => {
  if (newCard) {
    form.value.title = newCard.title
    form.value.content = newCard.content
    tagsInput.value = newCard.tags.join(', ')
  } else {
    form.value.title = ''
    form.value.content = ''
    tagsInput.value = ''
  }
}, { immediate: true })

const parseTags = (input) => {
  if (!input.trim()) return []
  return input
    .split(/[,，\s]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0)
}

const handleSubmit = () => {
  if (!form.value.title.trim() || !form.value.content.trim()) return
  
  emit('submit', {
    ...form.value,
    tags: parseTags(tagsInput.value)
  })
}
</script>
