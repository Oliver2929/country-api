

## Description

A RESTful API built with **NestJS** and **MySQL** that fetches country data from external APIs, computes economic metrics, caches results in a database, and provides CRUD endpoints with filtering, sorting, and image generation.

##  Features

- Fetch country and exchange rate data from external APIs
- Compute `estimated_gdp` dynamically for each country
- Cache country data in a **MySQL** database
- CRUD endpoints (`GET`, `POST`, `DELETE`)
- Filtering (`?region=Africa`, `?currency=NGN`)
- Sorting (`?sort=gdp_desc` or `?sort=gdp_asc`)
- Status endpoint showing total countries and last refresh time
- Generates a summary image with top GDP countries
- Full validation and consistent error handling.

## Project setup

### Clone the Repository

```
git clone https://github.com/Oliver2929/country-api.git
```
cd country-exchange-api


### Install Dependencies

```bash
$ npm install
```

### Configure Environment Variables

Create a .env file in the project root:

* DB_HOST=localhost
* DB_PORT=3306
* DB_USERNAME=root
* DB_PASSWORD=yourpassword
* DB_NAME=country_cache
* PORT=3000

## Compile and run the project

