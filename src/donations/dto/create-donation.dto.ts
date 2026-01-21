import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateDonationDto {
    @IsNotEmpty()
    @ApiProperty()
    amount: number;
    @IsOptional()
    @ApiProperty()
    transactionId: string;
    @IsOptional()
    @ApiProperty()
    email: string;
    @IsOptional()
    @ApiProperty()
    phone: string;
    @IsOptional()
    @ApiProperty()
    name: string;
    @IsOptional()
    @ApiProperty()
    userId: string;
}
