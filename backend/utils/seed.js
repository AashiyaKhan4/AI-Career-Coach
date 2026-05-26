require("dotenv").config();
const mongoose = require("mongoose");
const { Skill, Career } = require("../models");

const skills = [
  // Programming languages
  { name: "JavaScript",   category: "Programming",      type: "technical", demandLevel: "high",   description: "Dynamic programming language for web development." },
  { name: "Python",       category: "Programming",      type: "technical", demandLevel: "high",   description: "Versatile language popular in AI/ML and web." },
  { name: "Java",         category: "Programming",      type: "technical", demandLevel: "high",   description: "Object-oriented language for enterprise apps." },
  { name: "TypeScript",   category: "Programming",      type: "technical", demandLevel: "high",   description: "Typed superset of JavaScript." },
  { name: "C++",          category: "Programming",      type: "technical", demandLevel: "medium", description: "Systems programming language." },
  { name: "Go",           category: "Programming",      type: "technical", demandLevel: "medium", description: "Efficient systems/backend language by Google." },
  { name: "Rust",         category: "Programming",      type: "technical", demandLevel: "medium", description: "Memory-safe systems language." },
  { name: "PHP",          category: "Programming",      type: "technical", demandLevel: "medium", description: "Server-side scripting language." },
  { name: "Swift",        category: "Programming",      type: "technical", demandLevel: "medium", description: "iOS/macOS development language." },
  { name: "Kotlin",       category: "Programming",      type: "technical", demandLevel: "medium", description: "Modern Android development language." },
  // Web / Frontend
  { name: "React",        category: "Frontend",         type: "technical", demandLevel: "high",   description: "Popular UI library by Facebook." },
  { name: "Vue.js",       category: "Frontend",         type: "technical", demandLevel: "medium", description: "Progressive JavaScript framework." },
  { name: "Angular",      category: "Frontend",         type: "technical", demandLevel: "medium", description: "Full-featured frontend framework by Google." },
  { name: "HTML/CSS",     category: "Frontend",         type: "technical", demandLevel: "high",   description: "Core web markup and styling." },
  { name: "Tailwind CSS", category: "Frontend",         type: "technical", demandLevel: "high",   description: "Utility-first CSS framework." },
  { name: "Next.js",      category: "Frontend",         type: "technical", demandLevel: "high",   description: "React framework for production." },
  // Backend
  { name: "Node.js",      category: "Backend",          type: "technical", demandLevel: "high",   description: "JavaScript runtime for server-side code." },
  { name: "Express.js",   category: "Backend",          type: "technical", demandLevel: "high",   description: "Minimal Node.js web framework." },
  { name: "Django",       category: "Backend",          type: "technical", demandLevel: "medium", description: "Python web framework." },
  { name: "FastAPI",      category: "Backend",          type: "technical", demandLevel: "high",   description: "Modern Python API framework." },
  { name: "Spring Boot",  category: "Backend",          type: "technical", demandLevel: "medium", description: "Java framework for production apps." },
  { name: "GraphQL",      category: "Backend",          type: "technical", demandLevel: "medium", description: "Query language for APIs." },
  { name: "REST APIs",    category: "Backend",          type: "technical", demandLevel: "high",   description: "RESTful API design and development." },
  // Databases
  { name: "MongoDB",      category: "Database",         type: "technical", demandLevel: "high",   description: "NoSQL document database." },
  { name: "PostgreSQL",   category: "Database",         type: "technical", demandLevel: "high",   description: "Advanced open-source relational database." },
  { name: "MySQL",        category: "Database",         type: "technical", demandLevel: "high",   description: "Popular relational database." },
  { name: "Redis",        category: "Database",         type: "technical", demandLevel: "medium", description: "In-memory key-value store." },
  { name: "Elasticsearch",category: "Database",         type: "technical", demandLevel: "medium", description: "Distributed search and analytics engine." },
  // Cloud / DevOps
  { name: "AWS",          category: "Cloud",            type: "technical", demandLevel: "high",   description: "Amazon Web Services cloud platform." },
  { name: "Docker",       category: "DevOps",           type: "technical", demandLevel: "high",   description: "Containerisation platform." },
  { name: "Kubernetes",   category: "DevOps",           type: "technical", demandLevel: "high",   description: "Container orchestration system." },
  { name: "CI/CD",        category: "DevOps",           type: "technical", demandLevel: "high",   description: "Continuous integration and deployment." },
  { name: "Linux",        category: "DevOps",           type: "technical", demandLevel: "high",   description: "Linux OS administration." },
  { name: "Git",          category: "DevOps",           type: "technical", demandLevel: "high",   description: "Version control system." },
  // AI/ML
  { name: "Machine Learning", category: "AI/ML",        type: "technical", demandLevel: "high",   description: "Building predictive models." },
  { name: "Deep Learning",    category: "AI/ML",        type: "technical", demandLevel: "high",   description: "Neural networks and AI." },
  { name: "TensorFlow",       category: "AI/ML",        type: "technical", demandLevel: "high",   description: "Open-source ML framework." },
  { name: "PyTorch",          category: "AI/ML",        type: "technical", demandLevel: "high",   description: "ML framework for research." },
  { name: "NLP",              category: "AI/ML",        type: "technical", demandLevel: "high",   description: "Natural Language Processing." },
  { name: "Data Analysis",    category: "Data",         type: "technical", demandLevel: "high",   description: "Analysing datasets for insights." },
  { name: "SQL",              category: "Data",         type: "technical", demandLevel: "high",   description: "Structured Query Language." },
  { name: "Power BI",         category: "Data",         type: "technical", demandLevel: "medium", description: "Business intelligence tool by Microsoft." },
  { name: "Tableau",          category: "Data",         type: "technical", demandLevel: "medium", description: "Data visualisation software." },
  // Soft skills
  { name: "Communication",      category: "Soft Skills", type: "soft", demandLevel: "high",   description: "Clear verbal and written communication." },
  { name: "Problem Solving",    category: "Soft Skills", type: "soft", demandLevel: "high",   description: "Analytical thinking and solutions." },
  { name: "Teamwork",           category: "Soft Skills", type: "soft", demandLevel: "high",   description: "Collaborating effectively in teams." },
  { name: "Leadership",         category: "Soft Skills", type: "soft", demandLevel: "high",   description: "Guiding and motivating teams." },
  { name: "Project Management", category: "Soft Skills", type: "soft", demandLevel: "high",   description: "Planning and executing projects." },
  { name: "Agile/Scrum",        category: "Methodology", type: "soft", demandLevel: "high",   description: "Agile development methodology." },
  { name: "System Design",      category: "Architecture",type: "technical", demandLevel: "high",   description: "Designing scalable systems." },
  { name: "Cybersecurity",      category: "Security",    type: "technical", demandLevel: "high",   description: "Information and system security." },
  { name: "UI/UX Design",       category: "Design",      type: "technical", demandLevel: "medium", description: "User interface and experience design." },
];

async function seedDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅  Connected to MongoDB");

  // Seed Skills
  await Skill.deleteMany({});
  const insertedSkills = await Skill.insertMany(skills);
  console.log(`✅  Seeded ${insertedSkills.length} skills`);

  // Build skill lookup map
  const skillMap = {};
  insertedSkills.forEach(s => { skillMap[s.name] = s._id; });

  const careers = [
    {
      title: "Full Stack Developer",
      industry: "Technology",
      description: "Design and build complete web applications — both client-side and server-side. Work with modern frameworks, databases, APIs, and cloud infrastructure.",
      avgSalaryUsd: 95000,
      growthRate: "High (25% YoY)",
      educationRequired: "Bachelor's in CS or equivalent",
      experienceLevel: "mid",
      keywords: ["web", "fullstack", "javascript", "react", "node"],
      requiredSkills: [
        { skill: skillMap["JavaScript"], importanceLevel: "high", isMandatory: true },
        { skill: skillMap["React"],      importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Node.js"],    importanceLevel: "high", isMandatory: true },
        { skill: skillMap["MongoDB"],    importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["REST APIs"],  importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Git"],        importanceLevel: "high", isMandatory: true },
        { skill: skillMap["HTML/CSS"],   importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["TypeScript"], importanceLevel: "medium", isMandatory: false },
      ],
    },
    {
      title: "Data Scientist",
      industry: "Data & Analytics",
      description: "Analyse large datasets, build predictive models, and derive actionable insights. Work with ML algorithms, statistical analysis, and data visualisation.",
      avgSalaryUsd: 105000,
      growthRate: "Very High (35% YoY)",
      educationRequired: "Master's preferred",
      experienceLevel: "mid",
      keywords: ["data", "machine learning", "python", "statistics", "ai"],
      requiredSkills: [
        { skill: skillMap["Python"],          importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Machine Learning"],importanceLevel: "high", isMandatory: true },
        { skill: skillMap["SQL"],             importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Data Analysis"],   importanceLevel: "high", isMandatory: true },
        { skill: skillMap["TensorFlow"],      importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["NLP"],             importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["Tableau"],         importanceLevel: "low",  isMandatory: false },
      ],
    },
    {
      title: "DevOps Engineer",
      industry: "Technology",
      description: "Bridge development and operations. Automate deployment pipelines, manage cloud infrastructure, and ensure system reliability and scalability.",
      avgSalaryUsd: 100000,
      growthRate: "High (22% YoY)",
      educationRequired: "Bachelor's in CS or equivalent",
      experienceLevel: "mid",
      keywords: ["devops", "cloud", "docker", "kubernetes", "ci/cd"],
      requiredSkills: [
        { skill: skillMap["Docker"],     importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Kubernetes"], importanceLevel: "high", isMandatory: true },
        { skill: skillMap["AWS"],        importanceLevel: "high", isMandatory: true },
        { skill: skillMap["CI/CD"],      importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Linux"],      importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Python"],     importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["Git"],        importanceLevel: "high", isMandatory: true },
      ],
    },
    {
      title: "Machine Learning Engineer",
      industry: "Artificial Intelligence",
      description: "Build and deploy machine learning models at scale. Work on model training, optimisation, serving infrastructure, and MLOps pipelines.",
      avgSalaryUsd: 125000,
      growthRate: "Very High (40% YoY)",
      educationRequired: "Master's or PhD preferred",
      experienceLevel: "senior",
      keywords: ["ml", "ai", "deep learning", "python", "tensorflow"],
      requiredSkills: [
        { skill: skillMap["Python"],          importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Machine Learning"],importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Deep Learning"],   importanceLevel: "high", isMandatory: true },
        { skill: skillMap["TensorFlow"],      importanceLevel: "high", isMandatory: true },
        { skill: skillMap["PyTorch"],         importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["Docker"],          importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["SQL"],             importanceLevel: "medium", isMandatory: false },
      ],
    },
    {
      title: "Frontend Developer",
      industry: "Technology",
      description: "Create responsive, accessible, and performant user interfaces using modern JavaScript frameworks and CSS technologies.",
      avgSalaryUsd: 85000,
      growthRate: "High (20% YoY)",
      educationRequired: "Bachelor's in CS or equivalent",
      experienceLevel: "mid",
      keywords: ["frontend", "react", "javascript", "ui", "css"],
      requiredSkills: [
        { skill: skillMap["React"],        importanceLevel: "high", isMandatory: true },
        { skill: skillMap["JavaScript"],   importanceLevel: "high", isMandatory: true },
        { skill: skillMap["HTML/CSS"],     importanceLevel: "high", isMandatory: true },
        { skill: skillMap["TypeScript"],   importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["Next.js"],      importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["Tailwind CSS"], importanceLevel: "low",  isMandatory: false },
        { skill: skillMap["Git"],          importanceLevel: "high", isMandatory: true },
      ],
    },
    {
      title: "Backend Developer",
      industry: "Technology",
      description: "Design and build server-side applications, APIs, and microservices. Focus on performance, security, and database architecture.",
      avgSalaryUsd: 90000,
      growthRate: "High (22% YoY)",
      educationRequired: "Bachelor's in CS or equivalent",
      experienceLevel: "mid",
      keywords: ["backend", "api", "node", "python", "database"],
      requiredSkills: [
        { skill: skillMap["Node.js"],   importanceLevel: "high", isMandatory: true },
        { skill: skillMap["REST APIs"], importanceLevel: "high", isMandatory: true },
        { skill: skillMap["MongoDB"],   importanceLevel: "high", isMandatory: true },
        { skill: skillMap["PostgreSQL"],importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["Redis"],     importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["Docker"],    importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["Git"],       importanceLevel: "high", isMandatory: true },
      ],
    },
    {
      title: "Cybersecurity Analyst",
      industry: "Security",
      description: "Protect systems and networks from cyber threats. Conduct security audits, analyse vulnerabilities, and implement protective measures.",
      avgSalaryUsd: 95000,
      growthRate: "Very High (33% YoY)",
      educationRequired: "Bachelor's in CS or Security",
      experienceLevel: "mid",
      keywords: ["security", "cybersecurity", "network", "ethical hacking"],
      requiredSkills: [
        { skill: skillMap["Cybersecurity"], importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Linux"],         importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Python"],        importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["Networking"],    importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Problem Solving"],importanceLevel: "high", isMandatory: true },
      ].filter(s => s.skill),
    },
    {
      title: "UI/UX Designer",
      industry: "Design",
      description: "Design intuitive, engaging user experiences and interfaces. Conduct user research, create wireframes, prototypes, and collaborate with development teams.",
      avgSalaryUsd: 80000,
      growthRate: "Moderate (15% YoY)",
      educationRequired: "Bachelor's in Design or equivalent",
      experienceLevel: "mid",
      keywords: ["design", "ui", "ux", "figma", "user research"],
      requiredSkills: [
        { skill: skillMap["UI/UX Design"],  importanceLevel: "high", isMandatory: true },
        { skill: skillMap["HTML/CSS"],      importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["Communication"], importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Problem Solving"],importanceLevel: "high", isMandatory: true },
      ].filter(s => s.skill),
    },
    {
      title: "Cloud Solutions Architect",
      industry: "Cloud Computing",
      description: "Design and oversee cloud infrastructure solutions. Define architecture strategies, lead cloud migrations, and ensure scalability, security, and cost optimisation.",
      avgSalaryUsd: 135000,
      growthRate: "Very High (30% YoY)",
      educationRequired: "Bachelor's in CS or equivalent",
      experienceLevel: "senior",
      keywords: ["cloud", "aws", "architecture", "infrastructure"],
      requiredSkills: [
        { skill: skillMap["AWS"],          importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Docker"],       importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Kubernetes"],   importanceLevel: "high", isMandatory: true },
        { skill: skillMap["System Design"],importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Linux"],        importanceLevel: "medium", isMandatory: false },
        { skill: skillMap["CI/CD"],        importanceLevel: "medium", isMandatory: false },
      ].filter(s => s.skill),
    },
    {
      title: "Product Manager",
      industry: "Product",
      description: "Define product vision, strategy, and roadmap. Work closely with engineering, design, and business teams to ship products that solve user problems.",
      avgSalaryUsd: 110000,
      growthRate: "High (18% YoY)",
      educationRequired: "Bachelor's (any field)",
      experienceLevel: "mid",
      keywords: ["product", "agile", "roadmap", "strategy", "leadership"],
      requiredSkills: [
        { skill: skillMap["Agile/Scrum"],      importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Leadership"],       importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Communication"],    importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Project Management"],importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Problem Solving"],  importanceLevel: "high", isMandatory: true },
        { skill: skillMap["Data Analysis"],    importanceLevel: "medium", isMandatory: false },
      ].filter(s => s.skill),
    },
  ];

  await Career.deleteMany({});
  const insertedCareers = await Career.insertMany(careers.map(c => ({
    ...c,
    requiredSkills: c.requiredSkills.filter(rs => rs.skill),
  })));
  console.log(`✅  Seeded ${insertedCareers.length} careers`);
  console.log("\n🎉  Database seeded successfully! Run: npm run dev");
  process.exit(0);
}

seedDB().catch(err => { console.error("❌  Seed failed:", err); process.exit(1); });
