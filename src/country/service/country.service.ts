import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from '../entities/country.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private repo: Repository<Country>,
  ) {}

  async refreshCountries() {
    try {
      const [countryRes, rateRes] = await Promise.all([
        axios.get(
          'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies',
        ),
        axios.get('https://open.er-api.com/v6/latest/USD'),
      ]);

      const exchangeRates = rateRes.data.rates;
      const now = new Date();

      for (const c of countryRes.data) {
        const currency = c.currencies?.[0]?.code || null;
        const rate = currency ? (exchangeRates[currency] ?? null) : null;
        const multiplier = Math.floor(Math.random() * 1001) + 1000;
        const gdp = rate
          ? (c.population * multiplier) / rate
          : currency
            ? null
            : 0;

        const existing = await this.repo.findOne({ where: { name: c.name } });

        const country = {
          name: c.name,
          capital: c.capital,
          region: c.region,
          population: c.population,
          currency_code: currency,
          exchange_rate: rate,
          estimated_gdp: gdp,
          flag_url: c.flag,
          last_refreshed_at: now,
        };

        if (existing) {
          await this.repo.update(existing.id, country);
        } else {
          await this.repo.save(country);
        }
      }

      await this.generateSummaryImage();
      return { message: 'Refresh complete' };
    } catch (err) {
      throw new HttpException(
        {
          error: 'External data source unavailable',
          details: err.message.includes('restcountries')
            ? 'Could not fetch data from restcountries'
            : 'Could not fetch data from exchange rate API',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getAll(filters: any) {
    const query = this.repo.createQueryBuilder('country');

    if (filters.region)
      query.andWhere('country.region = :region', { region: filters.region });
    if (filters.currency)
      query.andWhere('country.currency_code = :currency', {
        currency: filters.currency,
      });
    if (filters.sort === 'gdp_desc')
      query.orderBy('country.estimated_gdp', 'DESC');

    const data = await query.getMany();
    return data;
  }

  async getOne(name: string) {
    const country = await this.repo.findOne({ where: { name } });
    if (!country)
      throw new HttpException(
        { error: 'Country not found' },
        HttpStatus.NOT_FOUND,
      );
    return country;
  }

  async delete(name: string) {
    const result = await this.repo.delete({ name });
    if (result.affected === 0)
      throw new HttpException(
        { error: 'Country not found' },
        HttpStatus.NOT_FOUND,
      );
  }

  async getStatus() {
    const total = await this.repo.count();
    const latest = await this.repo
      .createQueryBuilder()
      .select('MAX(last_refreshed_at)', 'last')
      .getRawOne();
    return {
      total_countries: total,
      last_refreshed_at: latest.last,
    };
  }

  async generateSummaryImage() {
    const countries = await this.repo.find({
      order: { estimated_gdp: 'DESC' },
      take: 5,
    });

    const total = await this.repo.count();
    const latest = await this.repo
      .createQueryBuilder()
      .select('MAX(last_refreshed_at)', 'last')
      .getRawOne();

    const summaryText = `
Total Countries: ${total}
Top 5 by GDP:
${countries
  .map((c, i) => `${i + 1}. ${c.name}: ${(c.estimated_gdp ?? 0).toFixed(2)}`)
  .join('\n')}
Last Refresh: ${latest.last}
`;

    const svg = `
      <svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
        <style>
          text { font-family: Arial, sans-serif; font-size: 16px; fill: #333; }
        </style>
        <rect width="100%" height="100%" fill="white"/>
        <text x="20" y="40">${summaryText
          .split('\n')
          .map(
            (line, i) =>
              `<tspan x="20" dy="${i === 0 ? 0 : 22}">${line}</tspan>`,
          )
          .join('')}
        </text>
      </svg>
    `;

    const outputDir = path.resolve('cache');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(outputDir, 'summary.png'));

    console.log('✅ Summary image generated successfully!');
  }

  async getImage() {
    if (!fs.existsSync('cache/summary.png')) {
      throw new HttpException(
        { error: 'Summary image not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return fs.createReadStream('cache/summary.png');
  }
}
