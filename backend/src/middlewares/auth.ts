import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type UserRole = "admin" | "manager" | "partner" | "client";

interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Не авторизован: токен отсутствует" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "super_secret_jwt_key_ortera_2026"
    ) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Неверный или истекший токен" });
  }
};

export const requireRoles = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Доступ запрещен: недостаточно прав" });
      return;
    }
    next();
  };
};