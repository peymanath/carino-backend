import { Controller, Post } from '@nestjs/common';
import { BruteForceTestService } from './brute-force-test.service';

@Controller('internal-test')
export class BruteForceTestController {
  constructor(private readonly service: BruteForceTestService) {}

  @Post('otp-rate-limit')
  run() {
    return this.service.run();
  }
}
