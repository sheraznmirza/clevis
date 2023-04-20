import { Module } from '@nestjs/common';
import { RoleRouteService } from './role-route.service';
import { RoleRouteController } from './role-route.controller';
// import { ServiceService } from './service.service';
// import { ServiceController } from './service.controller';
// import { ServiceRepository } from './service.repository';

@Module({
  providers: [RoleRouteService],
  controllers: [RoleRouteController],
})
export class RoleRouteModule {}
