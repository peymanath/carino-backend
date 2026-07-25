import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
// import { Inject } from '@nestjs/common';
// import { ApiCallerBomberService } from './definitions/api-caller-bomber/api-caller-bomber.service';

@Processor('jobs')
export class ApiCallerBomberJob extends WorkerHost {
  constructor(
    // @Inject(ApiCallerBomberService) private readonly apiCaller: ApiCallerBomberService,
  ) {
    super();
  }

  async process(job: Job<{ input: string }>) {
    if (job.name.startsWith('bomber')) {
      // await this.apiCaller.callTwentyApis(job.data.input);
    } else {
      //
    }
  }
}
