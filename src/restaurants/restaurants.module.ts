import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurants.entity';
import { RestaurantService } from './restaurants.service';
import { RestaurantResolver } from './restaurants.resolver';
import { CategoryRepository } from './repositories/category.repository';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
  providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantsModule {}
