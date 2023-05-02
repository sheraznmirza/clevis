import { Module } from '@nestjs/common';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';

@Module({
  providers: [RouteService],
  controllers: [RouteController],
})
export class RouteModule {}
