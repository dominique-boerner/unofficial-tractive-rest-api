import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TrackerDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(8)
  @IsString()
  trackerId: string;
}
