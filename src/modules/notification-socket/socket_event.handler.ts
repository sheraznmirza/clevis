import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
// import { AuthService } from "src/users/auth/auth.service";
import { AuthService } from '../app/auth/auth.service';

@Injectable()
export class SocketEventHandler {
  constructor(private authService: AuthService) {}

  sendNotif(server, userId, eventType) {
    server.to(userId).emit(eventType, '');
  }

  async onDisconnect(client: Socket) {
    const auth = await this.socketAuth(client);
    if (auth == false) {
      console.log('socket disconnect error');
      return client.disconnect();
    }

    client.leave(auth.userId);
    client.disconnect();
  }

  private async socketAuth(socket: any) {
    const token = socket.handshake.auth.token;
    let user: any;
    try {
      user = await this.authService.verify(token);
    } catch (err) {
      console.log(`error .... ${err.message}}`);
      return false;
    }

    if (user == null) {
      return false;
    }

    return user;
  }

  async onConnect(socket: Socket) {
    console.log('onConnect');
    const auth = await this.socketAuth(socket);
    if (auth == false) {
      socket.emit('auth failed', { message: 'Invalid token' });
      return socket.disconnect();
    }
    socket.join(auth.sub.toString());
  }
}
