export interface JobTemplate {
  title: string;
  category: string;
  description: string;
}

export const JOB_TEMPLATES: JobTemplate[] = [
  {
    title: "Full Stack React & Node.js Developer",
    category: "Web Engineering",
    description: `Position: Senior Full Stack Developer (React & Node.js)
Location: Remote / Hybrid
Experience Required: 3-5 Years

Key Technical Requirements:
- Robust experience with modern React 18+ (hooks, context, state management).
- Proficient in TypeScript and ES6+ JavaScript.
- Strong backend skills with Node.js and Express.js, designing RESTful APIs.
- Experience with styling frameworks like Tailwind CSS or styled-components.
- Familiarity with SQL databases (PostgreSQL/MySQL) or NoSQL databases (MongoDB).
- Experience with Git, CI/CD pipelines, and cloud platforms like AWS, Heroku, or Google Cloud.
- Excellent problem-solving, clean code practices, and unit testing experience (Jest/React Testing Library).

Nice to Have:
- Experience with Docker containerization.
- Knowledge of GraphQL or Next.js.`
  },
  {
    title: "Java Spring Boot Backend Engineer",
    category: "Backend Development",
    description: `Position: Backend Engineer (Java / Spring Boot)
Location: Hybrid
Experience Required: 2-4 Years

Key Technical Requirements:
- Strong core Java programming skills (Java 11 or higher).
- Extensive experience building enterprise-grade REST APIs with Spring Boot, Spring MVC, and Spring Security.
- Hands-on experience with database technologies (Postgres, Oracle, Hibernate ORM, Spring Data JPA).
- Good understanding of Microservices architecture, RESTful web services, and caching mechanisms (Redis).
- Proficient with Maven or Gradle build systems, and Git version control.
- Experience writing JUnit tests and integration tests for web APIs.

Nice to Have:
- Experience with cloud systems (AWS, GCP, or Azure).
- Knowledge of message brokers like RabbitMQ or Kafka.
- Basic understanding of Kubernetes or Docker.`
  },
  {
    title: "Technical Product Manager",
    category: "Product Management",
    description: `Position: Technical Product Manager
Location: San Francisco, CA / Remote
Experience Required: 4+ Years

Core Requirements:
- Strong product management background, successfully shipping technical products from concept to launch.
- Solid technical understanding of web APIs, system architecture, database design, and cloud workflows.
- Excellent communication skills to bridge engineering and business domains.
- Experience driving agile methodologies, maintaining backlogs, and writing detailed PRDs (Product Requirement Documents).
- Analytical mindset with proficiency in SQL, analytics tools (Mixpanel, Google Analytics), and A/B testing.

Nice to Have:
- Prior engineering experience as a full stack or backend developer.
- MBA or Technical Degree in Computer Science or related field.`
  }
];
