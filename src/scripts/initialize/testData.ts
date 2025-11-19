import { prisma } from "../../services/prisma";
import logger from "../../services/logger";

export const initializeTestData = async () => {
  try {
    logger.info("Iniciando inserción de datos de prueba...");

    const clients = await prisma.user.findMany({
      where: {
        rol: {
          description: "client",
        },
      },
    });

    const recruiters = await prisma.user.findMany({
      where: {
        rol: {
          description: "user",
        },
      },
    });

    const talents = await prisma.user.findMany({
      where: {
        rol: {
          description: "talent",
        },
      },
    });

    if (clients.length === 0 || recruiters.length === 0 || talents.length === 0) {
      logger.warn("No hay suficientes usuarios. Asegúrate de inicializar usuarios primero.");
      return;
    }

    logger.info("Creando posiciones...");
    const positions = [];

    const positionData = [
      {
        title: "Desarrollador Full Stack Senior",
        description: "Buscamos un desarrollador full stack con experiencia en React, Node.js y bases de datos. Debe tener al menos 5 años de experiencia.",
        requirements: [
          "5+ años de experiencia en desarrollo web",
          "Experiencia con React y Node.js",
          "Conocimiento de bases de datos SQL y NoSQL",
          "Experiencia con Git y metodologías ágiles",
        ],
        location: "Buenos Aires, Argentina",
        salaryMin: 80000,
        salaryMax: 120000,
        currency: "USD",
        status: "published",
        keywords: ["React", "Node.js", "Full Stack", "TypeScript", "PostgreSQL"],
        clientId: clients[0].id,
      },
      {
        title: "Product Manager",
        description: "Buscamos un Product Manager con experiencia en productos digitales y liderazgo de equipos.",
        requirements: [
          "3+ años de experiencia como Product Manager",
          "Experiencia con metodologías ágiles",
          "Habilidades de liderazgo y comunicación",
          "Conocimiento de análisis de datos",
        ],
        location: "Remote",
        salaryMin: 70000,
        salaryMax: 100000,
        currency: "USD",
        status: "published",
        keywords: ["Product Management", "Agile", "Leadership", "Analytics"],
        clientId: clients[0].id,
      },
      {
        title: "Diseñador UX/UI",
        description: "Buscamos un diseñador UX/UI creativo con experiencia en diseño de interfaces web y móviles.",
        requirements: [
          "3+ años de experiencia en diseño UX/UI",
          "Portfolio demostrable",
          "Conocimiento de Figma, Sketch o Adobe XD",
          "Experiencia con diseño responsive",
        ],
        location: "Barcelona, España",
        salaryMin: 50000,
        salaryMax: 75000,
        currency: "EUR",
        status: "draft",
        keywords: ["UX", "UI", "Design", "Figma", "User Research"],
        clientId: clients[0].id,
      },
      {
        title: "DevOps Engineer",
        description: "Buscamos un DevOps Engineer para gestionar infraestructura cloud y pipelines de CI/CD.",
        requirements: [
          "4+ años de experiencia en DevOps",
          "Experiencia con AWS, Azure o GCP",
          "Conocimiento de Docker y Kubernetes",
          "Experiencia con CI/CD pipelines",
        ],
        location: "Remote",
        salaryMin: 90000,
        salaryMax: 130000,
        currency: "USD",
        status: "published",
        keywords: ["DevOps", "AWS", "Docker", "Kubernetes", "CI/CD"],
        clientId: clients.length > 1 ? clients[1].id : clients[0].id,
      },
      {
        title: "Data Scientist",
        description: "Buscamos un Data Scientist para trabajar en proyectos de machine learning y análisis de datos.",
        requirements: [
          "3+ años de experiencia en Data Science",
          "Conocimiento de Python y R",
          "Experiencia con machine learning",
          "Conocimiento de SQL y bases de datos",
        ],
        location: "Madrid, España",
        salaryMin: 60000,
        salaryMax: 90000,
        currency: "EUR",
        status: "closed",
        keywords: ["Data Science", "Python", "Machine Learning", "SQL", "R"],
        clientId: clients.length > 1 ? clients[1].id : clients[0].id,
      },
      {
        title: "Backend Developer",
        description: "Buscamos un desarrollador backend con experiencia en microservicios y arquitectura escalable.",
        requirements: [
          "4+ años de experiencia en desarrollo backend",
          "Experiencia con Java, Python o Go",
          "Conocimiento de microservicios",
          "Experiencia con bases de datos distribuidas",
        ],
        location: "Remote",
        salaryMin: 85000,
        salaryMax: 115000,
        currency: "USD",
        status: "published",
        keywords: ["Backend", "Microservices", "Java", "Python", "Go"],
        clientId: clients.length > 2 ? clients[2].id : clients[0].id,
      },
      {
        title: "Frontend Developer",
        description: "Buscamos un desarrollador frontend especializado en React y TypeScript.",
        requirements: [
          "3+ años de experiencia en desarrollo frontend",
          "Experiencia con React y TypeScript",
          "Conocimiento de CSS moderno y frameworks",
          "Experiencia con testing",
        ],
        location: "Bogotá, Colombia",
        salaryMin: 60000,
        salaryMax: 90000,
        currency: "USD",
        status: "published",
        keywords: ["Frontend", "React", "TypeScript", "CSS", "Testing"],
        clientId: clients.length > 2 ? clients[2].id : clients[0].id,
      },
      {
        title: "QA Engineer",
        description: "Buscamos un QA Engineer para asegurar la calidad de nuestros productos.",
        requirements: [
          "3+ años de experiencia en QA",
          "Experiencia con testing automatizado",
          "Conocimiento de Selenium, Cypress o similar",
          "Experiencia con metodologías ágiles",
        ],
        location: "Remote",
        salaryMin: 55000,
        salaryMax: 80000,
        currency: "USD",
        status: "draft",
        keywords: ["QA", "Testing", "Automation", "Selenium", "Cypress"],
        clientId: clients.length > 3 ? clients[3].id : clients[0].id,
      },
      {
        title: "Mobile Developer (iOS/Android)",
        description: "Buscamos un desarrollador móvil con experiencia en iOS y/o Android.",
        requirements: [
          "3+ años de experiencia en desarrollo móvil",
          "Experiencia con Swift/Kotlin o React Native",
          "Conocimiento de arquitecturas móviles",
          "Portfolio de apps publicadas",
        ],
        location: "São Paulo, Brasil",
        salaryMin: 70000,
        salaryMax: 100000,
        currency: "USD",
        status: "published",
        keywords: ["Mobile", "iOS", "Android", "React Native", "Swift"],
        clientId: clients.length > 3 ? clients[3].id : clients[0].id,
      },
      {
        title: "Security Engineer",
        description: "Buscamos un Security Engineer para proteger nuestros sistemas y datos.",
        requirements: [
          "4+ años de experiencia en seguridad",
          "Conocimiento de seguridad de aplicaciones",
          "Experiencia con penetration testing",
          "Certificaciones en seguridad (opcional)",
        ],
        location: "Remote",
        salaryMin: 95000,
        salaryMax: 140000,
        currency: "USD",
        status: "published",
        keywords: ["Security", "Cybersecurity", "Penetration Testing", "OWASP"],
        clientId: clients.length > 4 ? clients[4].id : clients[0].id,
      },
    ];

    for (const posData of positionData) {
      const existing = await prisma.position.findFirst({
        where: {
          title: posData.title,
          clientId: posData.clientId,
        },
      });

      if (!existing) {
        const position = await prisma.position.create({
          data: posData,
        });
        positions.push(position);
        logger.info(`Posición creada: ${position.title}`);
      } else {
        positions.push(existing);
      }
    }

    logger.info("Creando procesos...");
    const processes = [];

    const processData = [
      {
        title: "Proceso de Selección - Desarrollador Full Stack",
        description: "Proceso de selección para el puesto de Desarrollador Full Stack Senior",
        status: "in_progress",
        positionId: positions[0].id,
        recruiterId: recruiters[0].id,
        clientId: positions[0].clientId,
        stages: [
          { name: "Aplicación Inicial", order: 1 },
          { name: "Screening Técnico", order: 2 },
          { name: "Entrevista Técnica", order: 3 },
          { name: "Entrevista Final", order: 4 },
          { name: "Oferta", order: 5 },
        ],
        candidates: [
          { talentId: talents[0].id, stageOrder: 2, status: "in_review", notes: "Candidato con buena experiencia en React" },
          { talentId: talents[1].id, stageOrder: 3, status: "approved", notes: "Excelente entrevista técnica" },
        ],
      },
      {
        title: "Proceso de Selección - Product Manager",
        description: "Proceso de selección para el puesto de Product Manager",
        status: "open",
        positionId: positions[1].id,
        recruiterId: recruiters[0].id,
        clientId: positions[1].clientId,
        stages: [
          { name: "Aplicación", order: 1 },
          { name: "Entrevista Inicial", order: 2 },
          { name: "Case Study", order: 3 },
          { name: "Entrevista Final", order: 4 },
        ],
        candidates: [
          { talentId: talents[0].id, stageOrder: 1, status: "pending", notes: null },
        ],
      },
      {
        title: "Proceso de Selección - DevOps Engineer",
        description: "Proceso de selección para el puesto de DevOps Engineer",
        status: "in_progress",
        positionId: positions[3].id,
        recruiterId: recruiters.length > 1 ? recruiters[1].id : recruiters[0].id,
        clientId: positions[3].clientId,
        stages: [
          { name: "Aplicación", order: 1 },
          { name: "Screening", order: 2 },
          { name: "Entrevista Técnica", order: 3 },
          { name: "Oferta", order: 4 },
        ],
        candidates: [
          { talentId: talents[1].id, stageOrder: 2, status: "in_review", notes: "Experiencia sólida en AWS" },
          { talentId: talents.length > 2 ? talents[2].id : talents[0].id, stageOrder: 1, status: "pending", notes: null },
        ],
      },
      {
        title: "Proceso de Selección - Data Scientist",
        description: "Proceso de selección para el puesto de Data Scientist",
        status: "closed",
        positionId: positions[4].id,
        recruiterId: recruiters[0].id,
        clientId: positions[4].clientId,
        stages: [
          { name: "Aplicación", order: 1 },
          { name: "Evaluación Técnica", order: 2 },
          { name: "Entrevista", order: 3 },
          { name: "Oferta", order: 4 },
        ],
        candidates: [
          { talentId: talents[0].id, stageOrder: 4, status: "approved", notes: "Candidato seleccionado" },
        ],
      },
      {
        title: "Proceso de Selección - Backend Developer",
        description: "Proceso de selección para el puesto de Backend Developer",
        status: "in_progress",
        positionId: positions[5].id,
        recruiterId: recruiters.length > 1 ? recruiters[1].id : recruiters[0].id,
        clientId: positions[5].clientId,
        stages: [
          { name: "Aplicación", order: 1 },
          { name: "Screening", order: 2 },
          { name: "Entrevista Técnica", order: 3 },
          { name: "Code Review", order: 4 },
          { name: "Oferta", order: 5 },
        ],
        candidates: [
          { talentId: talents[2]?.id || talents[0].id, stageOrder: 3, status: "in_review", notes: "Buen conocimiento de microservicios" },
          { talentId: talents[3]?.id || talents[1].id, stageOrder: 2, status: "approved", notes: "Experiencia sólida" },
        ],
      },
      {
        title: "Proceso de Selección - Frontend Developer",
        description: "Proceso de selección para el puesto de Frontend Developer",
        status: "open",
        positionId: positions[6].id,
        recruiterId: recruiters.length > 2 ? recruiters[2].id : recruiters[0].id,
        clientId: positions[6].clientId,
        stages: [
          { name: "Aplicación", order: 1 },
          { name: "Entrevista Inicial", order: 2 },
          { name: "Prueba Técnica", order: 3 },
          { name: "Entrevista Final", order: 4 },
        ],
        candidates: [
          { talentId: talents[4]?.id || talents[0].id, stageOrder: 1, status: "pending", notes: null },
          { talentId: talents[5]?.id || talents[1].id, stageOrder: 1, status: "pending", notes: null },
        ],
      },
      {
        title: "Proceso de Selección - Mobile Developer",
        description: "Proceso de selección para el puesto de Mobile Developer",
        status: "in_progress",
        positionId: positions[8].id,
        recruiterId: recruiters.length > 3 ? recruiters[3].id : recruiters[0].id,
        clientId: positions[8].clientId,
        stages: [
          { name: "Aplicación", order: 1 },
          { name: "Portfolio Review", order: 2 },
          { name: "Entrevista Técnica", order: 3 },
          { name: "Oferta", order: 4 },
        ],
        candidates: [
          { talentId: talents[6]?.id || talents[0].id, stageOrder: 3, status: "in_review", notes: "Portfolio impresionante" },
          { talentId: talents[7]?.id || talents[1].id, stageOrder: 2, status: "approved", notes: "Experiencia en React Native" },
        ],
      },
      {
        title: "Proceso de Selección - Security Engineer",
        description: "Proceso de selección para el puesto de Security Engineer",
        status: "open",
        positionId: positions[9].id,
        recruiterId: recruiters.length > 4 ? recruiters[4].id : recruiters[0].id,
        clientId: positions[9].clientId,
        stages: [
          { name: "Aplicación", order: 1 },
          { name: "Screening de Seguridad", order: 2 },
          { name: "Entrevista Técnica", order: 3 },
          { name: "Background Check", order: 4 },
          { name: "Oferta", order: 5 },
        ],
        candidates: [
          { talentId: talents[8]?.id || talents[0].id, stageOrder: 1, status: "pending", notes: null },
        ],
      },
    ];

    for (const procData of processData) {
      const existing = await prisma.process.findFirst({
        where: {
          title: procData.title,
          positionId: procData.positionId,
        },
      });

      if (!existing) {
        const process = await prisma.process.create({
          data: {
            title: procData.title,
            description: procData.description,
            status: procData.status,
            positionId: procData.positionId,
            recruiterId: procData.recruiterId,
            clientId: procData.clientId,
            stages: {
              create: procData.stages,
            },
          },
          include: {
            stages: true,
          },
        });

        for (const candidateData of procData.candidates) {
          const stage = process.stages.find((s) => s.order === candidateData.stageOrder);
          if (stage) {
            await prisma.processCandidate.create({
              data: {
                processId: process.id,
                talentId: candidateData.talentId,
                stageId: stage.id,
                status: candidateData.status,
                notes: candidateData.notes,
              },
            });
          }
        }

        processes.push(process);
        logger.info(`Proceso creado: ${process.title}`);
      } else {
        processes.push(existing);
      }
    }

    logger.info("Creando perfiles de talentos...");
    const talentProfiles = [
      {
        talentId: talents[0].id,
        keywords: ["React", "Node.js", "TypeScript", "Full Stack", "PostgreSQL"],
        skills: [
          "React",
          "Node.js",
          "TypeScript",
          "PostgreSQL",
          "MongoDB",
          "Express",
          "Git",
          "Docker",
        ],
        experience: "5+ años de experiencia desarrollando aplicaciones web full stack. Experiencia liderando equipos de desarrollo.",
        education: "Ingeniería en Sistemas - Universidad Nacional",
      },
      {
        talentId: talents[1].id,
        keywords: ["DevOps", "AWS", "Docker", "Kubernetes", "CI/CD"],
        skills: [
          "AWS",
          "Docker",
          "Kubernetes",
          "Terraform",
          "Jenkins",
          "GitLab CI",
          "Linux",
          "Bash",
        ],
        experience: "4 años de experiencia en DevOps, gestionando infraestructura cloud y pipelines de CI/CD.",
        education: "Ingeniería en Informática - Universidad Tecnológica",
      },
      {
        talentId: talents.length > 2 ? talents[2].id : talents[0].id,
        keywords: ["Data Science", "Python", "Machine Learning", "SQL"],
        skills: [
          "Python",
          "R",
          "SQL",
          "Pandas",
          "Scikit-learn",
          "TensorFlow",
          "Jupyter",
          "Tableau",
        ],
        experience: "3 años de experiencia en análisis de datos y machine learning. Proyectos en fintech y e-commerce.",
        education: "Licenciatura en Ciencias de la Computación - Universidad de Buenos Aires",
      },
      {
        talentId: talents.length > 3 ? talents[3].id : talents[0].id,
        keywords: ["Backend", "Java", "Spring Boot", "Microservices", "PostgreSQL"],
        skills: [
          "Java",
          "Spring Boot",
          "Microservices",
          "PostgreSQL",
          "Redis",
          "Kafka",
          "Docker",
          "Kubernetes",
        ],
        experience: "4 años de experiencia desarrollando aplicaciones backend escalables con Java y Spring Boot.",
        education: "Ingeniería de Software - Universidad Tecnológica Nacional",
      },
      {
        talentId: talents.length > 4 ? talents[4].id : talents[1].id,
        keywords: ["Frontend", "React", "TypeScript", "Next.js", "CSS"],
        skills: [
          "React",
          "TypeScript",
          "Next.js",
          "Tailwind CSS",
          "Redux",
          "Jest",
          "GraphQL",
          "Webpack",
        ],
        experience: "3 años de experiencia desarrollando interfaces de usuario modernas y responsivas.",
        education: "Licenciatura en Diseño y Desarrollo Web - Universidad de Palermo",
      },
      {
        talentId: talents.length > 5 ? talents[5].id : talents[2]?.id || talents[0].id,
        keywords: ["UX", "UI", "Design", "Figma", "User Research"],
        skills: [
          "Figma",
          "Sketch",
          "Adobe XD",
          "User Research",
          "Prototyping",
          "Design Systems",
          "Accessibility",
          "Usability Testing",
        ],
        experience: "4 años de experiencia en diseño UX/UI para productos digitales. Portfolio con más de 20 proyectos.",
        education: "Diseño Gráfico - Universidad de Buenos Aires",
      },
      {
        talentId: talents.length > 6 ? talents[6].id : talents[3]?.id || talents[0].id,
        keywords: ["Mobile", "React Native", "iOS", "Android", "Swift"],
        skills: [
          "React Native",
          "Swift",
          "Kotlin",
          "iOS",
          "Android",
          "Firebase",
          "App Store",
          "Play Store",
        ],
        experience: "3 años de experiencia desarrollando aplicaciones móviles nativas y multiplataforma.",
        education: "Ingeniería en Sistemas - Universidad Nacional de Córdoba",
      },
      {
        talentId: talents.length > 7 ? talents[7].id : talents[4]?.id || talents[1].id,
        keywords: ["QA", "Testing", "Automation", "Selenium", "Cypress"],
        skills: [
          "Selenium",
          "Cypress",
          "Jest",
          "Test Automation",
          "API Testing",
          "Performance Testing",
          "CI/CD",
          "Agile",
        ],
        experience: "3 años de experiencia en testing automatizado y aseguramiento de calidad de software.",
        education: "Técnico en Testing de Software - Instituto Tecnológico",
      },
      {
        talentId: talents.length > 8 ? talents[8].id : talents[5]?.id || talents[2]?.id || talents[0].id,
        keywords: ["Security", "Cybersecurity", "Penetration Testing", "OWASP"],
        skills: [
          "Penetration Testing",
          "OWASP",
          "Security Auditing",
          "Network Security",
          "Cryptography",
          "Vulnerability Assessment",
          "SIEM",
          "Compliance",
        ],
        experience: "5 años de experiencia en seguridad informática y protección de sistemas empresariales.",
        education: "Ingeniería en Seguridad Informática - Universidad Tecnológica",
      },
      {
        talentId: talents.length > 9 ? talents[9].id : talents[6]?.id || talents[3]?.id || talents[0].id,
        keywords: ["Product Management", "Agile", "Scrum", "Analytics"],
        skills: [
          "Product Strategy",
          "Agile",
          "Scrum",
          "Analytics",
          "User Stories",
          "Roadmapping",
          "Stakeholder Management",
          "Data Analysis",
        ],
        experience: "4 años de experiencia como Product Manager liderando equipos de desarrollo ágil.",
        education: "MBA - Universidad de San Andrés",
      },
    ];

    for (const profileData of talentProfiles) {
      const existing = await prisma.talentProfile.findUnique({
        where: { talentId: profileData.talentId },
      });

      if (!existing) {
        await prisma.talentProfile.create({
          data: profileData,
        });
        logger.info(`Perfil creado para talento ID: ${profileData.talentId}`);
      }
    }

    logger.info("Creando CVs para talentos...");
    const cvData = [
      {
        talentId: talents[0].id,
        fileUrl: "https://example.com/cvs/talent1_cv_v1.pdf",
        fileName: "CV_Desarrollador_FullStack.pdf",
        version: 1,
      },
      {
        talentId: talents[0].id,
        fileUrl: "https://example.com/cvs/talent1_cv_v2.pdf",
        fileName: "CV_Desarrollador_FullStack_v2.pdf",
        version: 2,
      },
      {
        talentId: talents[1].id,
        fileUrl: "https://example.com/cvs/talent2_cv_v1.pdf",
        fileName: "CV_DevOps_Engineer.pdf",
        version: 1,
      },
      {
        talentId: talents.length > 2 ? talents[2].id : talents[0].id,
        fileUrl: "https://example.com/cvs/talent3_cv_v1.pdf",
        fileName: "CV_Data_Scientist.pdf",
        version: 1,
      },
      {
        talentId: talents.length > 3 ? talents[3].id : talents[0].id,
        fileUrl: "https://example.com/cvs/talent4_cv_v1.pdf",
        fileName: "CV_Backend_Developer.pdf",
        version: 1,
      },
      {
        talentId: talents.length > 4 ? talents[4].id : talents[1].id,
        fileUrl: "https://example.com/cvs/talent5_cv_v1.pdf",
        fileName: "CV_Frontend_Developer.pdf",
        version: 1,
      },
      {
        talentId: talents.length > 5 ? talents[5].id : talents[2]?.id || talents[0].id,
        fileUrl: "https://example.com/cvs/talent6_cv_v1.pdf",
        fileName: "CV_UX_UI_Designer.pdf",
        version: 1,
      },
      {
        talentId: talents.length > 6 ? talents[6].id : talents[3]?.id || talents[0].id,
        fileUrl: "https://example.com/cvs/talent7_cv_v1.pdf",
        fileName: "CV_Mobile_Developer.pdf",
        version: 1,
      },
      {
        talentId: talents.length > 7 ? talents[7].id : talents[4]?.id || talents[1].id,
        fileUrl: "https://example.com/cvs/talent8_cv_v1.pdf",
        fileName: "CV_QA_Engineer.pdf",
        version: 1,
      },
      {
        talentId: talents.length > 8 ? talents[8].id : talents[5]?.id || talents[2]?.id || talents[0].id,
        fileUrl: "https://example.com/cvs/talent9_cv_v1.pdf",
        fileName: "CV_Security_Engineer.pdf",
        version: 1,
      },
      {
        talentId: talents.length > 9 ? talents[9].id : talents[6]?.id || talents[3]?.id || talents[0].id,
        fileUrl: "https://example.com/cvs/talent10_cv_v1.pdf",
        fileName: "CV_Product_Manager.pdf",
        version: 1,
      },
    ];

    for (const cv of cvData) {
      const existing = await prisma.talentCV.findFirst({
        where: {
          talentId: cv.talentId,
          version: cv.version,
        },
      });

      if (!existing) {
        await prisma.talentCV.create({
          data: cv,
        });
        logger.info(`CV creado para talento ID: ${cv.talentId}, versión: ${cv.version}`);
      }
    }

    logger.info("Creando metas mensuales...");
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const monthlyGoals = [
      {
        month: currentMonth,
        year: currentYear,
        targetProcesses: 10,
        targetHires: 5,
        actualProcesses: processes.length,
        actualHires: 1,
      },
      {
        month: currentMonth === 1 ? 12 : currentMonth - 1,
        year: currentMonth === 1 ? currentYear - 1 : currentYear,
        targetProcesses: 8,
        targetHires: 4,
        actualProcesses: 6,
        actualHires: 3,
      },
    ];

    for (const goal of monthlyGoals) {
      const existing = await prisma.monthlyGoal.findFirst({
        where: {
          month: goal.month,
          year: goal.year,
        },
      });

      if (!existing) {
        await prisma.monthlyGoal.create({
          data: goal,
        });
        logger.info(`Meta mensual creada: ${goal.month}/${goal.year}`);
      }
    }

    logger.info("Creando metas anuales...");
    const annualGoals = [
      {
        year: currentYear,
        targetProcesses: 100,
        targetHires: 50,
        actualProcesses: processes.length,
        actualHires: 1,
      },
      {
        year: currentYear - 1,
        targetProcesses: 80,
        targetHires: 40,
        actualProcesses: 65,
        actualHires: 35,
      },
    ];

    for (const goal of annualGoals) {
      const existing = await prisma.annualGoal.findUnique({
        where: { year: goal.year },
      });

      if (!existing) {
        await prisma.annualGoal.create({
          data: goal,
        });
        logger.info(`Meta anual creada: ${goal.year}`);
      }
    }

    logger.info("✅ Datos de prueba insertados correctamente");
    logger.info(`- ${positions.length} posiciones creadas`);
    logger.info(`- ${processes.length} procesos creados`);
    logger.info(`- ${talentProfiles.length} perfiles de talentos creados`);
    logger.info(`- ${cvData.length} CVs creados`);
    logger.info(`- ${monthlyGoals.length} metas mensuales creadas`);
    logger.info(`- ${annualGoals.length} metas anuales creadas`);

  } catch (error) {
    logger.error("Error al insertar datos de prueba", { error });
    throw error;
  }
};

