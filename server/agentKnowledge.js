// Local AI agent knowledge base and question system
// Each agent has domain-specific questions and response patterns

export const agentKnowledge = {
  "1": {
    // CodeReviewer Pro
    name: "CodeReviewer Pro",
    questions: [
      "What programming language is your code in?",
      "What type of code are you reviewing (backend API, frontend component, data processing)?",
      "Are there any specific concerns (performance, security, maintainability)?"
    ],
    responseTemplates: {
      "backend": {
        "security": "For backend security reviews, consider: input validation, SQL injection prevention, authentication/authorization checks, and secure credential handling. What framework are you using?",
        "performance": "Backend performance often depends on: database query optimization, caching strategies, and API response times. Can you share the bottleneck area?",
        "maintainability": "Code maintainability in backend focuses on: clear error handling, consistent naming, modular functions, and proper logging. Are you using any design patterns?"
      },
      "frontend": {
        "security": "Frontend security includes: XSS prevention, CSRF tokens, secure API calls, and dependency management. What frontend framework?",
        "performance": "Frontend optimization: component memoization, lazy loading, bundle size, and render optimization. Using React, Vue, or Angular?",
        "maintainability": "Clean frontend code: component composition, state management clarity, and reusable utilities. What's your tech stack?"
      },
      "default": "Code review should focus on: readability, error handling, testing coverage, and adherence to style guides. Which language?"
    }
  },
  "2": {
    // SEO Strategist
    name: "SEO Strategist",
    questions: [
      "What type of content are you optimizing (blog post, product page, landing page)?",
      "What's your target audience/keyword?",
      "Are you more concerned with on-page or technical SEO?"
    ],
    responseTemplates: {
      "blog": {
        "keyword": "For blog SEO: use keyword naturally in title, first 100 words, and H2 headers. Include meta description (150-160 chars), internal links, and aim for 1000+ words. What's your keyword?",
        "default": "Blog SEO tips: optimize title tag, add schema markup, improve readability with short paragraphs, and ensure mobile-friendliness. Target audience?"
      },
      "product": {
        "keyword": "Product page SEO: optimize title with product name + target keyword, write unique description, include high-quality images with alt text. What product?",
        "default": "For e-commerce: focus on product feeds, unique descriptions per variant, customer reviews for CTR, and fast load times. What platform?"
      },
      "default": "Core SEO: optimize title (50-60 chars), meta description, H1 with keyword, internal links, and site speed. What content type?"
    }
  },
  "3": {
    // Data Analyst
    name: "Data Analyst",
    questions: [
      "What type of data are you analyzing (sales, user behavior, financial)?",
      "What's your desired output (trend analysis, prediction, segmentation)?",
      "Do you have the data in a specific format (CSV, SQL, JSON)?"
    ],
    responseTemplates: {
      "sales": {
        "trend": "For sales trends: analyze month-over-month growth, segment by product/region, identify seasonal patterns, and forecast with moving averages. Data format?",
        "default": "Sales analysis: revenue per product, customer acquisition cost, lifetime value, and churn rate. What metrics matter most?"
      },
      "behavior": {
        "trend": "User behavior: track session duration, bounce rates, feature adoption, and user journey funnels. What events?",
        "default": "Behavioral data: analyze user segments, engagement scores, retention cohorts, and conversion rates. Analytics tool?"
      },
      "default": "Start with data cleaning, check for outliers, then descriptive stats, correlations, and visualization. Data size?"
    }
  },
  "4": {
    // UX Copywriter
    name: "UX Copywriter",
    questions: [
      "What UI element are you writing for (button, tooltip, error message, empty state)?",
      "Who's your target user (beginner, expert, mixed)?",
      "What's the primary action or goal?"
    ],
    responseTemplates: {
      "button": {
        "action": "Action buttons: use strong verbs (Save, Delete, Submit). Keep under 3 words. Example: 'Delete Account' not 'Click to Remove Your Profile'. What action?",
        "default": "Button copy: action-focused, specific, brief. Avoid generic 'OK' or 'Cancel'. What does the button do?"
      },
      "error": {
        "user": "Error messages for all users: be specific (not 'Error'), explain what happened, suggest fix. Example: 'Email already registered. Try login or reset password.' What error?"
      },
      "empty": {
        "default": "Empty state copy: explain why it's empty, suggest next step, use friendly tone. 'No tasks yet! Create one to get started.' What feature?"
      },
      "default": "UX copy is: specific, concise, action-oriented, and user-friendly. Avoid jargon. What element?"
    }
  },
  "5": {
    // DevOps Assistant
    name: "DevOps Assistant",
    questions: [
      "What environment are you deploying to (AWS, GCP, Docker, Kubernetes)?",
      "What's your pain point (CI/CD setup, scaling, monitoring)?",
      "What tech stack (Node, Python, Go)?"
    ],
    responseTemplates: {
      "docker": {
        "cicd": "Docker + CI/CD: containerize app, push to registry (DockerHub/ECR), auto-deploy on git push. Use GitHub Actions or GitLab CI. What platform?",
        "default": "Docker: write Dockerfile with multi-stage builds, .dockerignore for efficiency, test locally before pushing. Node or Python?"
      },
      "kubernetes": {
        "scaling": "K8s scaling: set resource requests/limits, use HPA (Horizontal Pod Autoscaler), monitor metrics. What app type?",
        "default": "Kubernetes: deploy with manifests (.yaml), services for networking, persistent volumes for data. Minikube or cloud?"
      },
      "default": "DevOps: automate builds, test, deploy; monitor logs; backup data; plan disaster recovery. What's failing?"
    }
  },
  "6": {
    // Legal Advisor
    name: "Legal Advisor",
    questions: [
      "What type of document (contract, ToS, privacy policy)?",
      "What jurisdiction (US, EU/GDPR, other)?",
      "What's the main concern (liability, compliance, rights)?"
    ],
    responseTemplates: {
      "privacy": {
        "gdpr": "GDPR compliance: obtain explicit consent, include data retention policy, add opt-out rights, implement data processing agreements. More details?",
        "default": "Privacy policy: disclose data collection methods, third-party sharing, retention period, user rights. Jurisdiction?"
      },
      "terms": {
        "liability": "Terms of Service: limit liability, define user responsibilities, set usage restrictions, include dispute resolution. SaaS or e-commerce?",
        "default": "ToS should cover: intellectual property, acceptable use, termination, governing law. What service?"
      },
      "default": "Legal note: Always consult a real lawyer. I can outline best practices only. Document type?"
    }
  }
};

export function getAgentResponse(agentId, userMessage, conversationContext) {
  const agent = agentKnowledge[agentId];
  if (!agent) return "Agent not found.";

  // Count questions asked (simple strategy: if < 2 exchanges, ask clarifying questions)
  const messageCount = conversationContext.length || 0;

  if (messageCount === 1) {
    // First user message: ask a clarifying question
    const question = agent.questions[Math.floor(Math.random() * agent.questions.length)];
    return `${question} This helps me give you targeted advice as the ${agent.name}.`;
  }

  if (messageCount === 3) {
    // After first clarification: ask second question
    const remainingQuestions = agent.questions.filter(
      q => !conversationContext.some(m => m.parts?.[0]?.text?.includes(q))
    );
    if (remainingQuestions.length > 0) {
      const question = remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
      return `${question} Understanding this helps me provide better recommendations.`;
    }
  }

  // Try to match response template based on keywords in user context
  const keywords = userMessage.toLowerCase().split(/\s+/);
  let template = agent.responseTemplates.default;

  for (const key in agent.responseTemplates) {
    if (key === "default") continue;
    if (keywords.some(k => key.includes(k) || k.includes(key))) {
      const categoryTemplate = agent.responseTemplates[key];
      for (const subKey in categoryTemplate) {
        if (subKey === "default") continue;
        if (keywords.some(k => subKey.includes(k) || k.includes(subKey))) {
          template = categoryTemplate[subKey];
          break;
        }
      }
      if (template !== agent.responseTemplates.default) break;
      template = categoryTemplate.default || agent.responseTemplates.default;
      break;
    }
  }

  // Add follow-up prompt
  return `${template}\n\nFeel free to ask follow-up questions or let me know more details about your specific situation!`;
}
