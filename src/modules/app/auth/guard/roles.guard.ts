import { AuthGuard } from '@nestjs/passport';

export class RolesGuard extends AuthGuard('roles') {
  constructor() {
    super();
  }
}
