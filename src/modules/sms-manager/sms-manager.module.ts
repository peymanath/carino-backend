import { Module } from "@nestjs/common";
import { SmsManagerService } from "./sms-manager.service";
import { ProviderServiceMeliPayamak } from "./providers-service/meli-payamak";

@Module({
  exports: [SmsManagerService],
  providers: [SmsManagerService, ProviderServiceMeliPayamak]
})
export class SmsManagerModule {}
