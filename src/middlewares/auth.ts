import { Request, Response, NextFunction } from "express";
import { SignJWT, jwtVerify } from "jose-cjs";

const JWT_SECRET = process.env.JWT_SECRET || "flavor-matrix-default-jwt-secret-key-change-in-prod";
const ENCODED_SECRET = new TextEncoder().encode(JWT_SECRET);

interface JWTPayload {
  id: string;
  email: string;
  role: "admin" | "user";
}

/**
 * Generates a signed JWT with HS256 algorithm.
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(ENCODED_SECRET);
}

/**
 * Generates a signed JWT and sets it as an HTTPOnly cookie on the response.
 */
export async function signTokenAndSetCookie(res: Response, payload: JWTPayload): Promise<string> {
  const token = await signToken(payload);
  
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  });

  return token;
}

/**
 * Middleware that parses the token from cookies or authorization header,
 * validates it using jose-cjs, and appends user payload to req.user.
 */
export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = (req as any).cookies?.token;

    if (!token && req.headers.cookie) {
      const cookies = Object.fromEntries(
        req.headers.cookie.split(";").map((cookieStr) => {
          const [k, ...v] = cookieStr.trim().split("=");
          return [k, v.join("=")];
        })
      );
      token = cookies.token;
    }

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ error: "Unauthorized. Authentication cookie or Bearer token is missing." });
      return;
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, ENCODED_SECRET);
    
    const userPayload = payload as unknown as JWTPayload;

    // Check payload attributes
    if (!userPayload.id || !userPayload.email || !userPayload.role) {
      res.status(403).json({ error: "Forbidden. Access token payload is invalid." });
      return;
    }

    // Attach to extended Express Request user
    req.user = {
      id: userPayload.id,
      email: userPayload.email,
      role: userPayload.role,
    };

    next();
  } catch (error: any) {
    console.error("JWT Verification Error:", error.message || error);
    
    if (error.code === "ERR_JWT_EXPIRED") {
      res.status(401).json({ error: "Unauthorized. Access token has expired." });
      return;
    }
    
    res.status(401).json({ error: "Unauthorized. Access token is invalid." });
  }
}
