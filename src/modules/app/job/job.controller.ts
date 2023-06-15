import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/decorator';
import { GetUserType } from 'src/core/dto';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from 'src/core/guards';
import { UserType } from '@prisma/client';
import { Authorized } from 'src/core/decorators';
import { GetRiderJobsDto, UpdateJobStatusDto } from './dto';

@ApiTags('Job')
@UseGuards(JwtGuard, RolesGuard)
@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Authorized(UserType.VENDOR)
  @Post()
  create(@GetUser() user: GetUserType, @Body() createJobDto: CreateJobDto) {
    return this.jobService.create(user, createJobDto);
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
    return this.jobService.getAllVendorJobs(user, listingParams);
  }

  @Authorized(UserType.RIDER)
  @Patch('update-status/:jobId')
  updateJobStatus(
    @Param('jobId') jobId: number,
    @Body() dto: UpdateJobStatusDto,
    @GetUser() user: GetUserType,
  ) {
    return this.jobService.updateJobStatus(jobId, dto, user);
  }

  @Authorized([UserType.VENDOR, UserType.RIDER])
  @Get('byId/:jobId')
  findOne(@Param('jobId') id: number) {
    return this.jobService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
  //   return this.jobService.update(+id, updateJobDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.jobService.remove(+id);
  // }
}
