import { Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class S3Service {
  constructor(private configService: ConfigService) {}


}
