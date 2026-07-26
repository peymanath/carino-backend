import { Controller, Get, Query } from '@nestjs/common';
import { DdlService } from './ddl.service';
import { ProvinceQueryDDLDto, CityQueryDDLDto } from './dto/query-ddl.dto';
import { HasAuthentication } from '../../shared/decorators/auth-swagger.decorator';

@HasAuthentication()
@Controller('ddl')
export class DdlController {
  constructor(private readonly ddlService: DdlService) {}

  @Get('countries')
  async countries() {
    return this.ddlService.countries();
  }

  @Get('provinces')
  async provinces(@Query() query: ProvinceQueryDDLDto) {
    return this.ddlService.provinces(query);
  }

  @Get('cities')
  async cities(@Query() query: CityQueryDDLDto) {
    return this.ddlService.cities(query);
  }
}
