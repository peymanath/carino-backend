import { Global, Module } from '@nestjs/common';
import { GisService } from './gis.service';

@Global()
@Module({
  providers: [GisService],
  exports: [GisService],
})
export class GisModule {}
