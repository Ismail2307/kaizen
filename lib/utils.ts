import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return formatDate(date)
}

export function getXpForLevel(level: number): number {
  return 100 * level * level
}

export function getLeague(level: number): string {
  if (level >= 50) return 'Diamond'
  if (level >= 30) return 'Platinum'
  if (level >= 15) return 'Gold'
  if (level >= 5) return 'Silver'
  return 'Bronze'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-emerald-400 bg-emerald-400/10'
    case 'active': return 'text-emerald-400 bg-emerald-400/10'
    case 'on_track': return 'text-emerald-400 bg-emerald-400/10'
    case 'in_progress': return 'text-kaizen-400 bg-kaizen-400/10'
    case 'pending': return 'text-slate-400 bg-slate-400/10'
    case 'paused': return 'text-amber-400 bg-amber-400/10'
    case 'at_risk': return 'text-yellow-400 bg-yellow-400/10'
    case 'behind': return 'text-red-400 bg-red-400/10'
    case 'archived': return 'text-slate-500 bg-slate-500/10'
    default: return 'text-slate-400 bg-slate-400/10'
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'tiny': return 'text-slate-400'
    case 'easy': return 'text-emerald-400'
    case 'medium': return 'text-kaizen-400'
    case 'hard': return 'text-amber-400'
    case 'epic': return 'text-red-400'
    default: return 'text-slate-400'
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20'
    case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
  }
}
