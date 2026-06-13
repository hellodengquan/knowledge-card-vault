import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sortCards, processEbbinghaus, isOverDue, statusOrder, MASTERED_EXPIRE_DAYS } from '../src/composables/useCards'

describe('卡片排序功能', () => {
  it('按掌握度倒序时，未掌握卡片排在已掌握卡片之后', () => {
    const cards = [
      { id: '1', title: '新卡片', status: 'new', tags: [], updatedAt: '2024-01-01T00:00:00.000Z' },
      { id: '2', title: '已掌握', status: 'reviewed', tags: [], updatedAt: '2024-01-02T00:00:00.000Z' },
      { id: '3', title: '学习中', status: 'learning', tags: [], updatedAt: '2024-01-03T00:00:00.000Z' },
    ]

    const sorted = sortCards(cards, 'mastery')

    expect(sorted[0].id).toBe('2')
    expect(sorted[1].id).toBe('3')
    expect(sorted[2].id).toBe('1')

    expect(statusOrder[sorted[0].status]).toBeGreaterThan(statusOrder[sorted[1].status])
    expect(statusOrder[sorted[1].status]).toBeGreaterThan(statusOrder[sorted[2].status])
  })
})

describe('艾宾浩斯记忆曲线提醒', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('mastered_at 超过14天的已掌握卡片在列表中降级回学习中', () => {
    const now = new Date('2024-01-20T00:00:00.000Z')
    vi.setSystemTime(now)

    const oldMasteredDate = new Date(now)
    oldMasteredDate.setDate(oldMasteredDate.getDate() - (MASTERED_EXPIRE_DAYS + 1))

    const cards = [
      {
        id: '1',
        title: '过期卡片',
        status: 'reviewed',
        mastered_at: oldMasteredDate.toISOString(),
        tags: [],
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        title: '正常卡片',
        status: 'reviewed',
        mastered_at: '2024-01-19T00:00:00.000Z',
        tags: [],
        updatedAt: '2024-01-19T00:00:00.000Z'
      }
    ]

    expect(isOverDue(cards[0])).toBe(true)
    expect(isOverDue(cards[1])).toBe(false)

    const processed = processEbbinghaus(cards)

    expect(processed[0].status).toBe('learning')
    expect(processed[0].mastered_at).toBe(oldMasteredDate.toISOString())

    expect(console.log).toHaveBeenCalledWith('ebbinghaus_reminder', expect.objectContaining({
      id: '1',
      oldStatus: 'reviewed',
      newStatus: 'learning'
    }))
  })

  it('未超过14天的已掌握卡片保持已掌握状态', () => {
    const now = new Date('2024-01-20T00:00:00.000Z')
    vi.setSystemTime(now)

    const recentMasteredDate = new Date(now)
    recentMasteredDate.setDate(recentMasteredDate.getDate() - (MASTERED_EXPIRE_DAYS - 1))

    const cards = [
      {
        id: '1',
        title: '近期掌握',
        status: 'reviewed',
        mastered_at: recentMasteredDate.toISOString(),
        tags: [],
        updatedAt: recentMasteredDate.toISOString()
      }
    ]

    expect(isOverDue(cards[0])).toBe(false)

    const processed = processEbbinghaus(cards)

    expect(processed[0].status).toBe('reviewed')
    expect(processed[0].mastered_at).toBe(recentMasteredDate.toISOString())
    expect(console.log).not.toHaveBeenCalledWith('ebbinghaus_reminder', expect.anything())
  })
})
