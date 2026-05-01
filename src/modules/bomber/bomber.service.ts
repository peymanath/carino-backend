import { Injectable, NotFoundException } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { PrismaService } from '../database/prisma.service';
import { StandardResponseDto } from '@/shared/dto';

@Injectable()
export class BomberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService
  ) {}

  async add(mobile: string) {
    const repeatMs = 2.5 * 60 * 1000;
    const uniqueJobId = `bomber:${mobile}`;
    const { id: jobId } = await this.jobsService.addJob('bomber', { input: mobile }, uniqueJobId, repeatMs);

    await this.prisma.bomberJob.create({
      data: {
        mobile,
        jobId: jobId!,
      },
    });

    return new StandardResponseDto({
      data: null,
    });
  }

  async getList() {
    const listBomberNumber = await this.prisma.bomberJob.findMany();

    return new StandardResponseDto({
      data: listBomberNumber.map(({ jobId, mobile }) => ({ jobId, mobile })),
    });
  }

  async remove(mobile: string) {
    const jobRecord = await this.prisma.bomberJob.findUnique({ where: { mobile } });
    if (!jobRecord) throw new NotFoundException(`Job for mobile ${mobile} not found`);

    await this.jobsService.removeJob(jobRecord.jobId);

    await this.prisma.bomberJob.delete({ where: { mobile } });

    return new StandardResponseDto({
      data: null,
      message: `شماره ${mobile} با موفقیت حذف شد.`,
    });
  }
  async removeAll() {
    const listBomberNumbers = await this.prisma.bomberJob.findMany();

    if (listBomberNumbers.length === 0) {
      return new StandardResponseDto({
        data: null,
        message: 'دیتایی یافت نشد.',
      });
    }
    for (const record of listBomberNumbers) {
      if (record.jobId) {
        await this.jobsService.removeJob(record.jobId);
      }
    }
    await this.prisma.bomberJob.deleteMany({});
    return new StandardResponseDto({
      data: null,
      message: `تمامی ${listBomberNumbers.length} جاب و رکورد مرتبط حذف شدند.`,
    });
  }
  async updateAllTimings(newRepeatMs: number) {
    const jobs = await this.prisma.bomberJob.findMany();

    if (jobs.length === 0) {
      return new StandardResponseDto({
        data: null,
        message: 'هیچ جابی برای بروزرسانی یافت نشد.',
      });
    }

    this.jobsService.pauseQueue();

    for (const { jobId, mobile } of jobs) {
      if (!jobId) continue;
      const data = { input: mobile };
      await this.jobsService.updateJobTiming('bomber', jobId, data, newRepeatMs * 1000);
    }

    this.jobsService.resumeQueue();

    return new StandardResponseDto({
      data: null,
      message: `زمان تمامی ${jobs.length} جاب بروزرسانی شد به ${newRepeatMs} ms.`,
    });
  }

  async updateTimingForMobile(mobile: string, newRepeatMs: number) {
    const record = await this.prisma.bomberJob.findUnique({ where: { mobile } });
    if (!record || !record.jobId) throw new NotFoundException(`Job for mobile ${mobile} not found`);

    const data = { input: mobile };
    const name = 'bomber';

    await this.jobsService.updateJobTiming(name, record.jobId, data, newRepeatMs);

    return new StandardResponseDto({
      data: null,
      message: `زمان جاب شماره ${mobile} به ${newRepeatMs} ms بروزرسانی شد.`,
    });
  }
}
