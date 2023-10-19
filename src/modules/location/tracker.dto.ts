import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TrackerDto {
  @ApiProperty()
  @IsNotEmpty()
  trackerId: string;
}
