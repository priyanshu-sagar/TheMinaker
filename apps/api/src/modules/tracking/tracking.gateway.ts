import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { AuthUser } from '@minaker/shared-types';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TrackingGateway.name);
  private redisSub!: Redis;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.redisSub = new Redis(redisUrl);

    // Subscribe to all tenant telemetry broadcasts using Redis pattern subscribe
    this.redisSub.psubscribe('tenant:*:telemetry', (err) => {
      if (err) this.logger.error('Redis psubscribe error', err);
    });

    this.redisSub.on('pmessage', (pattern, channel, message) => {
      // channel format: tenant:{tenantId}:telemetry
      const tenantId = channel.split(':')[1];
      if (tenantId) {
        // Broadcast only to users in this tenant's room
        this.server.to(`tenant:${tenantId}`).emit('bus_location_update', JSON.parse(message));
      }
    });
  }

  onModuleDestroy() {
    this.redisSub?.disconnect();
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) throw new Error('No token');

      const payload = await this.jwtService.verifyAsync<AuthUser & { sub: string }>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (!payload.tenantId) throw new Error('No tenant ID in token');

      // Join the tenant-specific room so they only receive their school's bus updates
      const room = `tenant:${payload.tenantId}`;
      void client.join(room);
      
      this.logger.debug(`Client ${client.id} joined room ${room}`);
    } catch (err) {
      this.logger.warn(`Unauthorized WebSocket connection attempt: ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  private extractToken(client: Socket): string | undefined {
    const auth = client.handshake.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }
    // Fallback to query param for environments where headers are restricted
    const tokenQuery = client.handshake.query.token;
    return typeof tokenQuery === 'string' ? tokenQuery : undefined;
  }
}
