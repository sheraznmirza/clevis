import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
// import { ServiceService } from './service.service';
// import { ServiceController } from './service.controller';
// import { ServiceRepository } from './service.repository';

@Module({
  providers: [RoleService],
  controllers: [RoleController],
})
export class RoleModule {}
