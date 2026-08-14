"use client"

import { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Target, Flag, CheckSquare, CheckCircle2, Circle, AlertTriangle } from "lucide-react"
import type { Goal, Milestone, Task } from "@/types"

interface GoalMapProps {
  goals: (Goal & { milestones?: Milestone[]; tasks?: Task[] })[]
}

// Custom node components
function GoalNode({ data }: NodeProps) {
  const goal = data as unknown as Goal
  const router = useRouter()
  const statusColors: Record<string, string> = {
    active: "border-emerald-500/50 bg-emerald-500/10",
    completed: "border-emerald-500 bg-emerald-500/20",
    paused: "border-amber-500/50 bg-amber-500/10",
    at_risk: "border-yellow-500/50 bg-yellow-500/10",
    behind: "border-red-500/50 bg-red-500/10",
  }

  return (
    <div
      onClick={() => router.push(`/goals/${goal.id}`)}
      className={`group cursor-pointer rounded-xl border-2 px-5 py-4 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl ${
        statusColors[goal.status as string] || statusColors.active
      }`}
      style={{ minWidth: 220 }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${goal.color}30` }}
        >
          <Target className="h-5 w-5" style={{ color: goal.color }} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{goal.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${goal.progress}%`,
                  backgroundColor: goal.color,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{goal.progress}%</span>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}

function MilestoneNode({ data }: NodeProps) {
  const milestone = data as unknown as Milestone
  const isCompleted = milestone.status === "completed"
  return (
    <div
      className={`rounded-lg border px-4 py-3 shadow-md backdrop-blur-sm transition-all hover:scale-105 ${
        isCompleted
          ? "border-emerald-500/50 bg-emerald-500/10"
          : "border-kaizen-500/30 bg-kaizen-500/5"
      }`}
      style={{ minWidth: 180 }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex items-center gap-2">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        ) : (
          <Flag className="h-4 w-4 text-kaizen-400 shrink-0" />
        )}
        <p className={`text-sm font-medium truncate ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
          {milestone.title}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-kaizen-500 transition-all"
            style={{ width: `${milestone.progress}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">{milestone.progress}%</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}

function TaskNode({ data }: NodeProps) {
  const task = data as unknown as Task
  const isCompleted = task.status === "completed"
  const diffColors: Record<string, string> = {
    tiny: "#94a3b8",
    easy: "#10b981",
    medium: "#8b5cf6",
    hard: "#f59e0b",
    epic: "#ef4444",
  }
  const color = diffColors[task.difficulty as string] || "#8b5cf6"

  return (
    <div
      className={`rounded-md border px-3 py-2 shadow-sm backdrop-blur-sm transition-all hover:scale-105 ${
        isCompleted
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-border bg-card/80"
      }`}
      style={{ minWidth: 140 }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex items-center gap-2">
        {isCompleted ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        ) : (
          <Circle className="h-3.5 w-3.5 shrink-0" style={{ color }} />
        )}
        <p className={`text-xs truncate ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
          {task.title}
        </p>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] font-medium" style={{ color }}>
          {task.difficulty}
        </span>
        <span className="text-[10px] text-gold">+{task.xp_reward} XP</span>
      </div>
    </div>
  )
}

const nodeTypes = {
  goal: GoalNode,
  milestone: MilestoneNode,
  task: TaskNode,
}

export function GoalMap({ goals }: GoalMapProps) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    let y = 0
    const xGap = 280
    const yGapGoal = 200
    const yGapMilestone = 140
    const yGapTask = 100

    goals.forEach((goal, goalIndex) => {
      const goalX = goalIndex * xGap
      const goalY = y

     nodes.push({
        id: `goal-${goal.id}`,
        type: "goal",
        position: { x: goalX, y: goalY },
        data: goal as unknown as Record<string, unknown>,
      })

      const milestones = goal.milestones || []
      const tasks = goal.tasks || []
      const tasksWithoutMilestone = tasks.filter(t => !t.milestone_id)

      let currentY = goalY + yGapGoal

      milestones.forEach((milestone, mi) => {
        const milestoneX = goalX + (mi - (milestones.length - 1) / 2) * 220
        const milestoneY = currentY

        nodes.push({
          id: `milestone-${milestone.id}`,
          type: "milestone",
          position: { x: milestoneX, y: milestoneY },
          data: milestone as unknown as Record<string, unknown>,
        })

        edges.push({
          id: `e-goal-${goal.id}-milestone-${milestone.id}`,
          source: `goal-${goal.id}`,
          target: `milestone-${milestone.id}`,
          animated: milestone.status !== "completed",
          style: {
            stroke: milestone.status === "completed" ? "#10b981" : "#8b5cf6",
            strokeWidth: 2,
            strokeDasharray: milestone.status === "completed" ? "0" : "5,5",
          },
        })

        const milestoneTasks = tasks.filter(t => t.milestone_id === milestone.id)
        milestoneTasks.forEach((task, ti) => {
          const taskX = milestoneX + (ti - (milestoneTasks.length - 1) / 2) * 160
          const taskY = milestoneY + yGapTask

          nodes.push({
            id: `task-${task.id}`,
            type: "task",
            position: { x: taskX, y: taskY },
            data: task as unknown as Record<string, unknown>,
          })

          edges.push({
            id: `e-milestone-${milestone.id}-task-${task.id}`,
            source: `milestone-${milestone.id}`,
            target: `task-${task.id}`,
            animated: task.status !== "completed",
            style: {
              stroke: task.status === "completed" ? "#10b981" : "#64748b",
              strokeWidth: 1.5,
            },
          })
        })
      })

      // Tasks directly under goal (no milestone)
      tasksWithoutMilestone.forEach((task, ti) => {
        const taskX = goalX + (ti - (tasksWithoutMilestone.length - 1) / 2) * 160
        const taskY = currentY

        nodes.push({
            id: `task-${task.id}`,
            type: "task",
            position: { x: taskX, y: taskY },
            data: task as unknown as Record<string, unknown>,
          })

        edges.push({
          id: `e-goal-${goal.id}-task-${task.id}`,
          source: `goal-${goal.id}`,
          target: `task-${task.id}`,
          animated: task.status !== "completed",
          style: {
            stroke: task.status === "completed" ? "#10b981" : "#64748b",
            strokeWidth: 1.5,
          },
        })
      })

      y = Math.max(y, currentY + yGapMilestone)
    })

    return { nodes, edges }
  }, [goals])

  const [flowNodes, , onNodesChange] = useNodesState(nodes)
  const [flowEdges, , onEdgesChange] = useEdgesState(edges)

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Target className="h-12 w-12 opacity-30 mb-4" />
        <h3 className="text-lg font-semibold">No goals to visualize</h3>
        <p className="text-sm mt-1">Create some goals first to see them on the map</p>
      </div>
    )
  }

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.2}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#334155" gap={20} size={1} />
      <Controls className="bg-card border-border" />
      <MiniMap
        nodeColor={(node) => {
          if (node.type === "goal") return (node.data as unknown as Goal).color || "#8b5cf6"
          if (node.type === "milestone") return "#8b5cf6"
          return "#64748b"
        }}
        maskColor="rgba(0,0,0,0.7)"
        className="bg-card/80 border border-border rounded-lg"
      />
    </ReactFlow>
  )
}
