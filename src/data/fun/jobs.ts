// Condensed from public job postings, retrieved September 2026.
// Only requirements and responsibilities are kept. Postings change, so each one links its source.
export interface SampleJob {
  id: string;
  company: string;
  role: string;
  track: "Software" | "AI / ML" | "Data" | "Product";
  source: string;
  text: string;
}

export const SAMPLE_JOBS: SampleJob[] = [
  {
    id: "google-swe",
    company: "Google",
    role: "Software Engineer, Early Career",
    track: "Software",
    source: "https://www.google.com/about/careers/applications/jobs/results/78703249065943750-software-engineer-early-career-campus",
    text: `Software Engineer, Early Career. Google.
Minimum qualifications: Bachelor's degree or equivalent practical experience. Experience coding in one or more general-purpose programming languages. Experience with data structures and algorithms.
Preferred qualifications: Experience in software development in areas such as large-scale distributed systems, AI/ML, networking, data storage or security. Exceptional engineering capabilities.
Responsibilities: Engineers are expected to be versatile, display leadership qualities and be enthusiastic to take on new problems across the full stack.`,
  },
  {
    id: "stripe-swe",
    company: "Stripe",
    role: "Software Engineer, New Grad",
    track: "Software",
    source: "https://stripe.com/careers/listing/software-engineer-new-grad/8130930",
    text: `Software Engineer, New Grad. Stripe.
Minimum requirements: Bachelor's or Master's degree in computer science or a related field, or equivalent experience, with no more than 18 months of professional experience excluding internships. Programming experience through projects or coursework, for example Java, Ruby, JavaScript, Scala or Go. A previous internship or collaborative multi-person coding projects. Ability to learn unfamiliar systems and form an understanding independently. Strong written communication. Ability to use AI tools while thinking critically about their output.
Preferred: Specialised knowledge in frontend, backend or infrastructure. Code review experience and knowledge of updating production systems. Navigating large codebases. Leading projects independently. High agency with good judgement about when to ask for help.`,
  },
  {
    id: "openai-re",
    company: "OpenAI",
    role: "Research Engineer, Applied AI",
    track: "AI / ML",
    source: "https://builtin.com/job/research-engineer-applied-ai-engineering/4457431",
    text: `Research Engineer, Applied AI Engineering. OpenAI.
Responsibilities: Design and deploy advanced machine learning models for real-world problems. Work with researchers, software engineers and product managers to deliver AI solutions. Build scalable data pipelines, optimise models for performance and accuracy, and make them production-ready. Monitor and maintain deployed models.
You might thrive if you have: A Master's or PhD in Computer Science, Machine Learning, Data Science or a related field. Demonstrated experience with deep learning and transformer models. Proficiency in PyTorch or TensorFlow. A strong foundation in data structures, algorithms and software engineering. Experience with search relevance, ads ranking or LLMs is preferred. Familiarity with LLM training methods such as distillation, supervised fine-tuning and policy optimisation. Ability to move fast when things are loosely defined, and to own problems end to end.`,
  },
  {
    id: "anthropic-aai",
    company: "Anthropic",
    role: "Applied AI Engineer",
    track: "AI / ML",
    source: "https://job-boards.greenhouse.io/anthropic/jobs/5116274008",
    text: `Applied AI Engineer. Anthropic.
Responsibilities: Act as a trusted technical advisor to customers building on the Claude Developer Platform, from discovery through deployment. Partner with account executives to architect technical solutions. Guide architecture decisions, agent design and implementation patterns for LLMs. Build customised pilots and evaluation suites. Lead hands-on technical workshops and code reviews with customer engineering teams. Identify common design patterns and feed insights back to Product and Engineering.
The role combines hands-on technical depth with LLM applications and strong customer-facing communication.`,
  },
  {
    id: "apple-mle",
    company: "Apple",
    role: "Machine Learning Engineer",
    track: "AI / ML",
    source: "https://jobs.apple.com/en-us/search?team=machine-learning-and-ai-SFTWR-MCHLN",
    text: `Machine Learning Engineer. Apple.
Minimum qualifications: A Master's degree in machine learning, AI or a related field with 2 years of relevant experience, or a PhD, or a BS/MS with 3 to 5 years of ML engineering experience. Software development, machine learning, deep learning and NLP. Proficiency in Python, Java, Objective-C or C++.
Preferred qualifications: Strong Python and one deep learning toolkit such as JAX, PyTorch or TensorFlow. On-device ML deployment and optimisation. Experience handling multimodal data including text, images, audio and other sensors. Strong communication and presentation skills.`,
  },
  {
    id: "meta-ds",
    company: "Meta",
    role: "Data Scientist, Product Analytics",
    track: "Data",
    source: "https://www.linkedin.com/jobs/view/data-scientist-product-analytics-at-meta-3811304741",
    text: `Data Scientist, Product Analytics. Meta.
Minimum qualifications: Bachelor's degree in Mathematics, Statistics, a relevant technical field, or equivalent practical experience. At least 4 years of work experience in analytics (2 years with a PhD). Experience with data querying languages such as SQL, scripting languages such as Python, and statistical software such as R.
Preferred qualifications: A Master's or PhD in a quantitative field.
The role shapes product decisions through analysis, metrics and experimentation.`,
  },
  {
    id: "grab-ds",
    company: "Grab",
    role: "Data Scientist (Analytics)",
    track: "Data",
    source: "https://www.grab.careers/en/jobs/744000112878250/data-scientist-analytics-mobility/",
    text: `Data Scientist (Analytics), Mobility. Grab, Singapore.
The job: Work with Product, Business, Engineering, Design and Data Science to understand data requirements, identify and track key metrics, and provide data-driven insights. Run in-depth analyses and build reports, toolkits, dashboards, models and analytical frameworks that support decisions. Process large datasets for model development, build scalable machine learning models, deploy models to production with a focus on robustness, and run A/B tests to assess model performance.
Onsite at Grab One North, Singapore.`,
  },
  {
    id: "dbs-de",
    company: "DBS",
    role: "Data Engineer",
    track: "Data",
    source: "https://www.dbs.com/hack2hire/sg/data-engineer.html",
    text: `Data Engineer. DBS Bank, Singapore.
Responsibilities: Develop data warehouse and feature mart models. Build data processing pipelines that ingest raw data and transform it into datasets for analytics and machine learning.
Requirements: Proficiency in at least one programming language such as Java, Scala or Python. Hiring across all seniority levels.`,
  },
  {
    id: "google-apm",
    company: "Google",
    role: "Associate Product Manager",
    track: "Product",
    source: "https://www.airtribe.live/jobs/product-manager/associate-product-manager-university-graduate-2026-start-at-google-CWZGUDFDENOI",
    text: `Associate Product Manager, University Graduate. Google.
Minimum qualifications: Enrolled in or graduated from a degree in Product Management, Computer Science, Engineering, Data Science, Mathematics, Statistics or a related technical field. Internship or teaching assistant experience in product management, software development or a similar technical field. Experience leading entrepreneurial efforts or outreach while building cross-functional relationships. Experience preparing and delivering technical presentations.
Preferred qualifications: Experience with product development methodologies. Applying AI/ML concepts to build products or features. Technical experience with programming, data analysis, business modelling, pricing or design. Excellent problem-solving and critical thinking.
Responsibilities: Understand markets and user requirements in depth. Launch products and features, test their performance and iterate quickly. Work with Engineering, Marketing, Legal and UX.`,
  },
  {
    id: "shopee-pm",
    company: "Shopee",
    role: "Product Manager",
    track: "Product",
    source: "https://careers.shopee.sg/job-detail/122010",
    text: `Product Manager, Marketplace. Shopee, Singapore.
Responsibilities: Act as the focal point between business, engineering and design. Drive and own strategic initiatives while staying hands-on. Analyse and evaluate business requirements, feasibility and the value of feature requests with business and regional product teams, and deliver business requirement documents.
Requirements: Prior experience in product management, business analysis, strategy or consulting. Bachelor's degree in information systems, computer science, technology or equivalent experience. E-commerce product domain knowledge. Excellent communication, clear logical thinking, and strong time and task management.`,
  },
];
