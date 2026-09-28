import { IsString, IsNotEmpty, IsEnum, IsInt, Min, Max, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum TemplateStatusDto {
  DRAFT = 'DRAFT',
  READY = 'READY',
  DISABLED = 'DISABLED',
}

export enum DifficultyDto {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

class PortConfigDto {
  @IsInt()
  @Min(1)
  @Max(65535)
  containerPort: number;

  @IsString()
  protocol: 'TCP' | 'UDP';
}

export class CreateMachineTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEnum(DifficultyDto)
  difficulty: DifficultyDto;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  imageTag: string;

  @IsInt()
  @Min(1)
  @Max(8)
  cpuLimit: number;

  @IsInt()
  @Min(128)
  @Max(16384)
  memoryLimit: number;

  @IsInt()
  @Min(1)
  @Max(100)
  storageLimit: number;

  @IsInt()
  @Min(5)
  @Max(480)
  timeoutMinutes: number;

  @IsEnum(TemplateStatusDto)
  @IsOptional()
  status?: TemplateStatusDto;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortConfigDto)
  @IsOptional()
  ports?: PortConfigDto[];
}
