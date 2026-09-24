export class ProfileResponseDto {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  points: number;
  xp: number;
  level: number;
  streak: number;
  emailVerified: boolean;
  createdAt: Date;
}
