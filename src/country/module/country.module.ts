import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from '../entities/country.entity';
import { CountryService } from '../service/country.service';
import { CountryController } from '../controller/country.controller';
import { StatusController } from '../controller/status.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  controllers: [CountryController, StatusController],
  providers: [CountryService],
})
export class CountryModule {}
