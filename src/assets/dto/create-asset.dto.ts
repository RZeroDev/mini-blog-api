import { ApiProperty } from "@nestjs/swagger";
import { JsonValue } from "@prisma/client/runtime/library";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateAssetDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    data: JsonValue;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    categoryId: string;
}
