import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Category } from '@prisma/client';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CategoriesGateway {
  @WebSocketServer()
  server: Server;

  emitCategoryUpdated(categories: any) {
    this.server.emit('categoryUpdated', categories);
  }
} 