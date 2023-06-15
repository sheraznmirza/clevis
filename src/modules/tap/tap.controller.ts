import { Controller, Post, Body } from '@nestjs/common';

import { TapService } from './tap.service';

//   @ApiTags('Tap')
@Controller('tap')
export class TapController {
  constructor(private readonly tapService: TapService) {}

  @Post('authorize')
  authorize(@Body() dto: any) {
    return this.tapService.tapAuthorize(dto);
  }

  @Post('charge')
  charge(@Body() dto: any) {
    return this.tapService.tapCharge(dto);
  }
}
