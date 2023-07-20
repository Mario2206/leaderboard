import { Transform, plainToClass } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ScoreItemKeyDto {
  @IsString()
  readonly gamePartyId: string;
  @IsString()
  readonly userId: string;
  @IsNumber()
  readonly score: number;
}

export class GetScoreQueryDto {
  @IsOptional()
  @Transform((params) => {
    const value = JSON.parse(params.value);
    return plainToClass(ScoreItemKeyDto, value); // It's used to validate the nested object
  })
  @ValidateNested()
  startKey?: ScoreItemKeyDto;
}
