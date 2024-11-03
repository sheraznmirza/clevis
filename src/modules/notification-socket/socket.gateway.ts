import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketEventHandler } from './socket_event.handler';

@WebSocketGateway({ cors: true })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private socketEventHandler: SocketEventHandler) {}

  @WebSocketServer()
  static server: any;
  afterInit(server: any) {
    SocketGateway.server = server;
    console.log('Initializing SocketGateway');
  }

  async handleConnection(client) {
    this.socketEventHandler.onConnect(client);
  }

  async handleDisconnect(client: Socket) {
    this.socketEventHandler.onDisconnect(client);
  }

  static emitEvent(eventType: string, event: any, userId: string) {
    SocketGateway.server.to(userId).emit(eventType, event);
  }
}
