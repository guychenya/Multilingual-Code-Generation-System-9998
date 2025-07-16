/**
 * Intelligent Language Detection Service
 * Analyzes natural language prompts to suggest appropriate programming languages
 */

// Language detection patterns and keywords
const LANGUAGE_PATTERNS = {
  javascript: {
    keywords: [
      'javascript', 'js', 'node', 'nodejs', 'react', 'vue', 'angular', 'express',
      'npm', 'yarn', 'dom', 'browser', 'frontend', 'backend', 'api', 'json',
      'async', 'await', 'promise', 'callback', 'jquery', 'typescript', 'es6',
      'webpack', 'babel', 'next.js', 'nuxt', 'electron', 'cordova', 'ionic'
    ],
    patterns: [
      /\b(function|const|let|var)\b/i,
      /\b(arrow function|fat arrow)\b/i,
      /\b(console\.log|document\.)\b/i,
      /\b(require|import|export)\b/i,
      /\b(onclick|onload|event)\b/i
    ],
    frameworks: ['react', 'vue', 'angular', 'express', 'next.js', 'nuxt'],
    weight: 1.0
  },
  
  python: {
    keywords: [
      'python', 'py', 'django', 'flask', 'pandas', 'numpy', 'matplotlib',
      'tensorflow', 'pytorch', 'scikit-learn', 'jupyter', 'anaconda',
      'pip', 'virtualenv', 'lambda', 'list comprehension', 'decorator',
      'machine learning', 'data science', 'ai', 'automation', 'script'
    ],
    patterns: [
      /\b(def|class|import|from)\b/i,
      /\b(print|input|range)\b/i,
      /\b(if __name__ == "__main__")\b/i,
      /\b(self|cls)\b/i,
      /\b(pip install|conda)\b/i
    ],
    frameworks: ['django', 'flask', 'fastapi', 'pandas', 'numpy'],
    weight: 1.0
  },

  html: {
    keywords: [
      'html', 'webpage', 'website', 'landing page', 'form', 'table',
      'responsive', 'bootstrap', 'css', 'styling', 'layout', 'ui',
      'user interface', 'frontend', 'web page', 'markup', 'semantic',
      'accessibility', 'seo', 'meta tags', 'responsive design'
    ],
    patterns: [
      /\b(div|span|p|h1|h2|h3|button|input|form)\b/i,
      /\b(html|head|body|title)\b/i,
      /\b(class|id|style)\b/i,
      /\b(<\w+>|<\/\w+>)\b/i,
      /\b(responsive|mobile-first)\b/i
    ],
    frameworks: ['bootstrap', 'tailwind', 'bulma', 'foundation'],
    weight: 1.2
  },

  css: {
    keywords: [
      'css', 'styling', 'design', 'layout', 'responsive', 'flexbox',
      'grid', 'animation', 'transition', 'sass', 'scss', 'less',
      'tailwind', 'bootstrap', 'material design', 'ui design',
      'color scheme', 'typography', 'media queries', 'hover effects'
    ],
    patterns: [
      /\b(color|background|margin|padding|border)\b/i,
      /\b(flex|grid|position|display)\b/i,
      /\b(hover|active|focus|visited)\b/i,
      /\b(@media|@keyframes)\b/i,
      /\b(px|em|rem|vh|vw|%)\b/i
    ],
    frameworks: ['tailwind', 'bootstrap', 'sass', 'less'],
    weight: 1.1
  },

  java: {
    keywords: [
      'java', 'spring', 'maven', 'gradle', 'android', 'jsp', 'servlet',
      'hibernate', 'jpa', 'enterprise', 'microservices', 'rest api',
      'junit', 'mockito', 'object oriented', 'oop', 'inheritance',
      'polymorphism', 'encapsulation', 'abstraction', 'interface'
    ],
    patterns: [
      /\b(public class|private|protected|static)\b/i,
      /\b(void|String|int|boolean|double)\b/i,
      /\b(extends|implements|abstract)\b/i,
      /\b(System\.out\.println|Scanner)\b/i,
      /\b(try|catch|finally|throw)\b/i
    ],
    frameworks: ['spring', 'hibernate', 'struts', 'maven'],
    weight: 1.0
  },

  cpp: {
    keywords: [
      'c++', 'cpp', 'c plus plus', 'object oriented', 'oop', 'stl',
      'template', 'namespace', 'pointer', 'reference', 'memory management',
      'performance', 'game development', 'system programming', 'embedded',
      'algorithm', 'data structure', 'competitive programming'
    ],
    patterns: [
      /\b(#include|using namespace|std::)\b/i,
      /\b(class|struct|template|typename)\b/i,
      /\b(cout|cin|endl|vector|string)\b/i,
      /\b(new|delete|malloc|free)\b/i,
      /\b(public:|private:|protected:)\b/i
    ],
    frameworks: ['qt', 'boost', 'opencv', 'eigen'],
    weight: 1.0
  },

  csharp: {
    keywords: [
      'c#', 'csharp', 'dotnet', '.net', 'asp.net', 'mvc', 'wpf', 'winforms',
      'entity framework', 'linq', 'xamarin', 'blazor', 'unity',
      'visual studio', 'nuget', 'class library', 'web api', 'windows'
    ],
    patterns: [
      /\b(using|namespace|class|interface)\b/i,
      /\b(public|private|protected|internal)\b/i,
      /\b(string|int|bool|double|decimal)\b/i,
      /\b(Console\.WriteLine|Console\.ReadLine)\b/i,
      /\b(try|catch|finally|throw)\b/i
    ],
    frameworks: ['asp.net', 'entity framework', 'xamarin', 'blazor'],
    weight: 1.0
  },

  php: {
    keywords: [
      'php', 'laravel', 'symfony', 'wordpress', 'drupal', 'codeigniter',
      'web development', 'server side', 'mysql', 'database', 'cms',
      'web application', 'backend', 'api', 'rest', 'composer'
    ],
    patterns: [
      /\b(<\?php|\?>)\b/i,
      /\b(echo|print|var_dump)\b/i,
      /\b(\$\w+|function|class)\b/i,
      /\b(mysqli|pdo|sql)\b/i,
      /\b(include|require|namespace)\b/i
    ],
    frameworks: ['laravel', 'symfony', 'codeigniter', 'wordpress'],
    weight: 1.0
  },

  sql: {
    keywords: [
      'sql', 'database', 'query', 'table', 'select', 'insert', 'update',
      'delete', 'join', 'mysql', 'postgresql', 'sqlite', 'oracle',
      'stored procedure', 'trigger', 'index', 'foreign key', 'primary key',
      'normalization', 'crud', 'data analysis', 'reporting'
    ],
    patterns: [
      /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i,
      /\b(FROM|WHERE|JOIN|GROUP BY|ORDER BY|HAVING)\b/i,
      /\b(INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN)\b/i,
      /\b(COUNT|SUM|AVG|MAX|MIN)\b/i,
      /\b(PRIMARY KEY|FOREIGN KEY|INDEX)\b/i
    ],
    frameworks: ['mysql', 'postgresql', 'sqlite', 'mongodb'],
    weight: 1.3
  },

  go: {
    keywords: [
      'go', 'golang', 'goroutine', 'channel', 'concurrency', 'microservices',
      'docker', 'kubernetes', 'api', 'web server', 'performance',
      'system programming', 'cloud', 'distributed systems'
    ],
    patterns: [
      /\b(package|import|func|var|const)\b/i,
      /\b(go|goroutine|channel|select)\b/i,
      /\b(fmt\.Print|fmt\.Println)\b/i,
      /\b(defer|panic|recover)\b/i,
      /\b(struct|interface|map|slice)\b/i
    ],
    frameworks: ['gin', 'echo', 'fiber', 'beego'],
    weight: 1.0
  },

  rust: {
    keywords: [
      'rust', 'memory safety', 'performance', 'system programming',
      'cargo', 'crate', 'ownership', 'borrowing', 'lifetime',
      'concurrency', 'web assembly', 'blockchain', 'game development'
    ],
    patterns: [
      /\b(fn|let|mut|const|static)\b/i,
      /\b(struct|enum|impl|trait)\b/i,
      /\b(println!|print!|panic!)\b/i,
      /\b(match|if let|while let)\b/i,
      /\b(Option|Result|Vec|HashMap)\b/i
    ],
    frameworks: ['actix', 'rocket', 'tokio', 'serde'],
    weight: 1.0
  }
};

// Project type detection
const PROJECT_TYPES = {
  'web application': ['javascript', 'html', 'css', 'python', 'php'],
  'mobile app': ['javascript', 'java', 'swift', 'kotlin'],
  'desktop application': ['java', 'csharp', 'cpp', 'python'],
  'game': ['cpp', 'csharp', 'javascript'],
  'api': ['javascript', 'python', 'java', 'go', 'php'],
  'database': ['sql'],
  'data analysis': ['python', 'sql', 'r'],
  'machine learning': ['python'],
  'system programming': ['cpp', 'rust', 'go'],
  'automation script': ['python', 'bash'],
  'website': ['html', 'css', 'javascript'],
  'landing page': ['html', 'css', 'javascript'],
  'form': ['html', 'css', 'javascript'],
  'dashboard': ['javascript', 'python', 'html', 'css'],
  'crud': ['javascript', 'python', 'java', 'php', 'sql'],
  'rest api': ['javascript', 'python', 'java', 'go', 'php'],
  'microservice': ['javascript', 'python', 'java', 'go'],
  'algorithm': ['python', 'java', 'cpp', 'javascript'],
  'data structure': ['python', 'java', 'cpp', 'javascript']
};

/**
 * Analyze prompt to detect programming languages
 */
export const analyzePrompt = (prompt) => {
  const normalizedPrompt = prompt.toLowerCase();
  const scores = {};
  
  // Initialize scores
  Object.keys(LANGUAGE_PATTERNS).forEach(lang => {
    scores[lang] = 0;
  });

  // Analyze keywords
  Object.entries(LANGUAGE_PATTERNS).forEach(([language, config]) => {
    // Check keywords
    config.keywords.forEach(keyword => {
      if (normalizedPrompt.includes(keyword)) {
        scores[language] += config.weight * 2;
      }
    });

    // Check patterns
    config.patterns.forEach(pattern => {
      if (pattern.test(prompt)) {
        scores[language] += config.weight * 1.5;
      }
    });

    // Check frameworks
    config.frameworks.forEach(framework => {
      if (normalizedPrompt.includes(framework)) {
        scores[language] += config.weight * 1.8;
      }
    });
  });

  // Analyze project types
  Object.entries(PROJECT_TYPES).forEach(([projectType, languages]) => {
    if (normalizedPrompt.includes(projectType)) {
      languages.forEach(lang => {
        scores[lang] += 1.5;
      });
    }
  });

  // Context-based scoring
  if (normalizedPrompt.includes('web') || normalizedPrompt.includes('website')) {
    scores.html += 2;
    scores.css += 1.5;
    scores.javascript += 2;
  }

  if (normalizedPrompt.includes('style') || normalizedPrompt.includes('design')) {
    scores.css += 2;
    scores.html += 1;
  }

  if (normalizedPrompt.includes('data') || normalizedPrompt.includes('analysis')) {
    scores.python += 2;
    scores.sql += 1.5;
  }

  if (normalizedPrompt.includes('performance') || normalizedPrompt.includes('fast')) {
    scores.cpp += 1.5;
    scores.rust += 1.5;
    scores.go += 1.2;
  }

  // Convert scores to sorted suggestions
  const suggestions = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([language, score]) => ({
      language,
      score,
      confidence: Math.min(score / 5, 1) // Normalize confidence to 0-1
    }));

  return {
    suggestions: suggestions.slice(0, 5), // Top 5 suggestions
    primarySuggestion: suggestions[0]?.language || 'javascript',
    confidence: suggestions[0]?.confidence || 0
  };
};

/**
 * Get framework suggestions based on detected language
 */
export const getFrameworkSuggestions = (language, prompt) => {
  const config = LANGUAGE_PATTERNS[language];
  if (!config) return [];

  const normalizedPrompt = prompt.toLowerCase();
  const frameworkScores = {};

  config.frameworks.forEach(framework => {
    frameworkScores[framework] = normalizedPrompt.includes(framework) ? 2 : 0;
  });

  return Object.entries(frameworkScores)
    .filter(([_, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([framework]) => framework);
};

/**
 * Generate enhanced prompt with context
 */
export const enhancePrompt = (originalPrompt, detectedLanguage, frameworks = []) => {
  let enhanced = originalPrompt;
  
  // Add language context if confidence is high
  const analysis = analyzePrompt(originalPrompt);
  if (analysis.confidence > 0.6) {
    enhanced += `\n\n// Generate this in ${detectedLanguage}`;
    
    if (frameworks.length > 0) {
      enhanced += ` using ${frameworks.join(', ')}`;
    }
  }

  return enhanced;
};

/**
 * Get language-specific templates and hints
 */
export const getLanguageHints = (language) => {
  const hints = {
    javascript: [
      'Use modern ES6+ syntax',
      'Include proper error handling',
      'Add JSDoc comments',
      'Consider async/await for promises'
    ],
    python: [
      'Follow PEP 8 style guide',
      'Use type hints where appropriate',
      'Include docstrings',
      'Handle exceptions properly'
    ],
    html: [
      'Use semantic HTML elements',
      'Include proper meta tags',
      'Ensure accessibility',
      'Make it responsive'
    ],
    css: [
      'Use modern CSS features',
      'Include responsive design',
      'Consider mobile-first approach',
      'Use CSS custom properties'
    ],
    java: [
      'Follow Java naming conventions',
      'Include proper exception handling',
      'Use appropriate access modifiers',
      'Add JavaDoc comments'
    ],
    cpp: [
      'Use RAII principles',
      'Include proper memory management',
      'Use standard library containers',
      'Add const correctness'
    ]
  };

  return hints[language] || [];
};