import { Controller, Get, Query } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { StandardResponseDto } from '../../shared/dto';
import { TokenData } from './interface/coinmarketcap.interface';
import { QueryCoinMarketCapDto } from './dto/coinmarketcap-query';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Get('coinmarketcap')
  getCoinmarketcap(@Query() query: QueryCoinMarketCapDto): Promise<StandardResponseDto<{ jobId?: string }>> {
    return this.crawlService.createJobForCoinMarketCap(query);
  }
}
