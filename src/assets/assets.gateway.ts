import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
// import { Category } from '@prisma/client';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AssetsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection() {
    // Optionally log or authenticate
  }

  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(`user_${userId}`);
  }

  emitAssetUpdated(assets: any, userId: string) {
    this.server.to(`user_${userId}`).emit('assetUpdated', assets);
  }
} 