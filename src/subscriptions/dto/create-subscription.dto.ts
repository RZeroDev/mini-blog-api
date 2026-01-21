import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateSubscriptionDto {
    @IsNotEmpty()
    @ApiProperty()
    assetRemaining: number;
    @IsNotEmpty()
    @ApiProperty()
    price: number;
}

export class UserMakeSubscriptionDto {
    @IsNotEmpty()
    @ApiProperty()
    userId: string;
    @IsNotEmpty()
    @ApiProperty()
    transactionId: string;
    @IsNotEmpty()
    @ApiProperty()
    subscriptionId: string;
}