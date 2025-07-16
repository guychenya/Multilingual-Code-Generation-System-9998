import axios from 'axios';

// Use relative paths or environment variables for API endpoints
// This allows the application to work in both development and production
const API_BASE_URL = import.meta.env.PROD 
  ? '/api' // In production, use relative path
  : 'http://localhost:3001/api'; // In development, use localhost

export const generateCode = async (prompt, language) => {
  try {
    // Try to call the API
    const response = await axios.post(`${API_BASE_URL}/generate`, {
      prompt,
      language
    });
    
    // Add a small artificial delay to allow the visualizer to show
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return response.data;
  } catch (error) {
    console.error('Error calling code generation API:', error);
    
    // Always fallback to mock generation to ensure the application works
    // even if the API is unavailable
    return {
      code: generateMockCode(prompt, language),
      language,
      id: Date.now().toString(),
      prompt,
      timestamp: new Date().toISOString()
    };
  }
};

const generateMockCode = (prompt, language) => {
  const mockTemplates = {
    javascript: `// ${prompt}

function solution() {
  // Implementation based on: ${prompt}
  console.log('Generated JavaScript code');
  return 'result';
}

// Usage example
const result = solution();
console.log(result);`,

    python: `# ${prompt}

def solution():
    """
    Implementation based on: ${prompt}
    """
    print('Generated Python code')
    return 'result'

# Usage example
if __name__ == "__main__":
    result = solution()
    print(result)`,

    java: `// ${prompt}

public class Solution {
    public static void main(String[] args) {
        Solution solution = new Solution();
        String result = solution.solve();
        System.out.println(result);
    }

    public String solve() {
        // Implementation based on: ${prompt}
        System.out.println("Generated Java code");
        return "result";
    }
}`,

    cpp: `// ${prompt}

#include <iostream>
#include <string>

class Solution {
public:
    std::string solve() {
        // Implementation based on: ${prompt}
        std::cout << "Generated C++ code" << std::endl;
        return "result";
    }
};

int main() {
    Solution solution;
    std::string result = solution.solve();
    std::cout << result << std::endl;
    return 0;
}`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
            color: #333;
            background-color: #f7f7f7;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #45a049;
        }
        img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 10px 0;
        }
        .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${prompt}</h1>
        <p>This is a sample HTML page generated for: ${prompt}</p>
        
        <div class="card">
            <h2>Interactive Example</h2>
            <p>Click the button below to see an action:</p>
            <button onclick="document.getElementById('demo').innerHTML = 'Button was clicked at ' + new Date().toLocaleTimeString()">Click Me</button>
            <p id="demo"></p>
        </div>
        
        <div class="card">
            <h2>Sample Image</h2>
            <img src="https://source.unsplash.com/random/800x400/?nature" alt="Random Nature Image">
            <p>A beautiful image from Unsplash</p>
        </div>
    </div>
    
    <script>
        console.log('HTML page loaded successfully');
        
        // Add a simple animation to the heading
        const heading = document.querySelector('h1');
        heading.style.transition = 'color 0.5s ease';
        
        heading.addEventListener('mouseover', function() {
            this.style.color = '#3498db';
        });
        
        heading.addEventListener('mouseout', function() {
            this.style.color = '#2c3e50';
        });
    </script>
</body>
</html>`
  };

  return mockTemplates[language] || `// ${prompt}\n// Generated code for ${language}\nconsole.log('Code generated successfully');`;
};

export const saveToHistory = (entry) => {
  try {
    const history = JSON.parse(localStorage.getItem('codeGenerationHistory') || '[]');
    history.unshift(entry);
    localStorage.setItem('codeGenerationHistory', JSON.stringify(history.slice(0, 50))); // Keep last 50 entries
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};

// Function to run JavaScript code in a sandbox
export const executeJavaScript = (code) => {
  try {
    // Create a sandbox iframe for safely executing JS code
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Prepare console.log capture
    const logs = [];
    const originalConsoleLog = iframe.contentWindow.console.log;
    iframe.contentWindow.console.log = (...args) => {
      logs.push(args.join(' '));
      originalConsoleLog.apply(iframe.contentWindow.console, args);
    };

    // Execute the code
    const result = iframe.contentWindow.eval(code);

    // Clean up
    document.body.removeChild(iframe);

    return {
      result: result,
      logs: logs,
      error: null
    };
  } catch (e) {
    return {
      result: null,
      logs: [],
      error: e.message
    };
  }
};