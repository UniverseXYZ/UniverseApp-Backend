import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SignedChallengeStrategy extends PassportStrategy(Strategy, 'challenge') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req) {
    const message = req.session.challenge;
    if (!message) return false;

    try {
      const user = await this.authService.validateUser(req.body.address, message, req.body.signature)
      return user;
    } catch (e) {
      return false;
    }
  }
}