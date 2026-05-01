import { Module } from "@nestjs/common";
import { BomberService } from "./bomber.service";
import { BomberController } from "./bomber.controller";
import { JobsModule } from "../jobs/jobs.module";

@Module({
  imports: [JobsModule],
  controllers: [BomberController],
  providers: [BomberService]
})
export class BomberModule {}
