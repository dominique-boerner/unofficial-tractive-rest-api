import { Module } from '@nestjs/common';
import { AuthenticationStore } from './authentication.store';

const providers = [AuthenticationStore];

@Module({
  providers,
  exports: [...providers],
})
export class StoreModule {}
