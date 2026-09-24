import { PrismaClient, Difficulty, QuestionType, AuditAction } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Roles
  const rolesData = [
    { name: 'USER', description: 'Standard platform user' },
    { name: 'INSTRUCTOR', description: 'Course and lab creator' },
    { name: 'ADMIN', description: 'Full system administrator' },
  ];

  const roles: Record<string, any> = {};
  for (const r of rolesData) {
    roles[r.name] = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
  }
  console.log('✔️ Roles seeded.');

  // 2. Development User
  const devUser = await prisma.user.upsert({
    where: { email: 'admin@cyberlab.local' },
    update: { username: 'cyberlab_admin' },
    create: {
      email: 'admin@cyberlab.local',
      username: 'cyberlab_admin',
      passwordHash: '$2b$10$development_placeholder_hash_only',
      emailVerified: true,
      bio: 'CyberLab Development Admin Account',
      points: 250,
      xp: 500,
      level: 2,
      streak: 3,
    },
  });

  // Assign ADMIN role to dev user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: devUser.id,
        roleId: roles['ADMIN'].id,
      },
    },
    update: {},
    create: {
      userId: devUser.id,
      roleId: roles['ADMIN'].id,
    },
  });
  console.log('✔️ Development user seeded.');

  // 3. Learning Path
  const learningPath = await prisma.learningPath.upsert({
    where: { slug: 'cybersecurity-fundamentals' },
    update: {
      title: 'Cybersecurity Fundamentals',
      description: 'A comprehensive beginner-friendly educational path covering core security, networking, linux, and web principles.',
      difficulty: Difficulty.BEGINNER,
      published: true,
    },
    create: {
      title: 'Cybersecurity Fundamentals',
      slug: 'cybersecurity-fundamentals',
      description: 'A comprehensive beginner-friendly educational path covering core security, networking, linux, and web principles.',
      difficulty: Difficulty.BEGINNER,
      published: true,
      sortOrder: 1,
    },
  });
  console.log('✔️ Learning Path seeded.');

  // 4. Courses
  const coursesData = [
    { title: 'Computer & Security Fundamentals', slug: 'computer-security-fundamentals', description: 'Introduction to basic computer systems and security concepts.', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
    { title: 'Networking Fundamentals', slug: 'networking-fundamentals', description: 'Learn how computer networks, IP addresses, and TCP/UDP work.', difficulty: Difficulty.EASY, sortOrder: 2 },
    { title: 'Linux Fundamentals', slug: 'linux-fundamentals', description: 'Master essential Linux command-line utilities and permissions.', difficulty: Difficulty.EASY, sortOrder: 3 },
    { title: 'Web Security Fundamentals', slug: 'web-security-fundamentals', description: 'Understand HTTP requests, responses, and session handling.', difficulty: Difficulty.MEDIUM, sortOrder: 4 },
  ];

  const courses: Record<string, any> = {};
  for (const c of coursesData) {
    courses[c.slug] = await prisma.course.upsert({
      where: { slug: c.slug },
      update: { ...c, learningPathId: learningPath.id, published: true },
      create: { ...c, learningPathId: learningPath.id, published: true },
    });
  }
  console.log('✔️ Courses seeded.');

  // 5. Rooms (5 Rooms)
  const roomsData = [
    { courseSlug: 'computer-security-fundamentals', title: 'Introduction to Cybersecurity', slug: 'intro-to-cybersecurity', description: 'Learn the core pillars of cybersecurity.', difficulty: Difficulty.BEGINNER, sortOrder: 1, estimatedMinutes: 30 },
    { courseSlug: 'networking-fundamentals', title: 'Understanding Networks', slug: 'understanding-networks', description: 'Explore IP addressing, routing, and ports.', difficulty: Difficulty.EASY, sortOrder: 1, estimatedMinutes: 45 },
    { courseSlug: 'linux-fundamentals', title: 'Linux Command Line Basics', slug: 'linux-command-line-basics', description: 'Navigate filesystems and execute core linux commands.', difficulty: Difficulty.EASY, sortOrder: 1, estimatedMinutes: 60 },
    { courseSlug: 'web-security-fundamentals', title: 'HTTP and Web Fundamentals', slug: 'http-and-web-fundamentals', description: 'Analyze web traffic, requests, and responses.', difficulty: Difficulty.MEDIUM, sortOrder: 1, estimatedMinutes: 45 },
    { courseSlug: 'web-security-fundamentals', title: 'Authentication Fundamentals', slug: 'authentication-fundamentals', description: 'Understand passwords, cookies, and session management.', difficulty: Difficulty.MEDIUM, sortOrder: 2, estimatedMinutes: 50 },
  ];

  const rooms: Record<string, any> = {};
  for (const r of roomsData) {
    const course = courses[r.courseSlug];
    const { courseSlug, ...roomFields } = r;
    rooms[r.slug] = await prisma.room.upsert({
      where: { slug: r.slug },
      update: { ...roomFields, courseId: course.id, published: true },
      create: { ...roomFields, courseId: course.id, published: true },
    });
  }
  console.log('✔️ Rooms seeded.');

  // 6. Tasks & Questions (Targeting 25+ questions across rooms)
  const tasksConfig = [
    {
      roomSlug: 'intro-to-cybersecurity',
      tasks: [
        {
          title: 'What Is Cybersecurity?', slug: 'what-is-cybersecurity', sortOrder: 1,
          questions: [
            { type: QuestionType.TRUE_FALSE, question: 'Cybersecurity involves protecting systems, networks, and programs from digital attacks.', answer: 'true', points: 10 },
            { type: QuestionType.TEXT, question: 'What C-word represents ensuring data is accessible only to those authorized to have access?', answer: 'Confidentiality', points: 15 },
          ]
        },
        {
          title: 'Common Security Concepts', slug: 'common-security-concepts', sortOrder: 2,
          questions: [
            { type: QuestionType.MCQ, question: 'Which of the following describes the "I" in the CIA triad?', answer: 'Integrity', points: 10, options: [{ text: 'Availability', isCorrect: false }, { text: 'Integrity', isCorrect: true }, { text: 'Isolation', isCorrect: false }, { text: 'Interception', isCorrect: false }] },
            { type: QuestionType.TRUE_FALSE, question: 'Availability ensures that authorized users have access to information and resources when needed.', answer: 'true', points: 10 },
          ]
        },
        {
          title: 'Attack Surface Basics', slug: 'attack-surface-basics', sortOrder: 3,
          questions: [
            { type: QuestionType.TEXT, question: 'What term refers to the sum of all points where an unauthorized user can enter a system?', answer: 'Attack Surface', points: 15 },
          ]
        }
      ]
    },
    {
      roomSlug: 'understanding-networks',
      tasks: [
        {
          title: 'IP Addresses', slug: 'ip-addresses', sortOrder: 1,
          questions: [
            { type: QuestionType.NUMERIC, question: 'How many bits are in an IPv4 address?', answer: '32', points: 10, hints: [{ content: 'Think about how many binary positions make up an IPv4 address.', penaltyPoints: 2 }] },
            { type: QuestionType.TRUE_FALSE, question: 'IPv6 addresses are 128 bits long.', answer: 'true', points: 10 },
          ]
        },
        {
          title: 'TCP and UDP', slug: 'tcp-and-udp', sortOrder: 2,
          questions: [
            { type: QuestionType.TRUE_FALSE, question: 'TCP is a connection-oriented protocol.', answer: 'true', points: 10, hints: [{ content: 'Consider whether a handshake is required before data transfer in TCP.', penaltyPoints: 1 }] },
            { type: QuestionType.MCQ, question: 'Which protocol is connectionless and does not guarantee delivery?', answer: 'UDP', points: 10, options: [{ text: 'TCP', isCorrect: false }, { text: 'UDP', isCorrect: true }, { text: 'HTTP', isCorrect: false }, { text: 'FTP', isCorrect: false }] },
          ]
        },
        {
          title: 'Ports and Services', slug: 'ports-and-services', sortOrder: 3,
          questions: [
            { type: QuestionType.NUMERIC, question: 'How many well-known TCP/UDP ports exist in the traditional 0-1023 range?', answer: '1024', points: 15 },
            { type: QuestionType.MCQ, question: 'Which protocol is commonly used to securely access a remote Linux system?', answer: 'SSH', points: 10, options: [{ text: 'FTP', isCorrect: false }, { text: 'SSH', isCorrect: true }, { text: 'HTTP', isCorrect: false }, { text: 'SMTP', isCorrect: false }], hints: [{ content: 'Think of the standard secure remote-login protocol for Unix-like systems.', penaltyPoints: 2 }] },
          ]
        }
      ]
    },
    {
      roomSlug: 'linux-command-line-basics',
      tasks: [
        {
          title: 'Linux Filesystem', slug: 'linux-filesystem', sortOrder: 1,
          questions: [
            { type: QuestionType.TEXT, question: 'What is the root directory symbol in Linux?', answer: '/', points: 10 },
            { type: QuestionType.TRUE_FALSE, question: 'In Linux, everything is considered a file or a process.', answer: 'true', points: 10 },
          ]
        },
        {
          title: 'Basic Commands', slug: 'basic-commands', sortOrder: 2,
          questions: [
            { type: QuestionType.TEXT, question: 'Which command prints the current working directory path?', answer: 'pwd', points: 10 },
            { type: QuestionType.MCQ, question: 'Which command is used to list directory contents in Linux?', answer: 'ls', points: 10, options: [{ text: 'dirlist', isCorrect: false }, { text: 'show', isCorrect: false }, { text: 'ls', isCorrect: true }, { text: 'list', isCorrect: false }] },
          ]
        },
        {
          title: 'Users and Permissions', slug: 'users-and-permissions', sortOrder: 3,
          questions: [
            { type: QuestionType.TRUE_FALSE, question: 'Linux file permissions control read, write, and execute access.', answer: 'true', points: 10, hints: [{ content: 'Recall the rwx permission triplet.', penaltyPoints: 1 }] },
          ]
        }
      ]
    },
    {
      roomSlug: 'http-and-web-fundamentals',
      tasks: [
        {
          title: 'HTTP Requests', slug: 'http-requests', sortOrder: 1,
          questions: [
            { type: QuestionType.MCQ, question: 'Which HTTP method is typically used to retrieve data from a server?', answer: 'GET', points: 10, options: [{ text: 'POST', isCorrect: false }, { text: 'GET', isCorrect: true }, { text: 'DELETE', isCorrect: false }, { text: 'PUT', isCorrect: false }] },
            { type: QuestionType.TRUE_FALSE, question: 'HTTPS can protect HTTP traffic using TLS encryption.', answer: 'true', points: 10 },
          ]
        },
        {
          title: 'HTTP Responses', slug: 'http-responses', sortOrder: 2,
          questions: [
            { type: QuestionType.NUMERIC, question: 'What standard HTTP status code represents a successful request (OK)?', answer: '200', points: 10 },
            { type: QuestionType.NUMERIC, question: 'What HTTP status code represents "Not Found"?', answer: '404', points: 10 },
          ]
        }
      ]
    },
    {
      roomSlug: 'authentication-fundamentals',
      tasks: [
        {
          title: 'Authentication vs Authorization', slug: 'authn-vs-authz', sortOrder: 1,
          questions: [
            { type: QuestionType.TRUE_FALSE, question: 'Authentication verifies who you are, while authorization verifies what you are allowed to do.', answer: 'true', points: 10 },
            { type: QuestionType.TRUE_FALSE, question: 'Authentication and authorization mean exactly the same thing.', answer: 'false', points: 10 },
          ]
        },
        {
          title: 'Passwords and Sessions', slug: 'passwords-and-sessions', sortOrder: 2,
          questions: [
            { type: QuestionType.TEXT, question: 'What cryptographic operation is recommended for securely storing passwords instead of encryption?', answer: 'Hashing', points: 15 },
            { type: QuestionType.MCQ, question: 'Which mechanism is commonly used by web applications to maintain user session state across requests?', answer: 'Cookies', points: 10, options: [{ text: 'Cookies', isCorrect: true }, { text: 'Routers', isCorrect: false }, { text: 'Firewalls', isCorrect: false }, { text: 'MAC Addresses', isCorrect: false }] },
          ]
        }
      ]
    }
  ];

  for (const tConfig of tasksConfig) {
    const room = rooms[tConfig.roomSlug];
    if (!room) continue;

    for (const taskItem of tConfig.tasks) {
      const { questions, ...taskFields } = taskItem;
      const task = await prisma.task.create({
        data: {
          ...taskFields,
          roomId: room.id,
        },
      });

      for (const q of questions) {
        const { options, hints, ...qFields } = q as any;
        const question = await prisma.question.create({
          data: {
            ...qFields,
            taskId: task.id,
          },
        });

        if (options && options.length > 0) {
          for (const opt of options) {
            await prisma.questionOption.create({
              data: {
                ...opt,
                questionId: question.id,
              },
            });
          }
        }

        if (hints && hints.length > 0) {
          for (const h of hints) {
            await prisma.hint.create({
              data: {
                ...h,
                questionId: question.id,
              },
            });
          }
        }
      }
    }
  }
  console.log('✔️ Tasks, Questions, Options, and Hints seeded.');

  // 7. Badges
  const badgesData = [
    { name: 'First Steps', slug: 'first-steps', description: 'Completed your first onboarding step in CyberLab.', icon: 'award' },
    { name: 'Network Explorer', slug: 'network-explorer', description: 'Explored core networking and protocol basics.', icon: 'globe' },
    { name: 'Linux Beginner', slug: 'linux-beginner', description: 'Mastered fundamental Linux command-line navigation.', icon: 'terminal' },
    { name: 'Web Foundations', slug: 'web-foundations', description: 'Learned HTTP requests, responses, and session concepts.', icon: 'globe' },
    { name: 'CyberLab Starter', slug: 'cyberlab-starter', description: 'Joined the platform and began your cybersecurity journey.', icon: 'star' },
  ];

  const seededBadges = [];
  for (const b of badgesData) {
    const badge = await prisma.badge.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
    seededBadges.push(badge);
  }
  console.log('✔️ Badges seeded.');

  // 8. Achievements
  const achievementsData = [
    { name: 'Complete Your First Room', slug: 'complete-first-room', description: 'Successfully finish any educational room.', type: 'ROOMS_COMPLETED', target: 1, points: 50 },
    { name: 'Complete 5 Rooms', slug: 'complete-5-rooms', description: 'Successfully finish 5 different rooms.', type: 'ROOMS_COMPLETED', target: 5, points: 200 },
    { name: 'Answer 10 Questions', slug: 'answer-10-questions', description: 'Correctly answer 10 challenges.', type: 'QUESTIONS_ANSWERED', target: 10, points: 100 },
    { name: 'Finish Networking Fundamentals', slug: 'finish-networking', description: 'Complete the entire Networking Fundamentals course.', type: 'COURSE_COMPLETED', target: 1, points: 150 },
  ];

  const seededAchievements = [];
  for (const a of achievementsData) {
    const ach = await prisma.achievement.upsert({
      where: { slug: a.slug },
      update: a,
      create: a,
    });
    seededAchievements.push(ach);
  }
  console.log('✔️ Achievements seeded.');

  // 9. Machine Template & Machine (Disabled, safe placeholder)
  const machineTemplate = await prisma.machineTemplate.upsert({
    where: { slug: 'linux-fundamentals-lab' },
    update: {
      name: 'Linux Fundamentals Lab',
      description: 'Development placeholder for a future isolated Linux security lab.',
      difficulty: Difficulty.EASY,
      image: 'cyberlab/linux-base:dev',
      enabled: false,
    },
    create: {
      name: 'Linux Fundamentals Lab',
      slug: 'linux-fundamentals-lab',
      description: 'Development placeholder for a future isolated Linux security lab.',
      difficulty: Difficulty.EASY,
      image: 'cyberlab/linux-base:dev',
      enabled: false,
    },
  });

  const firstRoom = Object.values(rooms)[0];
  if (firstRoom) {
    await prisma.machine.createMany({
      data: [
        {
          roomId: firstRoom.id,
          machineTemplateId: machineTemplate.id,
          name: 'Sandbox Linux Target',
          description: 'Disabled dev placeholder machine.',
          required: false,
        },
      ],
      skipDuplicates: true,
    });
  }
  console.log('✔️ Machine template & placeholder machine seeded.');

  // 10. Sample User Badge & Achievement Assignment
  if (devUser && seededBadges.length > 0) {
    await prisma.userBadge.upsert({
      where: {
        userId_badgeId: {
          userId: devUser.id,
          badgeId: seededBadges[0].id,
        },
      },
      update: {},
      create: {
        userId: devUser.id,
        badgeId: seededBadges[0].id,
      },
    });
  }

  if (devUser && seededAchievements.length > 0) {
    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId: devUser.id,
          achievementId: seededAchievements[0].id,
        },
      },
      update: {},
      create: {
        userId: devUser.id,
        achievementId: seededAchievements[0].id,
      },
    });
  }
  console.log('✔️ User badge & achievement relationships seeded.');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
