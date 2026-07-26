import { Module } from '@nestjs/common';
import { DdlService } from './ddl.service';
import { DdlController } from './ddl.controller';

@Module({
  controllers: [DdlController],
  providers: [DdlService],
  exports: [DdlService],
})
export class DdlModule {}
