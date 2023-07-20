import { Body, Controller, Post } from '@nestjs/common';
import { PlatformDto } from './dto/platform.dto';
import { PlatformService } from './platform.service';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Post()
  async registerPlatform(@Body() body: PlatformDto) {
    return this.platformService.registerPlatform(body);
  }
}
