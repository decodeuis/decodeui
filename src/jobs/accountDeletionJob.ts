import { Neo4jInstanceManager } from "~/cypher/instance/Neo4jInstanceManager";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";

/**
 * This job is responsible for processing account deletion requests that have passed the 48-hour waiting period.
 * It should be scheduled to run periodically (e.g., once per hour) to check for and process any pending account deletions.
 */
export async function processAccountDeletions() {
  const instanceManager = Neo4jInstanceManager.getInstance();
  const dbInstances = await instanceManager.getAllInstances();

  for (const [subdomainId, instance] of Object.entries(dbInstances)) {
    const dbSession = instance.getSession();

    try {
      // Get all scheduled account deletion jobs that are ready to execute
      const result = await dbSession.run(`
        MATCH (job:ScheduledJob)
        WHERE job.type = 'account_deletion'
          AND job.status = 'scheduled'
          AND job.executeAt <= datetime()
        RETURN job, job.userId AS userId, job.userEmail AS userEmail
      `);

      if (result.records.length === 0) {
        continue; // No pending deletion jobs for this subdomain
      }

      for (const record of result.records) {
        const jobId = record.get("job").identity;
        const uuid = record.get("uuid");
        const userEmail = record.get("userEmail");

        // Check if user still exists and is marked for deletion
        const userCheck = await dbSession.run(
          `
          MATCH (u:User)
          WHERE u.uuid = $uuid AND u.pendingDeletion = true
          RETURN u
        `,
          { uuid },
        );

        if (userCheck.records.length === 0) {
          // User no longer exists or deletion was cancelled
          await dbSession.run(
            `
            MATCH (job:ScheduledJob)
            WHERE id(job) = $jobId
            SET job.status = 'cancelled',
                job.completedAt = datetime(),
                job.notes = 'User not found or deletion cancelled'
          `,
            { jobId },
          );
          continue;
        }

        // Proceed with permanent deletion of the user and all their data
        await dbSession.run(
          `
          MATCH (u:User)
          WHERE u.uuid = $uuid
          OPTIONAL MATCH (u)-[r]-()
          DELETE u, r
        `,
          { uuid },
        );

        // Mark the job as completed
        await dbSession.run(
          `
          MATCH (job:ScheduledJob)
          WHERE id(job) = $jobId
          SET job.status = 'completed',
              job.completedAt = datetime()
        `,
          { jobId },
        );

        // Log the account deletion
        await createActivityLog(
          dbSession,
          "user_account_permanent_deletion",
          "User",
          userEmail,
          "system",
          `Account for ${userEmail} has been permanently deleted after the 48-hour waiting period.`,
        );
      }
    } catch (error) {
      console.error(
        `Error processing account deletions for subdomain ${subdomainId}:`,
        error,
      );
    } finally {
      await dbSession.close();
    }
  }
}
