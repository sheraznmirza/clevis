import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/decorator';
import { GetUserType } from 'src/core/dto';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from 'src/core/guards';
import { UserType } from '@prisma/client';
import { Authorized } from 'src/core/decorators';
import { GetRiderJobsDto } from './dto';

@ApiTags('Job')
@UseGuards(JwtGuard, RolesGuard)
@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Authorized(UserType.VENDOR)
  @Post()
  create(@GetUser() user: GetUserType, @Body() createJobDto: CreateJobDto) {
    return this.jobService.create(user.userTypeId, createJobDto);
  }

  // @Get()
  // findAll() {
  //   return this.jobService.findAll();
  // }
  @Authorized(UserType.RIDER)
  @Get('rider')
  getAllRiderJobs(
    @GetUser() user: GetUserType,
    @Query() listingParams: GetRiderJobsDto,
  ) {
    return this.jobService.getAllRiderJobs(user, listingParams);
  }

  @Authorized(UserType.VENDOR)
  @Get('vendor')
  getAllVendorJobs(
    @GetUser() user: GetUserType,
    @Query() listingParams: GetRiderJobsDto,
  ) {
    // return this.jobService.getAllVendorJobs(user, listingParams);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.jobService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
  //   return this.jobService.update(+id, updateJobDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.jobService.remove(+id);
  // }
}
