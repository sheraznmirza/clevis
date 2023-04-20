import { Module } from '@nestjs/common';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
// import { ServiceService } from './service.service';
// import { ServiceController } from './service.controller';
// import { ServiceRepository } from './service.repository';

@Module({
  providers: [RouteService],
  controllers: [RouteController],
})
export class RouteModule {}
