import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TrackerDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(8, 8, {
    message: 'trackerId must be 8 characters long',
  })
  @IsString()
  trackerId: string;
}
