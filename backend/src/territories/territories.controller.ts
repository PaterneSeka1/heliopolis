import { Controller, Get, Query } from '@nestjs/common';
import { TerritoriesService } from './territories.service.js';

@Controller('territories')
export class TerritoriesController {
  constructor(private territoriesService: TerritoriesService) {}

  @Get('stats')
  getStats() {
    return this.territoriesService.getStats();
  }

  @Get('regions')
  getRegions() {
    return this.territoriesService.getRegions();
  }

  @Get('districts')
  getDistricts(@Query('regionId') regionId?: string) {
    return this.territoriesService.getDistricts(regionId);
  }

  @Get('parishes')
  getParishes(@Query('districtId') districtId?: string) {
    return this.territoriesService.getParishes(districtId);
  }
}
