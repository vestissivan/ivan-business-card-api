import type { PrismaClient } from '../generated/prisma/client';

export const PROFILE_ID = 'ivan-temnikov';

export async function seed(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.profile.upsert({
      where: { id: PROFILE_ID },
      create: { id: PROFILE_ID, name: 'Иван Темников', description: 'Разработка и автоматизация с AI-инструментами. Два года опыта автоматизации: боты, CRM, сайты и API-интеграции. Основной инструмент — Codex. Оренбург, полностью удалённая работа.' },
      update: { name: 'Иван Темников', description: 'Разработка и автоматизация с AI-инструментами. Два года опыта автоматизации: боты, CRM, сайты и API-интеграции. Основной инструмент — Codex. Оренбург, полностью удалённая работа.' },
    });
    const links = [
      { id: 'link-resume', label: 'Резюме HH', url: 'https://orenburg.hh.ru/resume/993e0e63ff0c159aec0039ed1f4c684c4d6d7a' },
      { id: 'link-telegram', label: 'Telegram', url: 'https://t.me/def325' },
    ];
    for (const [sortOrder, item] of links.entries()) {
      const data = { ...item, sortOrder, profileId: PROFILE_ID };
      await tx.professionalLink.upsert({ where: { id: item.id }, create: data, update: data });
    }
    const skills = ['Codex / ChatGPT', 'Python (базовый практический уровень)', 'JavaScript (базовый практический уровень)', 'Telegram-боты', 'REST API / OpenAI API', 'SQLite', 'Git / GitHub', 'Docker / VPS', 'CRM и автоматизация процессов', 'Google Sheets / Drive'];
    for (const [sortOrder, name] of skills.entries()) {
      const data = { id: `skill-${sortOrder}`, profileId: PROFILE_ID, name, sortOrder };
      await tx.skill.upsert({ where: { id: data.id }, create: data, update: data });
    }
    const experience = {
      id: 'experience-independent', profileId: PROFILE_ID,
      company: 'Самостоятельные проекты', position: 'Разработка и автоматизация с AI-инструментами',
      period: '2 года опыта автоматизации; точные календарные даты не указаны',
      startDate: null, endDate: null, sortOrder: 0,
      achievementsJson: JSON.stringify([
        'Python-бот для e-commerce: 84 Telegram-источника, дайджесты через OpenAI API, SQLite, очередь и расписание; Docker/VPS.',
        'Перед одним из выкатов бота прошли 18 тестов.',
        'CRM, веб-сайты и API-интеграции; автоматизация публикаций на 50+ социальных аккаунтов.',
      ]),
    };
    await tx.experience.upsert({ where: { id: experience.id }, create: experience, update: experience });
    const projects = [
      { id: 'project-torq', name: 'TORQ WORKS', description: 'Веб-проект автосервиса из портфолио.', url: 'https://torq-works.vercel.app' },
      { id: 'project-prism', name: 'PRISM/9', description: 'Веб-проект детейлинга из портфолио.', url: 'https://prism9-detailing.vercel.app' },
      { id: 'project-sloy', name: 'СЛОЙ', description: 'Веб-проект из портфолио.', url: 'https://ivandevv.ru/vanna/' },
    ];
    for (const [sortOrder, item] of projects.entries()) {
      const data = { ...item, sortOrder, profileId: PROFILE_ID };
      await tx.project.upsert({ where: { id: item.id }, create: data, update: data });
    }
  });
}
