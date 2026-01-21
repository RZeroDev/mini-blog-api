import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

export const JWT_SECRET ="zjP9h6ZI5LoSKCRj"
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET as string || JWT_SECRET,
    });
  }

  async validate(payload: { userId: string }) {
    const result = await this.usersService.findOne(payload.userId);

    if (!result || !result.user) {
      throw new UnauthorizedException('Vous n\'êtes pas connecté!');
    }

    return {
      id: result.user.id,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
      role: result.user.role
    };
  }
}
