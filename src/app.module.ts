import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { LocationModule } from './modules/location/location.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [LocationModule, AuthModule, ConfigModule.forRoot()],
})
export class AppModule {}
