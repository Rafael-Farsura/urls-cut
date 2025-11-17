import { IsUrl, IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUrlDto {
  @ApiProperty({
    description: 'Nova URL original',
    example: 'https://www.new-example.com',
    maxLength: 2048,
  })
  @IsNotEmpty({ message: 'A URL original é obrigatória' })
  @IsString({ message: 'A URL original deve ser uma string' })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    { message: 'A URL deve ser válida e usar protocolo HTTP ou HTTPS' },
  )
  @MaxLength(2048, { message: 'A URL não pode ter mais de 2048 caracteres' })
  originalUrl: string;
}
