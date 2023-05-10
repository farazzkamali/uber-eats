import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish, DishOption } from 'src/restaurants/entities/dish.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(OrderItem) private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
  ) {}
  async createOrder(customer:User, {restaurantId, items}:CreateOrderInput): Promise<CreateOrderOutput>{
    try {
      const restaurant = await this.restaurants.findOne({where:{id:restaurantId}})
      if(!restaurant){
        return{
          ok:false,
          error: "restaurant not found"
        }
      }
      let orderFinalPrice = 0
      const orderItems: OrderItem[] = []
      for(const item of items){
        const dish = await this.dishes.findOne({where:{id:item.dishId}})
        if(!dish){
          return{
            ok:false,
            error:"Dish not found"
          }
        }
        let dishFinalPrice = dish.price
        for(const itemOption of item.options ){
          const dishOption = dish.options.find(dishOption=>dishOption.name === itemOption.name)

          if (dishOption){
            if(dishOption.extra){
              dishFinalPrice = dishFinalPrice + dishOption.extra
            }else{
              const dishOptionChoice = dishOption.choices.find(optionChoice => optionChoice.name === itemOption.choice)
              if(dishOptionChoice.extra){
                dishFinalPrice = dishFinalPrice + dishOptionChoice.extra
              }
            }
            
          }
        }
        orderFinalPrice = orderFinalPrice + dishFinalPrice
        const orderItem = await this.orderItems.save(this.orderItems.create({dish, options:item.options}))
        orderItems.push(orderItem)
      }
      console.log(orderFinalPrice)
      await this.orders.save(this.orders.create({customer, restaurant, total:orderFinalPrice, items:orderItems }))
      return{
        ok:true
      }
    } catch (error) {
      return{
        ok:false,
        error:"Could not create order"
      }
    }
  }
}


