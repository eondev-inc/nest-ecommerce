import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UserModule } from './models/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './models/product/product.module';
import { CategoryModule } from './models/category/category.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    PrismaModule,
    ProductModule,
    CategoryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
