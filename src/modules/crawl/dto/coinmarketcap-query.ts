import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export type TNetworkFilter = 'all' | 'ethereum' | 'solana' | 'bnb-smart-chain-bep20' | 'base';
const NetworkFilterValues: TNetworkFilter[] = ['all', 'ethereum', 'solana', 'bnb-smart-chain-bep20', 'base'];
export class QueryCoinMarketCapDto {
  @ApiPropertyOptional({
    example: 'all',
    enum: NetworkFilterValues,
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  network?: TNetworkFilter;
}
