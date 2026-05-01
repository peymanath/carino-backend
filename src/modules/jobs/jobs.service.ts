import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue, Job } from "bullmq";
import { JobDefinitions } from "./jobs.types";

@Injectable()
export class JobsService {
  constructor(@InjectQueue("jobs") private readonly jobsQueue: Queue) {}

  async addJob<K extends keyof JobDefinitions>(name: K, data: JobDefinitions[K], jobId: string, everyMs?: number): Promise<{ job: Job; id: string | undefined }> {
    const job = await this.jobsQueue.add(name as string, data as any, {
      repeat: everyMs ? { every: everyMs } : undefined,
      removeOnComplete: true,
      removeOnFail: false,
      jobId
    });

    return { job, id: everyMs ? job.repeatJobKey : job.id };
  }

  async removeJob(jobId: string): Promise<boolean> {
    const schedulers = await this.jobsQueue.getJobScheduler(jobId);
    if (schedulers) {
      await this.jobsQueue.removeJobScheduler(schedulers.key);
      return true;
    }

    return false;
  }

  async getJobStatus(jobId: string) {
    const job = await this.jobsQueue.getJob(jobId);
    if (!job) return "not found";
    const isActive = await job.isActive();
    const isCompleted = await job.isCompleted();
    const isFailed = await job.isFailed();
    return { isActive, isCompleted, isFailed };
  }

  async pauseQueue() {
    await this.jobsQueue.pause();
  }

  async resumeQueue() {
    await this.jobsQueue.resume();
  }

  async emptyQueue() {
    await this.jobsQueue.drain();
  }

  async updateJobTiming<K extends keyof JobDefinitions>(name: K, jobId: string, data: JobDefinitions[K], newEveryMs: number): Promise<{ job: Job; id: string | undefined }> {
    const oldJob = await this.jobsQueue.getJobScheduler(jobId);
    if (oldJob?.key) {
      await this.jobsQueue.removeJobScheduler(oldJob.key);
    }
    const job = await this.jobsQueue.add(name as string, data as any, {
      repeat: newEveryMs ? { every: newEveryMs } : undefined,
      removeOnComplete: true,
      removeOnFail: false,
      jobId
    });
    return { job, id: job.repeatJobKey ?? job.id };
  }
}
