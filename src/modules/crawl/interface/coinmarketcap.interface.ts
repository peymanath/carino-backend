export interface Wallet {
  walletLabel: string;
  balanceAmountUsd: string;
  balanceAmount: string;
  totalBuyAmountUsd: string;
  totalBuyAmount: string;
  totalSellAmountUsd?: string;
  totalSellAmount?: string;
  buyTxs24h: string;
  sellTxs24h: string;
  roi: string;
  avgBuyPrice: string;
  avgSellPrice?: string;
  age: string;
  behavior: 'buy' | 'sellAll' | string;
  updateTime: string;
}

export interface TokenData {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  tokenImageUrl: string;
  pushCount: string;
  multiple: string;
  highestPrice: string;
  platformId: number;
  platformName: string;
  dexerPlatformName: string;
  platformCryptoId: number;
  poolCreateTime: string;
  publishAt: string;
  launchPad: string;
  priceUsd: string;
  volume24h: string;
  priceChange24h: string;
  pinCard: boolean;
  marketCap: string;
  liquidity: string;
  smartBuyerCount: string;
  smartBuyerAmountUsd: string;
  latestSignalTime: string;
  latestSignalMarketCap: string;
  latestSignalPrice: string;
  latestSignalLiquidityUsd: string;
  firstSignalTime: string;
  firstSignalMarketCap: string;
  telegram: string;
  twitter: string;
  website: string;
  wallets: Wallet[];
  securityLevel: 'safe' | string;
  allTimeVolume: string;
  allTimeBuyAmountUSD: string;
  allTimeTraderCount: string;
  updateTime: string;
  tags: any[];
  poolSource: string;
  type: 'revived' | string;
  totalSupply: string;
}

export interface ICoinMarketCapSignals {
  data: {
    signals: TokenData[];
  };
  status: {
    timestamp: string;
    error_code: string;
    error_message: string;
    elapsed: string;
    credit_count: number;
  };
}
