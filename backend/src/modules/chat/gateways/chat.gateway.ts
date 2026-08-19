import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat.service';
import { PrismaService } from '../../../common/prisma/prisma.service';

interface AuthedSocketUser {
  id: string;
  role: 'student' | 'expert' | 'admin';
  email: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // --- Auth on handshake ---
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        (client.handshake.headers.authorization as string | undefined)?.replace('Bearer ', '');

      if (!token) {
        throw new Error('No token provided');
      }

      const payload = await this.jwtService.verifyAsync(token);
      const user: AuthedSocketUser = { id: payload.sub, role: payload.role, email: payload.email };

      // Stash the verified user on the socket for every subsequent event.
      client.data.user = user;
    } catch (err: any) {
      this.logger.warn(`Rejected unauthenticated socket connection (${client.id}): ${err?.message || err}`);
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  // --- Join a conversation room, but only if you're actually in it ---
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const user: AuthedSocketUser | undefined = client.data.user;
    if (!user || !payload?.conversationId) {
      return { status: 'error', message: 'Unauthorized or missing conversationId' };
    }

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: payload.conversationId },
    });

    const isParticipant =
      conversation &&
      (user.role === 'admin' ||
        conversation.studentId === user.id ||
        conversation.expertId === user.id);

    if (!isParticipant) {
      client.emit('error', { message: 'Not a participant of this conversation' });
      return { status: 'error', message: 'Forbidden' };
    }

    client.join(payload.conversationId);
    return { status: 'joined', conversationId: payload.conversationId };
  }

  // --- Send a message, trusting only the verified socket user, never the payload ---
  @SubscribeMessage('message:send')
  async onMessageSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; body?: string; attachmentUrl?: string },
  ) {
    const user: AuthedSocketUser | undefined = client.data.user;
    if (!user || !payload?.conversationId) {
      return;
    }

    const message = await this.chatService.sendMessage(
      user,
      payload.conversationId,
      payload.body,
      payload.attachmentUrl,
    );

    this.server.to(payload.conversationId).emit('message:receive', message);
    return message;
  }

  @SubscribeMessage('typing')
  onTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; isTyping: boolean },
  ) {
    const user: AuthedSocketUser | undefined = client.data.user;
    if (!user || !payload?.conversationId) {
      return;
    }
    client.to(payload.conversationId).emit('user:typing', { senderId: user.id, isTyping: payload.isTyping });
  }
}