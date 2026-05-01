import { Injectable, Scope, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { StandardResponseDto } from '@/shared/dto';
import { SessionDto } from './dto/session.dto';
import { EnumBrowserEngine, EnumBrowserName, EnumDeviceType, EnumOSName } from '@/types';
import { RedisService } from '../cache/redis.service';
import { EnumRedisDatabase } from '@/shared/enums/EnumRedisDatabase';
import { buildRedisKey, transformDates } from '@/shared/utils';
import { EnumRedisKey } from '@/shared/enums/EnumRedisKey';
import { PrismaService } from '../database/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @Inject(REQUEST) private readonly req: Request
  ) {}

  // Put in SessionService (or a shared util)
  private normalizeIp(raw?: string): string | null {
    if (!raw) return null;
    let ip = raw
      .split('،')[0]
      .trim()
      .replace(/^::ffff:/, '');
    if (ip === '::1') return '127.0.0.1'; // map IPv6 loopback
    return ip;
  }

  private extractSessionMeta(): Omit<SessionDto, 'id' | 'createdAt' | 'updatedAt'> {
    const ua = String(this.req.headers['user-agent'] ?? '');

    // Client Hints (Chromium)
    const stripQ = (v?: string) => v?.replace(/^"|"$/g, '');
    const chPlatform = stripQ(this.req.headers['sec-ch-ua-platform'] as string | undefined) || '';
    const chMobile = stripQ(this.req.headers['sec-ch-ua-mobile'] as string | undefined) || '';

    // IP (normalize IPv6-mapped IPv4)
    const candidates = [this.req.headers['x-real-ip'] as string | undefined, (this.req.headers['x-forwarded-for'] as string | undefined)?.split('،')[0]?.trim(), (this.req as any).ip as string | undefined, (this.req as any).socket?.remoteAddress as string | undefined, (this.req as any).connection?.remoteAddress as string | undefined];
    const ip = this.normalizeIp(candidates.find(Boolean));

    // Browser name & major
    let browserName = EnumBrowserName.OTHER;
    let browserMajor: number | undefined;

    const rx = {
      edge: /Edg\/(\d+)/,
      opera: /OPR\/(\d+)/,
      chrome: /Chrome\/(\d+)/,
      firefox: /Firefox\/(\d+)/,
      safariVer: /Version\/(\d+)/,
      safari: /Safari\/(\d+)/,
    };

    if (rx.edge.test(ua)) {
      browserName = EnumBrowserName.EDGE;
      browserMajor = Number(ua.match(rx.edge)?.[1]);
    } else if (rx.opera.test(ua)) {
      browserName = EnumBrowserName.OPERA;
      browserMajor = Number(ua.match(rx.opera)?.[1]);
    } else if (rx.chrome.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua)) {
      browserName = EnumBrowserName.CHROME;
      browserMajor = Number(ua.match(rx.chrome)?.[1]);
    } else if (rx.firefox.test(ua)) {
      browserName = EnumBrowserName.FIREFOX;
      browserMajor = Number(ua.match(rx.firefox)?.[1]);
    } else if (rx.safari.test(ua) && rx.safariVer.test(ua)) {
      browserName = EnumBrowserName.SAFARI;
      browserMajor = Number(ua.match(rx.safariVer)?.[1]);
    }

    // Engine inferred from browser
    const browserEngine = browserName === EnumBrowserName.FIREFOX ? EnumBrowserEngine.GECKO : browserName === EnumBrowserName.SAFARI ? EnumBrowserEngine.WEBKIT : browserName === EnumBrowserName.CHROME || browserName === EnumBrowserName.EDGE || browserName === EnumBrowserName.OPERA ? EnumBrowserEngine.BLINK : EnumBrowserEngine.OTHER;

    // OS name & version
    let osName = EnumOSName.OTHER;
    let osVersion: string | undefined;

    const p = chPlatform.toLowerCase();
    if (p.includes('windows')) osName = EnumOSName.WINDOWS;
    else if (p.includes('mac')) osName = EnumOSName.MACOS;
    else if (p.includes('android')) osName = EnumOSName.ANDROID;
    else if (p.includes('ios')) osName = EnumOSName.IOS;
    else if (p.includes('linux')) osName = EnumOSName.LINUX;

    if (osName === EnumOSName.OTHER) {
      // Fallback to classic UA parsing
      const mWin = ua.match(/Windows NT ([\d.]+)/);
      const mMac = ua.match(/Mac OS X ([\d_]+)/);
      const mAndroid = ua.match(/Android ([\d.]+)/);
      const mIOS = ua.match(/(?:iPhone|iPad).* OS ([\d_]+)/);
      if (mWin) {
        osName = EnumOSName.WINDOWS;
        osVersion = mWin[1];
      } else if (mMac) {
        osName = EnumOSName.MACOS;
        osVersion = mMac[1]?.replace(/_/g, '.');
      } else if (mAndroid) {
        osName = EnumOSName.ANDROID;
        osVersion = mAndroid[1];
      } else if (mIOS) {
        osName = EnumOSName.IOS;
        osVersion = mIOS[1]?.replace(/_/g, '.');
      } else if (/Linux/.test(ua)) {
        osName = EnumOSName.LINUX;
      }
    }

    // Device type
    let deviceType = EnumDeviceType.DESKTOP;
    if (chMobile === '?1' || /\bMobile\b/i.test(ua)) deviceType = EnumDeviceType.MOBILE;
    else if (/\b(iPad|Tablet)\b/i.test(ua)) deviceType = EnumDeviceType.TABLET;

    return {
      browserEngine,
      browserName,
      browserMajor,
      deviceType,
      osName,
      osVersion,
      ip,
      current: undefined,
    } as SessionDto;
  }

  public async validateUserOrThrow(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }, // فقط id مهمه
    });

    if (!user) {
      throw new NotFoundException({ detail: 'User not found.' });
    }
  }

  /** Maps DB record to DTO, preserving enum numeric values. */
  private mapToDto(
    s: {
      id: string;
      browserEngine: number;
      browserName: number;
      browserMajor?: number;
      deviceType: number;
      osName: number;
      osVersion?: string;
      ip?: string;
      createdAt: Date;
      updatedAt: Date | null;
    },
    currentSessionId?: string
  ): SessionDto {
    return transformDates({
      id: s.id,
      browserEngine: s.browserEngine as unknown as EnumBrowserEngine,
      browserName: s.browserName as unknown as EnumBrowserName,
      browserMajor: s.browserMajor ?? null,
      deviceType: s.deviceType as unknown as EnumDeviceType,
      osName: s.osName as unknown as EnumOSName,
      osVersion: s.osVersion ?? null,
      ip: s.ip ?? null,
      current: !!currentSessionId && s.id === currentSessionId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    });
  }

  public async getUserSessions(userId: number, currentSession: SessionDto | null): Promise<StandardResponseDto<SessionDto[]>> {
    await this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.USER_SESSION_CACHE);

    const sessionListKey = buildRedisKey(EnumRedisKey.USER_SESSION_IDS, [userId]);
    const sessionIdsStr = await this.redis.get(sessionListKey);
    const sessionKeys: string[] = sessionIdsStr ? JSON.parse(sessionIdsStr) : [];

    const sessionStrs = sessionKeys.length > 0 ? await this.redis.mget(sessionKeys) : [];
    const sessions: SessionDto[] = sessionStrs.filter(Boolean).map((str): SessionDto => JSON.parse(str!) as SessionDto);

    const currentSessionId = currentSession?.id;
    const data = sessions.map(s => this.mapToDto(s, currentSessionId)).sort((a, b) => Number(b.current) - Number(a.current));

    return new StandardResponseDto(
      {
        message: 'Fetched all sessions successfully',
        data,
      },
      { skipTransform: true }
    );
  }
  public async deleteAllSessionsExceptCurrent(userId: number, currentSession: SessionDto | null): Promise<void> {
    await this.validateUserOrThrow(userId);

    await this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.USER_SESSION_CACHE);

    const currentSessionId = currentSession?.id;

    // لیست کلیدهای سشن
    const sessionListKey = buildRedisKey(EnumRedisKey.USER_SESSION_IDS, [userId]);
    const sessionKeysStr = await this.redis.get(sessionListKey);
    const sessionKeys: string[] = sessionKeysStr ? JSON.parse(sessionKeysStr) : [];

    // پیدا کردن sessionKey مربوط به currentSessionId
    const sessionStrs = await this.redis.mget(sessionKeys);
    let keepSessionKey: string | undefined = undefined;
    for (let i = 0; i < sessionStrs.length; i++) {
      const str = sessionStrs[i];
      if (str) {
        const session = JSON.parse(str) as SessionDto;
        if (session.id === currentSessionId) {
          keepSessionKey = sessionKeys[i];
          break;
        }
      }
    }

    const toDelete = sessionKeys.filter(key => key !== keepSessionKey);

    await Promise.all(toDelete.map(key => this.redis.delete(key)));

    const newSessionList = keepSessionKey ? [keepSessionKey] : [];
    await this.redis.set(sessionListKey, JSON.stringify(newSessionList));
  }

  public async deleteSessionById(userId: number, sessionId: string, currentSession: SessionDto | null): Promise<void> {
    await this.validateUserOrThrow(userId);
    await this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.USER_SESSION_CACHE);

    if (!sessionId) {
      throw new BadRequestException({ detail: 'Invalid session id.' });
    }

    const sessionListKey = buildRedisKey(EnumRedisKey.USER_SESSION_IDS, [userId]);
    const sessionKeysStr = await this.redis.get(sessionListKey);
    const sessionKeys: string[] = sessionKeysStr ? JSON.parse(sessionKeysStr) : [];

    let sessionKeyToDelete: string | undefined = undefined;
    for (const key of sessionKeys) {
      const sessionStr = await this.redis.get(key);
      if (sessionStr) {
        const session = JSON.parse(sessionStr) as SessionDto;
        if (session.id === sessionId) {
          sessionKeyToDelete = key;
          break;
        }
      }
    }

    if (!sessionKeyToDelete) {
      throw new NotFoundException({ detail: 'Session not found.' });
    }

    await this.redis.delete(sessionKeyToDelete);

    const updatedSessionKeys = sessionKeys.filter(k => k !== sessionKeyToDelete);
    await this.redis.set(sessionListKey, JSON.stringify(updatedSessionKeys));
  }

  public async upsertFromRequest(userId: number): Promise<string | null> {
    await this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.USER_SESSION_CACHE);
    const meta = this.extractSessionMeta();

    const keyParts = [userId, meta.browserName, meta.osName, meta.deviceType];
    const sessionKey = buildRedisKey(EnumRedisKey.USER_SESSION, keyParts);
    const sessionListKey = buildRedisKey(EnumRedisKey.USER_SESSION_IDS, [userId]);

    let existingSessionStr = await this.redis.get(sessionKey);
    let sessionId: string;
    let now = new Date();
    if (existingSessionStr) {
      const session = JSON.parse(existingSessionStr) as SessionDto;
      session.browserEngine = meta.browserEngine;
      session.browserMajor = meta.browserMajor;
      session.osVersion = meta.osVersion;
      session.ip = meta.ip;
      session.updatedAt = now;
      await this.redis.set(sessionKey, JSON.stringify(session));
      sessionId = session.id;
    } else {
      const sessionIds = await this.redis.get(sessionListKey);
      let sessionIdsArr: string[] = sessionIds ? JSON.parse(sessionIds) : [];
      const MAX_SESSIONS = 3;
      if (sessionIdsArr.length >= MAX_SESSIONS) return null;

      sessionId = crypto.randomUUID();
      const newSession: SessionDto = {
        ...meta,
        id: sessionId,
        createdAt: now,
        updatedAt: now,
        current: false,
      };
      await this.redis.set(sessionKey, JSON.stringify(newSession));
      sessionIdsArr.unshift(sessionKey);
      await this.redis.set(sessionListKey, JSON.stringify(sessionIdsArr));
    }
    return sessionId;
  }

  public async findUserSessionBySessionId(userId: number, sessionId: string): Promise<SessionDto | null> {
    await this.validateUserOrThrow(userId);

    if (!sessionId) {
      throw new BadRequestException({ detail: 'Invalid session id.' });
    }

    await this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.USER_SESSION_CACHE);

    const sessionListKey = buildRedisKey(EnumRedisKey.USER_SESSION_IDS, [userId]);
    const sessionKeysStr = await this.redis.get(sessionListKey);
    const sessionKeys: string[] = sessionKeysStr ? JSON.parse(sessionKeysStr) : [];

    if (sessionKeys.length === 0) return null;

    const sessionStrs = await this.redis.mget(sessionKeys);

    for (const str of sessionStrs) {
      if (!str) continue;
      const session = JSON.parse(str) as SessionDto;
      if (session.id === sessionId) {
        return session;
      }
    }

    return null;
  }
}
