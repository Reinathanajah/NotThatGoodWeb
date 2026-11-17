import { and, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { assignmentSubmissions, assignments, courseModules } from '../../db/schema.js'

export interface AssignmentWindowBackup {
  moduleId: number
  opensAt: Date | null
}

export async function prepareUpcomingAssignmentWindow(
  moodleModuleId: number,
  studentId: string,
): Promise<AssignmentWindowBackup | null> {
  const [mod] = await db
    .select({ id: courseModules.id })
    .from(courseModules)
    .where(eq(courseModules.moodleModuleId, moodleModuleId))
    .limit(1)
  if (!mod) return null

  await db
    .delete(assignmentSubmissions)
    .where(
      and(
        eq(assignmentSubmissions.assignmentModuleId, mod.id),
        eq(assignmentSubmissions.userId, studentId),
      ),
    )

  const [assign] = await db
    .select({ opensAt: assignments.opensAt })
    .from(assignments)
    .where(eq(assignments.moduleId, mod.id))
    .limit(1)
  if (!assign) return null

  await db
    .update(assignments)
    .set({ opensAt: new Date(Date.now() + 86_400_000) })
    .where(eq(assignments.moduleId, mod.id))

  return { moduleId: mod.id, opensAt: assign.opensAt }
}

export async function restoreAssignmentWindow(backup: AssignmentWindowBackup | null): Promise<void> {
  if (!backup) return
  await db
    .update(assignments)
    .set({ opensAt: backup.opensAt })
    .where(eq(assignments.moduleId, backup.moduleId))
}
