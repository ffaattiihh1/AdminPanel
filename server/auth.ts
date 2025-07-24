import { db } from "./db";
import { users, User } from "@shared/schema";
import { eq, or } from "drizzle-orm";
import { Request as ExpressRequest, Response, NextFunction } from 'express';
import userAgent from 'express-useragent';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

declare module 'express' {
  interface Request {
    useragent?: any;
    user?: User;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export const activityLogger = (req: ExpressRequest, res: Response, next: NextFunction) => {
  const userIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const deviceInfo = {
    browser: req.useragent?.browser,
    version: req.useragent?.version,
    os: req.useragent?.os,
    platform: req.useragent?.platform,
    isMobile: req.useragent?.isMobile
  };

  if (req.user) {
    req.user.last_activity = new Date();
    req.user.activity_log = [...(req.user.activity_log || []), {
      timestamp: new Date(),
      action: req.path,
      ip: userIp,
      device: deviceInfo
    }];
  }

  next();
};

export async function login(req: ExpressRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "E-posta ve şifre zorunludur" 
      });
    }

    // Kullanıcıyı email veya username ile bul
    const user = await db.query.users.findFirst({
      where: or(
        eq(users.email, email),
        eq(users.username, email)
      )
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Kullanıcı bulunamadı" 
      });
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Geçersiz şifre" 
      });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email
      }, 
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası" 
    });
  }
}

export async function register(req: ExpressRequest, res: Response) {
  try {
    const { email, username, password, name, gender, city, age } = req.body;
    const consent_version = '1.0'; // KVKK onay versiyonu

    const existingUser = await db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.username, username)),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email/username zaten kullanılıyor',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      email,
      username,
      password: hashedPassword,
      name,
      gender,
      city,
      age,
      consent_version,
      ip_address: req.ip,
      device_info: {
        browser: req.useragent?.browser,
        os: req.useragent?.os,
        platform: req.useragent?.platform
      }
    }).returning();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
}

export async function updateProfile(req: ExpressRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, email, username } = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Kullanıcı ID zorunludur" 
      });
    }

    const updatedUser = await db.update(users)
      .set({ name, email, username })
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (!updatedUser || updatedUser.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Kullanıcı bulunamadı" 
      });
    }

    const { password: _, ...userWithoutPassword } = updatedUser[0];

    return res.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Profil güncellenirken hata oluştu" 
    });
  }
}
