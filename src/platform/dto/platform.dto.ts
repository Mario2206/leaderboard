import { IsString } from 'class-validator';

export class PlatformDto {
  @IsString()
  readonly name: string;
  @IsString()
  readonly description: string;
}
