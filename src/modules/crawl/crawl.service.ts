import { StandardResponseDto } from '@/shared/dto';
import { Injectable } from '@nestjs/common';
import { QueryCoinMarketCapDto } from './dto/coinmarketcap-query';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class CrawlService {
  constructor(private readonly jobsService: JobsService) {}

  async createJobForCoinMarketCap(query: QueryCoinMarketCapDto): Promise<
    StandardResponseDto<{
      jobId?: string;
    }>
  > {
    const repeatMs = 30 * 1000;
    const uniqueJobId = `getSignals:${query.network ?? 'all'}`;
    const { id: jobId } = await this.jobsService.addJob('coinmarketcap', { input: query.network ?? 'all' }, uniqueJobId, repeatMs);

    return new StandardResponseDto({ data: { jobId } });
  }
}
