import { Controller, Get } from '@nestjs/common';
import { CountryService } from '../service/country.service';

@Controller('status')
export class StatusController {
  constructor(private readonly service: CountryService) {}

  @Get()
  async getStatus() {
    try {
      const status = await this.service.getStatus();
      return {
        total_countries: status.total_countries,
        last_refreshed_at: status.last_refreshed_at,
      };
    } catch (error) {
      return {
        error: 'Internal server error',
      };
    }
  }
}
