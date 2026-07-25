import { RedisService } from '../../../cache/redis.service';
import { ICoinMarketCapSignals } from '../../../crawl/interface/coinmarketcap.interface';
import { EnumRedisDatabase } from '../../../../shared/enums/EnumRedisDatabase';
import { EnumRedisKey } from '../../../../shared/enums/EnumRedisKey';
import { buildRedisKey } from '../../../../shared/utils';
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

interface ICrawlerLog {
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  symbol: string | null;
  error?: string;
}

@Injectable()
export class CrawlerBomberService {
  private readonly logger = new Logger(CrawlerBomberService.name);
  private readonly TARGET_URL = 'https://dapi.coinmarketcap.com/dex/v3/dexer/signal/latest';
  //   private readonly TARGET_URL_FOR_COCK = 'https://dex.coinmarketcap.com/signals';

  constructor(private readonly redis: RedisService) {}

  private getShamsiTimestamp(): string {
    return new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
  }

  private getPlatformId(network: string): number | null {
    switch (network) {
      case 'ethereum':
        return 1;
      case 'solana':
        return 16;
      case 'bnb-smart-chain-bep20':
        return 14;
      case 'base':
        return 199;
      default:
        return null;
    }
  }
  async coinMarketCapCrawl(network: string) {
    this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.RESULT_CRAWLER);
    const historyKey = buildRedisKey(EnumRedisKey.CRAWLER_HISTORY, [network]);
    try {
      const response: AxiosResponse<ICoinMarketCapSignals> = await axios.post(
        this.TARGET_URL,
        {
          limit: 10,
          ...(network !== 'all' ? { platformId: this.getPlatformId(network) } : {}),
          type: 'all',
          walletLimit: 4,
        }
        // {
        //   headers: {
        //     // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        //     // Accept: 'application/json, text/plain, */*',
        //     // 'Accept-Language': 'en-US,en;q=0.9,fa;q=0.8,ar;q=0.7',
        //     'cache-control': 'no-cache',
        //     // 'content-length': '58',
        //     'content-type': 'application/json',

        //     cookie:
        //       'sajssdk_2015_cross_new_user=1; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%2219ab465ce11dde-0af1523e3a033b-26061b51-2073600-19ab465ce12fc1%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTlhYjQ2NWNlMTFkZGUtMGFmMTUyM2UzYTAzM2ItMjYwNjFiNTEtMjA3MzYwMC0xOWFiNDY1Y2UxMmZjMSJ9%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%22%2C%22value%22%3A%22%22%7D%2C%22%24device_id%22%3A%2219ab465ce11dde-0af1523e3a033b-26061b51-2073600-19ab465ce12fc1%22%7D; OTGPPConsent=DBABLA~BVQqAAAACgA.QA; OptanonAlertBoxClosed=2025-11-24T07:10:02.201Z; eupubconsent-v2=CQbYlPQQbYlPQAcABBENCGFsAP_gAEPgAChQLxtR_G__bWlr-bb3aftkeYxP9_hr7sQxBgbJk24FzLvW7JwXx2E5NAzatqIKmRIAu3TBIQNlHJDURVCgKIgFryDMaEyUoTNKJ6BkiFMRI2NYCFxvm4tjWQCY5vr99lc1mB-N7dr82dzyy6hHn3a5_2S1WJCdIYetDfv8ZBKT-9IEd_x8v4v4_F7pE2-eS1n_pGvp4j9-YnM_dBmxt-bSffzPn__rl_e7X_vd_n37v94XH77v____f_-7___2b4LwAAmGhUQRlkQIBAoGEECABQVhABQIAgAASBogIATBgU5AwAXWEyAEAKAAYIAQAAgwABAAAJAAhEAFABAIAQIBAoAAwAIAgIAGBgADABYiAQAAgOgYpgQQCBYAJGZVBpgSgAJBAS2VCCQDAgrhCEWeAQQIiYKAAAEAAoAAAB4LAQkkBKxIIAuIJoAACAAAKIESBFIWYAgqDNFoKwJOIyNMAwfMEySnQZAEwRkZJsQm_CYeKQohQQ5AbFLMAdPAAAAA.f_wACHwAAAAA; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Nov+24+2025+10%3A40%3A06+GMT%2B0330+(Iran+Standard+Time)&version=202409.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=8652bf9c-2124-4cbe-b42d-64c22a51ed99&interactionCount=2&isAnonUser=1&landingPath=NotLandingPage&GPPCookiesCount=1&groups=C0001%3A1%2CC0003%3A1%2CC0004%3A1%2CC0002%3A1%2CV2STACK42%3A1&intType=1&geolocation=FR%3BIDF&AwaitingReconsent=false; cmc-theme=night',
        //     origin: 'https://dex.coinmarketcap.com',
        //   },
        // }
      );

      if (response.status !== 200) {
        this.logger.error(`Failed to fetch page. Status: ${response.status}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }

      //   const filteredResponse = response.data.data.signals.filter(({ type }) => type === 'revived');
      const filteredResponse = response.data.data.signals;
      const foundSymbol = filteredResponse.length > 0 ? filteredResponse[0].tokenSymbol : null;

      const logEntry: ICrawlerLog = {
        timestamp: this.getShamsiTimestamp(),
        status: 'SUCCESS',
        symbol: foundSymbol,
      };

      await this.redis.rpush(historyKey, JSON.stringify(logEntry));

      this.logger.log('RESPONSE COIN_MARKET_CAP', foundSymbol || 'No Symbol Found');
    } catch (error) {
      const errorLogEntry: ICrawlerLog = {
        timestamp: this.getShamsiTimestamp(),
        status: 'FAILED',
        symbol: null,
        error: error.message,
      };
      await this.redis.rpush(historyKey, JSON.stringify(errorLogEntry));
      this.logger.error('Crawl failed.', error.message);
      throw new Error(`Crawl operation failed: ${error.message}`);
    }
  }
}
