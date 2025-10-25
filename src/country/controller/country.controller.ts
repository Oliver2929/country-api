import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Delete,
  Res,
} from '@nestjs/common';
import { CountryService } from '../service/country.service';
import { FilterDto } from '../dto/filter.dto';
import type { Response } from 'express';

@Controller('countries')
export class CountryController {
  constructor(private readonly service: CountryService) {}

  @Post('refresh')
  refresh() {
    return this.service.refreshCountries();
  }

  @Get()
  getAll(@Query() query: FilterDto) {
    return this.service.getAll(query);
  }

  @Get('image')
  async getImage(@Res() res: Response) {
    const stream = await this.service.getImage();
    stream.pipe(res);
  }

  @Get(':name')
  getOne(@Param('name') name: string) {
    return this.service.getOne(name);
  }

  @Delete(':name')
  delete(@Param('name') name: string) {
    return this.service.delete(name);
  }
}
