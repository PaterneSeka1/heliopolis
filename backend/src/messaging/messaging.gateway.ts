import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagingService } from './messaging.service.js';
import { JwtService } from '@nestjs/jwt';
import { MessageType } from '../../generated/prisma/enums.js';

interface JwtPayload {
  sub: string;
  role: string;
}

interface SocketData {
  userId?: string;
}

interface SendMessagePayload {
  conversationId: string;
  contenu: string;
  type?: MessageType;
}

function getSocketData(client: Socket): SocketData {
  return client.data as SocketData;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  declare server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private messagingService: MessagingService,
    private jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const auth = client.handshake.auth as { token?: unknown } | undefined;
      const header = client.handshake.headers?.authorization;
      const bearer =
        typeof header === 'string' ? header.split(' ')[1] : undefined;
      const token = typeof auth?.token === 'string' ? auth.token : bearer;
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'codex-gardiens-secret',
      });
      getSocketData(client).userId = payload.sub;

      if (!this.userSockets.has(payload.sub)) {
        this.userSockets.set(payload.sub, new Set());
      }
      this.userSockets.get(payload.sub)!.add(client.id);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = getSocketData(client).userId;
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
    }
  }

  @SubscribeMessage('join:conversation')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    const userId = getSocketData(client).userId;
    if (!userId) {
      client.disconnect();
      return { joined: false };
    }
    await this.messagingService.assertMember(conversationId, userId);
    await client.join(`conv:${conversationId}`);
    return { joined: conversationId };
  }

  @SubscribeMessage('leave:conversation')
  async leaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    await client.leave(`conv:${conversationId}`);
  }

  @SubscribeMessage('send:message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessagePayload,
  ) {
    const userId = getSocketData(client).userId;
    if (!userId) {
      client.disconnect();
      return null;
    }
    const message = await this.messagingService.sendMessage(
      data.conversationId,
      userId,
      data,
    );
    this.server.to(`conv:${data.conversationId}`).emit('new:message', message);
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; typing: boolean },
  ) {
    client.to(`conv:${data.conversationId}`).emit('typing', {
      userId: getSocketData(client).userId,
      typing: data.typing,
    });
  }
}
