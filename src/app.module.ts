import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { LocationModule } from './modules/location/location.module';
import { ConfigModule } from '@nestjs/config';
import { HardwareModule } from './modules/hardware/hardware.module';

@Module({
  imports: [LocationModule, AuthModule, HardwareModule, ConfigModule.forRoot()],
})
export class AppModule {}
