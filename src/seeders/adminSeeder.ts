import bcrypt from 'bcrypt';
import User from '../models/User.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@library.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin1234!';

export const seedAdminUser = async (): Promise<void> => {
  const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({ email: ADMIN_EMAIL, password: hashedPassword, role: 'ADMIN' });
  console.log(`Utilisateur admin créé : ${ADMIN_EMAIL}`);
};
