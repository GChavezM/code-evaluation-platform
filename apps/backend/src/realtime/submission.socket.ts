import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import type { AccessTokenPayload } from '../lib/jwt.js';
import { verifyAccessToken } from '../lib/jwt.js';
import { UserRole } from '../generated/prisma/enums.js';
import config from '../config/config.js';
import { submissionService } from '../modules/submission/index.js';
import {
  submissionEvents,
  type SubmissionLifecycleEvent,
} from '../modules/submission/submission.events.js';

const SUBMISSION_ROOM_PREFIX = 'submission:';

function getAccessTokenFromHandshake(socket: {
  handshake: { auth?: unknown; headers: Record<string, unknown> };
}): string | null {
  const auth = socket.handshake.auth;
  if (typeof auth === 'object' && auth !== null && 'token' in auth) {
    const token = (auth as { token?: unknown }).token;
    if (typeof token === 'string' && token.length > 0) {
      return token;
    }
  }

  const headerValue = socket.handshake.headers['authorization'];
  if (typeof headerValue === 'string' && headerValue.startsWith('Bearer ')) {
    return headerValue.split(' ')[1] ?? null;
  }

  return null;
}

function getRoomName(submissionId: string): string {
  return `${SUBMISSION_ROOM_PREFIX}${submissionId}`;
}

function getUserFromHandshake(socket: {
  handshake: { auth?: unknown; headers: Record<string, unknown> };
}): AccessTokenPayload | null {
  const token = getAccessTokenFromHandshake(socket);

  if (!token) {
    return null;
  }

  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function createSubmissionSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [config.frontendUrl],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const user = getUserFromHandshake(socket);

    if (!user) {
      next(new Error('Authentication required'));
      return;
    }

    next();
  });

  io.on('connection', (socket) => {
    socket.on('submission:subscribe', async ({ submissionId }: { submissionId?: string }) => {
      const user = getUserFromHandshake(socket);

      if (!user || user.role !== UserRole.CODER) {
        socket.emit('submission:error', { message: 'Forbidden' });
        return;
      }

      if (typeof submissionId !== 'string' || submissionId.length === 0) {
        socket.emit('submission:error', { message: 'Invalid submission id' });
        return;
      }

      const ownershipResult = await submissionService.getById(
        submissionId,
        user.sub,
        UserRole.CODER
      );
      if (ownershipResult.isError()) {
        socket.emit('submission:error', { message: 'Not found or forbidden' });
        return;
      }

      await socket.join(getRoomName(submissionId));
      socket.emit('submission:subscribed', { submissionId });
    });

    socket.on('submission:unsubscribe', async ({ submissionId }: { submissionId?: string }) => {
      if (typeof submissionId !== 'string' || submissionId.length === 0) {
        return;
      }

      await socket.leave(getRoomName(submissionId));
    });
  });

  const off: () => void = submissionEvents.onLifecycle((event: SubmissionLifecycleEvent) => {
    io.to(getRoomName(event.submissionId)).emit('submission:update', event);
  });

  return {
    io,
    close: async () => {
      off();
      await io.close();
    },
  };
}
