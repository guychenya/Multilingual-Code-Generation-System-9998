import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI (optional - requires API key)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Language-specific code generation templates
const languageTemplates = {
  javascript: {
    extension: 'js',
    template: (prompt) => `// ${prompt}\n\n// Generated JavaScript code\nfunction solution() {\n  // Implementation here\n  return 'result';\n}\n\n// Usage\nconst result = solution();\nconsole.log(result);`
  },
  python: {
    extension: 'py',
    template: (prompt) => `# ${prompt}\n\ndef solution():\n    """\n    Implementation based on: ${prompt}\n    """\n    # Implementation here\n    return 'result'\n\n# Usage\nif __name__ == "__main__":\n    result = solution()\n    print(result)`
  },
  java: {
    extension: 'java',
    template: (prompt) => `// ${prompt}\n\npublic class Solution {\n    public static void main(String[] args) {\n        Solution solution = new Solution();\n        String result = solution.solve();\n        System.out.println(result);\n    }\n    \n    public String solve() {\n        // Implementation here\n        return "result";\n    }\n}`
  },
  cpp: {
    extension: 'cpp',
    template: (prompt) => `// ${prompt}\n\n#include <iostream>\n#include <string>\n\nclass Solution {\npublic:\n    std::string solve() {\n        // Implementation here\n        return "result";\n    }\n};\n\nint main() {\n    Solution solution;\n    std::string result = solution.solve();\n    std::cout << result << std::endl;\n    return 0;\n}`
  },
  csharp: {
    extension: 'cs',
    template: (prompt) => `// ${prompt}\n\nusing System;\n\nclass Program {\n    static void Main() {\n        var solution = new Solution();\n        var result = solution.Solve();\n        Console.WriteLine(result);\n    }\n}\n\nclass Solution {\n    public string Solve() {\n        // Implementation here\n        return "result";\n    }\n}`
  },
  php: {
    extension: 'php',
    template: (prompt) => `<?php\n// ${prompt}\n\nclass Solution {\n    public function solve() {\n        // Implementation here\n        return 'result';\n    }\n}\n\n// Usage\n$solution = new Solution();\n$result = $solution->solve();\necho $result;\n?>`
  },
  ruby: {
    extension: 'rb',
    template: (prompt) => `# ${prompt}\n\nclass Solution\n  def solve\n    # Implementation here\n    'result'\n  end\nend\n\n# Usage\nsolution = Solution.new\nresult = solution.solve\nputs result`
  },
  go: {
    extension: 'go',
    template: (prompt) => `// ${prompt}\n\npackage main\n\nimport "fmt"\n\nfunc solution() string {\n    // Implementation here\n    return "result"\n}\n\nfunc main() {\n    result := solution()\n    fmt.Println(result)\n}`
  },
  rust: {
    extension: 'rs',
    template: (prompt) => `// ${prompt}\n\nfn solution() -> String {\n    // Implementation here\n    String::from("result")\n}\n\nfn main() {\n    let result = solution();\n    println!("{}", result);\n}`
  },
  swift: {
    extension: 'swift',
    template: (prompt) => `// ${prompt}\n\nclass Solution {\n    func solve() -> String {\n        // Implementation here\n        return "result"\n    }\n}\n\n// Usage\nlet solution = Solution()\nlet result = solution.solve()\nprint(result)`
  },
  html: {
    extension: 'html',
    template: (prompt) => `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${prompt}</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 0;\n            padding: 20px;\n            line-height: 1.6;\n        }\n        .container {\n            max-width: 800px;\n            margin: 0 auto;\n            padding: 20px;\n            border: 1px solid #ddd;\n            border-radius: 5px;\n        }\n        h1 {\n            color: #333;\n        }\n        button {\n            background-color: #4CAF50;\n            color: white;\n            border: none;\n            padding: 10px 15px;\n            border-radius: 4px;\n            cursor: pointer;\n        }\n        button:hover {\n            background-color: #45a049;\n        }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <h1>${prompt}</h1>\n        <p>This is a sample HTML page generated for: ${prompt}</p>\n        <button onclick="alert('Button clicked!')">Click Me</button>\n    </div>\n    <script>\n        console.log('HTML page loaded successfully');\n    </script>\n</body>\n</html>`
  }
};

// Enhanced code generation with AI or templates
const generateCodeWithAI = async (prompt, language) => {
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a professional software developer. Generate clean, well-commented, production-ready code in ${language}. Include proper error handling and best practices.`
          },
          {
            role: "user",
            content: `Generate ${language} code for: ${prompt}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to template
    }
  }
  
  // Fallback to template-based generation
  const template = languageTemplates[language];
  if (template) {
    return template.template(prompt);
  }
  
  return `// ${prompt}\n// Generated code for ${language}\nconsole.log('Code generated successfully');`;
};

// API Routes
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, language } = req.body;
    
    if (!prompt || !language) {
      return res.status(400).json({ error: 'Prompt and language are required' });
    }
    
    const code = await generateCodeWithAI(prompt, language);
    
    const response = {
      id: uuidv4(),
      code,
      language,
      prompt,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/languages', (req, res) => {
  const languages = Object.keys(languageTemplates).map(key => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    extension: languageTemplates[key].extension
  }));
  
  res.json(languages);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Code Generator Server running on port ${PORT}`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
  console.log(`🤖 OpenAI integration: ${openai ? 'Enabled' : 'Disabled (using templates)'}`);
});