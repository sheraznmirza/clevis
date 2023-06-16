import { Controller, Post, Body, Param } from '@nestjs/common';

import { TapService } from './tap.service';
import { ChargeDto, ChargeParams } from './dto/charge.dto';

//   @ApiTags('Tap')
@Controller('tap')
export class TapController {
  constructor(private readonly tapService: TapService) {}

  @Post('authorize')
  authorize(@Body() dto: any) {
    return this.tapService.tapAuthorize(dto);
  }

  @Post('charge/:userMasterId/:entityType/:entityId')
  charge(@Param() params: ChargeParams, @Body() dto: ChargeDto) {
    return this.tapService.tapCharge(params, dto);
  }
}
