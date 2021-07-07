import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SignedChallengeAuthGuard extends AuthGuard('challenge') {}
