import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { ApiCallerBomberService } from './definitions/api-caller-bomber/api-caller-bomber.service';
import { CrawlerBomberService } from './definitions/crawler/crawler.service';

@Processor('jobs')
export class ApiCallerBomberJob extends WorkerHost {
  constructor(
    @Inject(ApiCallerBomberService) private readonly apiCaller: ApiCallerBomberService,
    @Inject(CrawlerBomberService) private readonly crawler: CrawlerBomberService
  ) {
    super();
  }

  async process(job: Job<{ input: string }>) {
    if (job.name.startsWith('bomber')) {
      await this.apiCaller.callTwentyApis(job.data.input);
    } else if (job.name.startsWith('coinmarketcap')) {
      await this.crawler.coinMarketCapCrawl(job.data.input);
    } else {
      //
    }
  }
}
