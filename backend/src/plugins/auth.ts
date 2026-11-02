import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../db.js";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";
import { ACCESS_COOKIE } from "../lib/tokens.js";
import type { AccessTokenPayload } from "../lib/tokens.js";

export type { UserRole } from "../generated/prisma/enums.js";

declare module "fastify" {
  interface FastifyRequest {
    /** Set by the `authenticate` preHandler for protected routes. */
    auth?: AccessTokenPayload & { userId: string };
  }
  interface FastifyInstance {
    /** Rejects the request with 401 unless a valid access token is present. */
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** Requires the signed-in user to hold one of the given roles. */
    requireRole: (
      roles: string[],
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /**
     * Resolves the merchant the request operates on. Platform admins may act
     * on any merchant by passing `merchantId`; merchant staff always operate
     * on their own tenant.
     */
    resolveMerchantId: (
      request: FastifyRequest,
      explicitMerchantId?: string | null,
    ) => Promise<string>;
  }
}

const PLATFORM_ROLES = ["PLATFORM_ADMIN"];

async function authPlugin(app: FastifyInstance): Promise<void> {
  app.decorate(
    "authenticate",
    async (request: FastifyRequest, _reply: FastifyReply) => {
      // Browsers send the session in an httpOnly cookie; API clients send
      // an Authorization header. Both are accepted.
      const cookieToken = request.cookies?.[ACCESS_COOKIE];
      if (cookieToken) {
        try {
          request.headers.authorization = `Bearer ${cookieToken}`;
        } catch {
          // Some Fastify versions freeze the headers object; fall back to
          // verifying the cookie directly below.
        }
      }

      let payload: AccessTokenPayload;
      try {
        payload = cookieToken
          ? await app.jwt.verify<AccessTokenPayload>(cookieToken)
          : await request.jwtVerify<AccessTokenPayload>();
      } catch {
        throw new UnauthorizedError("Your session has expired. Please sign in again.");
      }

      if (payload.typ !== "access") {
        throw new UnauthorizedError("A valid access token is required.");
      }

      // The token carries the role for cheap authorisation, but the user row
      // is the source of truth — re-read it so a suspended account loses
      // access immediately rather than at token expiry.
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, isActive: true, role: true, merchantId: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError("This account is not active.");
      }

      request.auth = {
        ...payload,
        userId: user.id,
        role: user.role,
        merchantId: user.merchantId,
      };
    },
  );

  app.decorate(
    "requireRole",
    (roles: string[]) =>
      async (request: FastifyRequest, _reply: FastifyReply) => {
        if (!request.auth) {
          throw new UnauthorizedError();
        }
        if (!roles.includes(request.auth.role)) {
          throw new ForbiddenError(
            "You do not have access to this resource.",
          );
        }
      },
  );

  app.decorate(
    "resolveMerchantId",
    async (request: FastifyRequest, explicitMerchantId?: string | null) => {
      if (!request.auth) throw new UnauthorizedError();

      const isPlatformAdmin = PLATFORM_ROLES.includes(request.auth.role);

      if (explicitMerchantId) {
        if (!isPlatformAdmin && request.auth.merchantId !== explicitMerchantId) {
          throw new ForbiddenError("You do not have access to this merchant.");
        }
        return explicitMerchantId;
      }

      if (isPlatformAdmin) {
        // A platform admin must name the merchant they are acting on.
        throw new ForbiddenError(
          "Specify which merchant you want to act on.",
        );
      }

      if (!request.auth.merchantId) {
        throw new ForbiddenError("Your account is not linked to a merchant.");
      }

      return request.auth.merchantId;
    },
  );
}

export default fp(authPlugin, { name: "auth" });
