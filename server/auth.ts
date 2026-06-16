import type { Express, RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import type { User } from "@shared/schema";

const PgSession = connectPgSimple(session);

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set in production (see deploy/ecosystem.config.cjs)",
    );
  }
  const sessionSecret =
    process.env.SESSION_SECRET || "medeo-dev-session-secret-change-me";

  app.set("trust proxy", 1);
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "session",
        createTableIfMissing: true,
      }),
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Неверный логин или пароль" });
        }
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          return done(null, false, { message: "Неверный логин или пароль" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, (user as User).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (err) {
      done(err);
    }
  });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Требуется авторизация" });
};
