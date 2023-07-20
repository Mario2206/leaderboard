import { Type } from 'class-transformer';
import { IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';

export class ScoreDto {
  @IsString()
  readonly userId: string;
  @IsNumber()
  readonly score: number;
}

export class BatchScoreDto {
  @IsUUID()
  readonly platformId: string;
  @IsString()
  gamePartyId: string;
  @ValidateNested({ each: true })
  @Type(() => ScoreDto)
  readonly scores: ScoreDto[];
}
