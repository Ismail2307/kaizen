"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Goal, Milestone, Task } from "@/types"

// ============================================
// GOALS
// ============================================

export async function createGoal(data: {
  title: string
  description?: string
  category?: string
  priority?: string
  deadline?: string
  target_value?: number
  unit?: string
  color?: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: goal, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      priority: data.priority || "medium",
      deadline: data.deadline || null,
      target_value: data.target_value || 100,
      unit: data.unit || null,
      color: data.color || "#8b5cf6",
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/goals")
  revalidatePath("/dashboard")
  return goal
}

export async function updateGoal(id: string, data: Partial<Goal>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("goals")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/goals")
  revalidatePath("/dashboard")
  revalidatePath(`/goals/${id}`)
}

export async function deleteGoal(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/goals")
  revalidatePath("/dashboard")
}

export async function completeGoal(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("goals")
    .update({
      status: "completed",
      progress: 100,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)

  // Award XP for completing goal
  await supabase.rpc("add_xp", {
    p_user_id: user.id,
    p_amount: 100,
    p_source: "goal",
    p_source_id: id,
    p_description: "Completed goal",
  })

  revalidatePath("/goals")
  revalidatePath("/dashboard")
  revalidatePath(`/goals/${id}`)
}

// ============================================
// MILESTONES
// ============================================

export async function createMilestone(data: {
  goal_id: string
  title: string
  description?: string
  order_index?: number
  deadline?: string
  xp_reward?: number
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: milestone, error } = await supabase
    .from("milestones")
    .insert({
      goal_id: data.goal_id,
      user_id: user.id,
      title: data.title,
      description: data.description || null,
      order_index: data.order_index || 0,
      deadline: data.deadline || null,
      xp_reward: data.xp_reward || 25,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/goals/${data.goal_id}`)
  revalidatePath("/dashboard")
  return milestone
}

export async function updateMilestone(id: string, data: Partial<Milestone>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("milestones")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/goals")
  revalidatePath("/dashboard")
}

export async function deleteMilestone(id: string, goalId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath(`/goals/${goalId}`)
  revalidatePath("/dashboard")
}

export async function completeMilestone(id: string, goalId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: milestone } = await supabase
    .from("milestones")
    .select("xp_reward")
    .eq("id", id)
    .single()

  const { error } = await supabase
    .from("milestones")
    .update({
      status: "completed",
      progress: 100,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)

  // Award XP
  await supabase.rpc("add_xp", {
    p_user_id: user.id,
    p_amount: milestone?.xp_reward || 25,
    p_source: "milestone",
    p_source_id: id,
    p_description: "Completed milestone",
  })

  // Update goal progress
  await recalculateGoalProgress(goalId)

  revalidatePath(`/goals/${goalId}`)
  revalidatePath("/dashboard")
}

// ============================================
// TASKS
// ============================================

export async function createTask(data: {
  title: string
  description?: string
  goal_id?: string
  milestone_id?: string
  priority?: string
  difficulty?: string
  deadline?: string
  estimated_duration?: number
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const difficultyXp: Record<string, number> = {
    tiny: 5, easy: 10, medium: 25, hard: 50, epic: 100,
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      goal_id: data.goal_id || null,
      milestone_id: data.milestone_id || null,
      title: data.title,
      description: data.description || null,
      priority: data.priority || "medium",
      difficulty: data.difficulty || "easy",
      deadline: data.deadline || null,
      estimated_duration: data.estimated_duration || null,
      xp_reward: difficultyXp[data.difficulty || "easy"] || 10,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  if (data.goal_id) revalidatePath(`/goals/${data.goal_id}`)
  return task
}

export async function updateTask(id: string, data: Partial<Task>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("tasks")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/tasks")
  revalidatePath("/dashboard")
}

export async function deleteTask(id: string, goalId?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  if (goalId) revalidatePath(`/goals/${goalId}`)
}

export async function completeTask(id: string, goalId?: string, milestoneId?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: task } = await supabase
    .from("tasks")
    .select("xp_reward, milestone_id, goal_id")
    .eq("id", id)
    .single()

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)

  // Award XP
  await supabase.rpc("add_xp", {
    p_user_id: user.id,
    p_amount: task?.xp_reward || 10,
    p_source: "task",
    p_source_id: id,
    p_description: "Completed task",
  })

  // Update milestone progress if applicable
  if (task?.milestone_id) {
    await recalculateMilestoneProgress(task.milestone_id)
  }

  // Update goal progress if applicable
  if (task?.goal_id) {
    await recalculateGoalProgress(task.goal_id)
  }

  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  if (goalId) revalidatePath(`/goals/${goalId}`)
}

// ============================================
// PROGRESS CALCULATION
// ============================================

async function recalculateMilestoneProgress(milestoneId: string) {
  const supabase = createClient()

  const { data: tasks } = await supabase
    .from("tasks")
    .select("status")
    .eq("milestone_id", milestoneId)

  if (!tasks || tasks.length === 0) return

  const completed = tasks.filter(t => t.status === "completed").length
  const progress = Math.round((completed / tasks.length) * 100)

  await supabase
    .from("milestones")
    .update({ progress })
    .eq("id", milestoneId)
}

async function recalculateGoalProgress(goalId: string) {
  const supabase = createClient()

  const { data: milestones } = await supabase
    .from("milestones")
    .select("progress")
    .eq("goal_id", goalId)

  if (!milestones || milestones.length === 0) {
    // Fall back to tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("status")
      .eq("goal_id", goalId)

    if (!tasks || tasks.length === 0) return

    const completed = tasks.filter(t => t.status === "completed").length
    const progress = Math.round((completed / tasks.length) * 100)

    await supabase
      .from("goals")
      .update({ progress })
      .eq("id", goalId)
    return
  }

  const avgProgress = Math.round(
    milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length
  )

  await supabase
    .from("goals")
    .update({ progress: avgProgress })
    .eq("id", goalId)
}
