import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

enum JobStatus {
  Completed = 'Completed',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
}
export class UpdateJobStatusDto {
  @ApiProperty({
    required: true,
    enum: JobStatus,
  })
  @IsEnum(JobStatus)
  @IsNotEmpty()
  jobStatus: JobStatus;
}
