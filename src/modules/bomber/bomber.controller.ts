import { Controller, Post, Body, Delete, Get, Patch, Query, Param } from "@nestjs/common";
import { BomberService } from "./bomber.service";
import { CreateBomberDto } from "./dto/create-bomber.dto";

@Controller("bomber")
export class BomberController {
  constructor(private readonly bomberService: BomberService) {}

  @Post()
  async add(@Body() dto: CreateBomberDto) {
    return await this.bomberService.add(dto.mobile);
  }

  @Get()
  async getList() {
    return await this.bomberService.getList();
  }

  @Delete()
  async remove(@Body() dto: CreateBomberDto) {
    return await this.bomberService.remove(dto.mobile);
  }
  @Delete("all")
  async removeAll() {
    return await this.bomberService.removeAll();
  }

  @Patch("update-all")
  async updateAllTimings(@Query("repeatMs") repeatMs: string) {
    const ms = Number(repeatMs);
    return await this.bomberService.updateAllTimings(ms);
  }

  @Patch("update/:mobile")
  async updateTimingForMobile(@Param("mobile") mobile: string, @Query("repeatMs") repeatMs: string) {
    const ms = Number(repeatMs);
    return await this.bomberService.updateTimingForMobile(mobile, ms);
  }
}
