import { Module } from '@nestjs/common';
import { BruteForceTestService } from './brute-force-test.service';
import { BruteForceTestController } from './brute-force-test.controller';

@Module({
  controllers: [BruteForceTestController],
  providers: [BruteForceTestService],
})
export class BruteForceTestModule {}
