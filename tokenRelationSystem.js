# Token Relation System - New Tab Implementation

# First, create a minimal app compatibility layer for the current environment
11 {"code": "
  // Create the app object for notifications in the current environment
  window.app = {
    rootElement: document.createElement('div'),
    api: {
      ui: {
        showNotification: function(message) {
          const notif = document.createElement('div');
          notif.style.position = 'fixed';
          notif.style.bottom = '20px';
          notif.style.right = '20px';
          notif.style.backgroundColor = '#333';
          notif.style.color = '#fff';
          notif.style.padding = '12px 16px';
          notif.style.borderRadius = '6px';
          notif.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          notif.style.zIndex = '1000';
          notif.style.maxWidth = '300px';
          notif.textContent = message;
          document.body.appendChild(notif);
          setTimeout(() => notif.remove(), 4000);
        },
        confirm: function(message) {
          return confirm(message);
        },
        prompt: function(message, defaultValue) {
          return prompt(message, defaultValue);
        }
      },
      fs: {
        fileExists: function() { return false; },
        readFile: function() { return null; },
        writeFile: function() { return true; },
        listFiles: function() { return []; }
      }
    }
  };

  // Append the root element to the document
  document.body.appendChild(app.rootElement);
"}

# Store the HTML content for the Token Relation System
10 {"key": "htmlContent", "value": `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Token Relation System</title>
  <style>
    :root {
      --panel-bg: #1e1e1e;
      --main-border: #333;
      --header-bg: #252525;
      --main-text: #eee;
      --secondary-text: #aaa;
      --item-bg: #2a2a2a;
      --token-bg: #2d2d2d;
      --result-bg: #2a2a2a;
      --accent-color: #3b82f6;
      --success-color: #10b981;
      --warning-color: #f59e0b;
      --danger-color: #ef4444;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #121212;
      color: var(--main-text);
      margin: 0;
      padding: 0;
      height: 100vh;
      overflow: hidden;
    }
    
    input, select, button {
      background-color: #333;
      color: var(--main-text);
      border: 1px solid #444;
      border-radius: 4px;
    }
    
    button {
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    button:hover {
      background-color: #444;
    }
    
    /* Custom notification styling */
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: var(--panel-bg);
      color: var(--main-text);
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      max-width: 300px;
      animation: fadeIn 0.3s, fadeOut 0.3s 3.7s;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(20px); }
    }
  </style>
</head>
<body>
  <div id="app-root"></div>
  
  <script>
    // Create the app object
    window.app = {
      rootElement: document.getElementById('app-root'),
      api: {
        ui: {
          showNotification: function(message) {
            const notif = document.createElement('div');
            notif.className = 'notification';
            notif.textContent = message;
            document.body.appendChild(notif);
            setTimeout(() => notif.remove(), 4000);
          },
          confirm: function(message) {
            return confirm(message);
          },
          prompt: function(message, defaultValue) {
            return prompt(message, defaultValue);
          },
          alert: function(message) {
            alert(message);
          }
        },
        fs: {
          fileExists: function(path) {
            return localStorage.getItem('fs_' + path) !== null;
          },
          readFile: function(path) {
            return localStorage.getItem('fs_' + path);
          },
          writeFile: function(path, content) {
            localStorage.setItem('fs_' + path, content);
            return true;
          },
          listFiles: function(path) {
            const prefix = 'fs_' + path + '/';
            const result = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key.startsWith(prefix)) {
                const name = key.substring(prefix.length);
                if (name.includes('/')) continue; // Skip subdirectories
                result.push({
                  type: 'file',
                  name: name,
                  path: path + '/' + name
                });
              }
            }
            return result;
          }
        }
      }
    };
    
    // Instruction system simulation
    const instructionHandlers = {};
    
    // Context for storing state
    const context = {
      state: null,
      executeInstruction: function(opcode, params) {
        if (instructionHandlers[opcode]) {
          return instructionHandlers[opcode](params, context);
        }
        console.error('Unknown opcode:', opcode);
        return { success: false, message: 'Unknown opcode: ' + opcode };
      }
    };
    
    // Register instruction handlers
    function register(opcode, handler, description) {
      instructionHandlers[opcode] = handler;
    }
    
    // System Instructions (100-199)
    register(100, (params, context) => {
      // Initialize system state
      const defaultState = {
        lexicon: { alphabet: '01', maxLength: 3 },
        generatedTokens: ["0", "1", "00", "01", "10", "11", "000", "001", "010", "011", "100", "101", "110", "111"],
        relationDefinitions: [
          { id: 1678886400000, name: 'EQUALS', definition: 'return tokenA === tokenB;' },
          { id: 1678886400001, name: 'IS_PREFIX_OF', definition: 'return tokenB.startsWith(tokenA);' },
          { id: 1678886400002, name: 'IS_SUFFIX_OF', definition: 'return tokenB.endsWith(tokenA);' },
          { id: 1678886400003, name: 'CONTAINS', definition: 'return tokenB.includes(tokenA);' }
        ]
      };
      
      try {
        if (params.path) {
          // Load from file system if path provided
          const content = app.api.fs.readFile(params.path);
          if (content) {
            context.state = JSON.parse(content);
            return { success: true, message: "State loaded from file" };
          }
        } else if (params.restore) {
          // Try to load from localStorage
          const savedData = localStorage.getItem('token_system_state');
          if (savedData) {
            context.state = JSON.parse(savedData);
            return { success: true, message: "State restored from localStorage" };
          }
        }
        
        // Initialize with defaults if no saved state
        context.state = JSON.parse(JSON.stringify(defaultState));
        return { success: true, message: "New state initialized with defaults" };
      } catch (error) {
        context.state = JSON.parse(JSON.stringify(defaultState));
        return { success: true, message: "Error occurred, initialized with defaults" };
      }
    });
    
    register(101, (params, context) => {
      // Save state
      if (!context.state) {
        return { success: false, message: "No state to save" };
      }
      
      try {
        // Save to localStorage for persistence
        localStorage.setItem('token_system_state', JSON.stringify(context.state));
        
        // If path is provided, also save to file
        if (params.path) {
          app.api.fs.writeFile(params.path, JSON.stringify(context.state, null, 2));
          return { success: true, message: \`State saved to \${params.path}\` };
        }
        
        return { success: true, message: "State saved to localStorage" };
      } catch (error) {
        return { success: false, message: "Failed to save state: " + error.message };
      }
    });
    
    // UI Instructions (200-299)
    register(200, (params, context) => {
      // Create main UI
      if (!context.state) {
        return { success: false, message: "System not initialized" };
      }
      
      // Clear existing content
      app.rootElement.innerHTML = '';
      
      // Create grid layout
      const container = document.createElement('div');
      container.style.display = 'grid';
      container.style.gridTemplateColumns = 'repeat(3, 1fr)';
      container.style.gridTemplateRows = 'auto auto';
      container.style.gap = '10px';
      container.style.padding = '10px';
      container.style.height = '100%';
      
      // Create widgets
      const lexiconWidget = createWidget('Lexicon Manager', 'lexicon', 1, 1);
      const tokensWidget = createWidget('Generated Tokens', 'tokens', 1, 2, 2, 1);
      const relationsWidget = createWidget('Relation-Definition Manager', 'relations', 1, 3);
      const comparatorWidget = createWidget('Comparison Engine', 'comparator', 2, 3);
      const systemWidget = createWidget('System & Data', 'system', 2, 1);
      
      // Add widgets to container
      container.appendChild(lexiconWidget);
      container.appendChild(tokensWidget);
      container.appendChild(relationsWidget);
      container.appendChild(comparatorWidget);
      container.appendChild(systemWidget);
      
      // Add container to root
      app.rootElement.appendChild(container);
      
      // Update widget contents
      renderLexiconWidget(lexiconWidget, context);
      renderTokensWidget(tokensWidget, context);
      renderRelationsWidget(relationsWidget, context);
      renderComparatorWidget(comparatorWidget, context);
      renderSystemWidget(systemWidget, context);
      
      return { success: true, message: "UI created" };
      
      // Helper functions
      function createWidget(title, id, row, col, rowSpan = 1, colSpan = 1) {
        const widget = document.createElement('div');
        widget.id = id + '-widget';
        widget.className = 'token-system-widget';
        widget.style.backgroundColor = 'var(--panel-bg)';
        widget.style.border = '1px solid var(--main-border)';
        widget.style.borderRadius = '6px';
        widget.style.display = 'flex';
        widget.style.flexDirection = 'column';
        widget.style.overflow = 'hidden';
        widget.style.gridRow = \`\${row} / span \${rowSpan}\`;
        widget.style.gridColumn = \`\${col} / span \${colSpan}\`;
        
        const header = document.createElement('div');
        header.className = 'widget-header';
        header.style.padding = '8px 12px';
        header.style.borderBottom = '1px solid var(--main-border)';
        header.style.backgroundColor = 'var(--header-bg, #2a2a2a)';
        header.style.fontWeight = 'bold';
        header.textContent = title;
        
        const content = document.createElement('div');
        content.className = 'widget-content';
        content.style.padding = '12px';
        content.style.overflow = 'auto';
        content.style.flex = '1';
        
        widget.appendChild(header);
        widget.appendChild(content);
        
        return widget;
      }
      
      function renderLexiconWidget(widget, context) {
        const content = widget.querySelector('.widget-content');
        content.innerHTML = \`
          <div>
            <label>Token Alphabet:</label>
            <input type="text" id="alphabet-input" value="\${context.state.lexicon.alphabet}" 
                   style="width: 100%; margin-top: 4px; margin-bottom: 10px; padding: 6px; border-radius: 4px;">
          </div>
          <div>
            <label>Max Token Length:</label>
            <input type="number" id="max-length-input" value="\${context.state.lexicon.maxLength}" min="1" 
                   style="width: 100%; margin-top: 4px; margin-bottom: 10px; padding: 6px; border-radius: 4px;">
          </div>
          <button id="generate-btn" 
                  style="width: 100%; padding: 8px; margin-top: 8px; border-radius: 4px; cursor: pointer;">
            Generate Tokens
          </button>
        \`;
        
        document.getElementById('generate-btn').addEventListener('click', () => {
          const alphabet = document.getElementById('alphabet-input').value;
          const maxLength = parseInt(document.getElementById('max-length-input').value);
          generateTokens(alphabet, maxLength, context);
        });
      }
      
      function renderTokensWidget(widget, context) {
        const content = widget.querySelector('.widget-content');
        if (context.state.generatedTokens.length === 0) {
          content.innerHTML = '<div style="color: var(--secondary-text);">No tokens generated yet. Use the Lexicon Manager to generate tokens.</div>';
          return;
        }
        
        content.innerHTML = \`
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 6px;">
            \${context.state.generatedTokens.map(token => 
              \`<div style="background-color: var(--token-bg, #2a2a2a); padding: 6px; border-radius: 4px; text-align: center; font-family: monospace;">\${token}</div>\`
            ).join('')}
          </div>
        \`;
      }
      
      function renderRelationsWidget(widget, context) {
        const content = widget.querySelector('.widget-content');
        
        let html = '<div id="relations-list" style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;">';
        
        context.state.relationDefinitions.forEach(relation => {
          html += \`
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: var(--item-bg, #222); border-radius: 4px;">
              <span style="font-family: monospace; color: var(--accent-color, #3b82f6);">\${relation.name}</span>
              <div>
                <button class="edit-relation-btn" data-id="\${relation.id}" style="background: none; border: none; cursor: pointer; margin-right: 5px;">✏️</button>
                <button class="delete-relation-btn" data-id="\${relation.id}" style="background: none; border: none; cursor: pointer;">🗑️</button>
              </div>
            </div>
          \`;
        });
        
        html += '</div>';
        html += '<button id="add-relation-btn" style="width: 100%; padding: 8px; border-radius: 4px; cursor: pointer;">Add New Relation</button>';
        
        content.innerHTML = html;
        
        // Add event listeners
        document.querySelectorAll('.edit-relation-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            editRelation(btn.dataset.id, context);
          });
        });
        
        document.querySelectorAll('.delete-relation-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            deleteRelation(btn.dataset.id, context);
          });
        });
        
        document.getElementById('add-relation-btn').addEventListener('click', () => {
          addRelation(context);
        });
      }
      
      function renderComparatorWidget(widget, context) {
        const content = widget.querySelector('.widget-content');
        
        content.innerHTML = \`
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div>
              <label>Token A:</label>
              <select id="token-a-select" style="width: 100%; margin-top: 4px; padding: 6px; border-radius: 4px;">
                \${context.state.generatedTokens.map(t => \`<option value="\${t}">\${t}</option>\`).join('')}
              </select>
            </div>
            <div>
              <label>Relation:</label>
              <select id="relation-select" style="width: 100%; margin-top: 4px; padding: 6px; border-radius: 4px;">
                \${context.state.relationDefinitions.map(r => \`<option value="\${r.id}">\${r.name}</option>\`).join('')}
              </select>
            </div>
            <div>
              <label>Token B:</label>
              <select id="token-b-select" style="width: 100%; margin-top: 4px; padding: 6px; border-radius: 4px;">
                \${context.state.generatedTokens.map(t => \`<option value="\${t}">\${t}</option>\`).join('')}
              </select>
            </div>
            <button id="compare-btn" style="width: 100%; padding: 8px; margin-top: 8px; border-radius: 4px; cursor: pointer;">
              Compare Tokens
            </button>
            <div id="result-display" style="text-align: center; margin-top: 10px; padding: 12px; background: var(--result-bg, #222); border-radius: 6px;">
              <div style="margin-bottom: 5px;">Result:</div>
              <div id="comparison-result" style="font-size: 24px; font-weight: bold;">-</div>
            </div>
          </div>
        \`;
        
        document.getElementById('compare-btn').addEventListener('click', () => {
          const tokenA = document.getElementById('token-a-select').value;
          const tokenB = document.getElementById('token-b-select').value;
          const relationId = document.getElementById('relation-select').value;
          compareTokens(tokenA, tokenB, relationId, context);
        });
      }
      
      function renderSystemWidget(widget, context) {
        const content = widget.querySelector('.widget-content');
        
        content.innerHTML = \`
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button id="save-btn" style="padding: 8px; border-radius: 4px; cursor: pointer;">Save State</button>
            <button id="reset-btn" style="padding: 8px; border-radius: 4px; cursor: pointer; background: var(--danger-color, #ef4444);">Reset</button>
            <button id="export-btn" style="padding: 8px; border-radius: 4px; cursor: pointer; grid-column: span 2;">Export to File</button>
            <button id="import-btn" style="padding: 8px; border-radius: 4px; cursor: pointer; grid-column: span 2;">Import from File</button>
          </div>
        \`;
        
        document.getElementById('save-btn').addEventListener('click', () => saveState(context));
        document.getElementById('reset-btn').addEventListener('click', () => resetState(context));
        document.getElementById('export-btn').addEventListener('click', () => exportState(context));
        document.getElementById('import-btn').addEventListener('click', () => importState(context));
      }
    });
    
    // Operation Instructions (300-399)
    register(300, (params, context) => {
      // Generate tokens from alphabet and max length
      if (!context.state) return { success: false, message: "System not initialized" };
      
      const alphabet = params.alphabet;
      const maxLength = params.maxLength;
      
      if (!alphabet || alphabet.length === 0) {
        return { success: false, message: "Alphabet cannot be empty" };
      }
      
      if (isNaN(maxLength) || maxLength < 1) {
        return { success: false, message: "Max length must be a positive integer" };
      }
      
      // Remove duplicates from alphabet
      const uniqueChars = [...new Set(alphabet.split(''))].join('');
      
      // Calculate potential token count (for warning)
      let tokenCount = 0;
      for (let i = 1; i <= maxLength; i++) {
        tokenCount += Math.pow(uniqueChars.length, i);
      }
      
      // If potentially too many tokens, warn user
      if (tokenCount > 10000 && !params.force) {
        return { 
          success: false, 
          warning: true, 
          message: \`This will generate \${tokenCount} tokens, which may slow down your system.\`,
          tokenCount
        };
      }
      
      // Update lexicon settings
      context.state.lexicon.alphabet = uniqueChars;
      context.state.lexicon.maxLength = maxLength;
      
      // Generate tokens
      const tokens = [];
      function generateTokens(prefix, length) {
        if (length > maxLength) return;
        for (let i = 0; i < uniqueChars.length; i++) {
          const newToken = prefix + uniqueChars[i];
          tokens.push(newToken);
          generateTokens(newToken, length + 1);
        }
      }
      
      generateTokens('', 1);
      context.state.generatedTokens = tokens;
      
      return { 
        success: true, 
        message: \`Generated \${tokens.length} tokens\`, 
        tokenCount: tokens.length
      };
    });
    
    register(301, (params, context) => {
      // Add or edit relation
      if (!context.state) return { success: false, message: "System not initialized" };
      
      const id = params.id || Date.now();
      const name = (params.name || '').trim().toUpperCase().replace(/\\s+/g, '_');
      const definition = (params.definition || '').trim();
      
      if (!name) return { success: false, message: "Relation name cannot be empty" };
      if (!definition) return { success: false, message: "Relation definition cannot be empty" };
      
      // Validate definition
      try {
        new Function('tokenA', 'tokenB', definition);
      } catch (error) {
        return { success: false, message: "Invalid definition: " + error.message };
      }
      
      // Check if we're editing or adding
      const isEditing = params.id != null;
      
      if (isEditing) {
        // Find and update existing relation
        const relationIndex = context.state.relationDefinitions.findIndex(r => r.id == id);
        if (relationIndex === -1) return { success: false, message: "Relation not found" };
        
        // Check for duplicate names (but allow same name for the relation being edited)
        if (context.state.relationDefinitions.some(r => r.name === name && r.id != id)) {
          return { success: false, message: "A relation with this name already exists" };
        }
        
        context.state.relationDefinitions[relationIndex] = { id, name, definition };
        return { success: true, message: "Relation updated", relation: { id, name, definition } };
      } else {
        // Check for duplicate names
        if (context.state.relationDefinitions.some(r => r.name === name)) {
          return { success: false, message: "A relation with this name already exists" };
        }
        
        // Add new relation
        context.state.relationDefinitions.push({ id, name, definition });
        return { success: true, message: "Relation added", relation: { id, name, definition } };
      }
    });
    
    register(302, (params, context) => {
      // Delete relation
      if (!context.state) return { success: false, message: "System not initialized" };
      
      const id = params.id;
      if (!id) return { success: false, message: "Relation ID is required" };
      
      const relationIndex = context.state.relationDefinitions.findIndex(r => r.id == id);
      if (relationIndex === -1) return { success: false, message: "Relation not found" };
      
      const relationName = context.state.relationDefinitions[relationIndex].name;
      context.state.relationDefinitions.splice(relationIndex, 1);
      
      return { success: true, message: \`Relation \${relationName} deleted\` };
    });
    
    register(303, (params, context) => {
      // Compare tokens using relation
      if (!context.state) return { success: false, message: "System not initialized" };
      
      const tokenA = params.tokenA;
      const tokenB = params.tokenB;
      const relationId = params.relationId;
      
      if (!tokenA) return { success: false, message: "Token A is required" };
      if (!tokenB) return { success: false, message: "Token B is required" };
      if (!relationId) return { success: false, message: "Relation ID is required" };
      
      // Find the relation
      const relation = context.state.relationDefinitions.find(r => r.id == relationId);
      if (!relation) return { success: false, message: "Relation not found" };
      
      // Execute the relation function
      try {
        const func = new Function('tokenA', 'tokenB', relation.definition);
        const result = func(tokenA, tokenB);
        
        return { 
          success: true, 
          result: result,
          tokenA,
          tokenB,
          relation: relation.name
        };
      } catch (error) {
        return { 
          success: false, 
          message: "Error executing relation: " + error.message 
        };
      }
    });
    
    register(304, (params, context) => {
      // Import state from file
      if (!params.path) return { success: false, message: "No file path provided" };
      
      try {
        // Read file
        if (!app.api.fs.fileExists(params.path)) {
          return { success: false, message: "File does not exist" };
        }
        
        const content = app.api.fs.readFile(params.path);
        if (!content) return { success: false, message: "Failed to read file" };
        
        const importedState = JSON.parse(content);
        
        // Validate imported state structure
        if (!importedState.lexicon || !importedState.generatedTokens || !importedState.relationDefinitions) {
          return { success: false, message: "Invalid token system file format" };
        }
        
        // Import state
        context.state = importedState;
        
        // Save to localStorage
        localStorage.setItem('token_system_state', JSON.stringify(context.state));
        
        return { success: true, message: "State imported successfully" };
      } catch (error) {
        return { success: false, message: "Import error: " + error.message };
      }
    });
    
    register(305, (params, context) => {
      // Export state to file
      if (!context.state) return { success: false, message: "No state to export" };
      
      try {
        const fileName = params.fileName || \`token-system-\${Date.now()}.json\`;
        const filePath = \`/Documents/\${fileName}\`;
        
        // Check if file exists
        if (app.api.fs.fileExists(filePath) && !params.force) {
          return { 
            success: false, 
            message: "File already exists", 
            requireConfirmation: true,
            filePath
          };
        }
        
        // Write file
        app.api.fs.writeFile(filePath, JSON.stringify(context.state, null, 2));
        
        return { success: true, message: \`Exported to \${filePath}\` };
      } catch (error) {
        return { success: false, message: "Export error: " + error.message };
      }
    });
    
    // Helper Instructions (400-499)
    register(400, (params, context) => {
      // Show notification
      const title = params.title || "Notification";
      const message = params.message || "";
      const type = params.type || "info"; // "info", "success", "error"
      
      app.api.ui.showNotification(\`\${title}: \${message}\`);
      
      return { success: true };
    });
    
    register(401, (params, context) => {
      // Show confirmation dialog
      const title = params.title || "Confirm";
      const message = params.message || "Are you sure?";
      
      return new Promise(resolve => {
        const confirmed = app.api.ui.confirm(\`\${title}\\n\\n\${message}\`);
        resolve({ confirmed });
      });
    });
    
    register(402, (params, context) => {
      // Show prompt dialog
      const title = params.title || "Input";
      const defaultValue = params.default || "";
      
      return new Promise(resolve => {
        const value = app.api.ui.prompt(title, defaultValue);
        resolve({ value, cancelled: value === null });
      });
    });
    
    // Define utility functions
    function generateTokens(alphabet, maxLength, context) {
      const result = context.executeInstruction(300, {alphabet, maxLength});
      
      if (result.success) {
        context.executeInstruction(400, {
          title: 'Success',
          message: \`Generated \${result.tokenCount} tokens\`,
          type: 'success'
        });
        context.executeInstruction(200, {refresh: true});
      } else if (result.warning) {
        context.executeInstruction(401, {
          title: 'Warning',
          message: result.message
        }).then(response => {
          if (response.confirmed) {
            const forceResult = context.executeInstruction(300, {
              alphabet, maxLength, force: true
            });
            
            if (forceResult.success) {
              context.executeInstruction(400, {
                title: 'Success',
                message: \`Generated \${forceResult.tokenCount} tokens\`,
                type: 'success'
              });
              context.executeInstruction(200, {refresh: true});
            }
          }
        });
      } else {
        context.executeInstruction(400, {
          title: 'Error',
          message: result.message,
          type: 'error'
        });
      }
    }
    
    function addRelation(context) {
      context.executeInstruction(402, {
        title: 'Enter relation name:',
        default: ''
      }).then(nameResult => {
        if (nameResult.cancelled || !nameResult.value) return;
        
        const name = nameResult.value;
        
        context.executeInstruction(402, {
          title: 'Enter relation definition (JavaScript):\\nUse tokenA and tokenB in your logic.',
          default: 'return tokenA.length === tokenB.length;'
        }).then(defResult => {
          if (defResult.cancelled || !defResult.value) return;
          
          const definition = defResult.value;
          const result = context.executeInstruction(301, {
            name, definition
          });
          
          if (result.success) {
            context.executeInstruction(400, {
              title: 'Success',
              message: result.message,
              type: 'success'
            });
            context.executeInstruction(200, {refresh: true});
          } else {
            context.executeInstruction(400, {
              title: 'Error',
              message: result.message,
              type: 'error'
            });
          }
        });
      });
    }
    
    function editRelation(id, context) {
      const relation = context.state.relationDefinitions.find(r => r.id == id);
      if (!relation) return;
      
      context.executeInstruction(402, {
        title: 'Edit relation name:',
        default: relation.name
      }).then(nameResult => {
        if (nameResult.cancelled) return;
        
        const name = nameResult.value;
        
        context.executeInstruction(402, {
          title: 'Edit relation definition (JavaScript):\\nUse tokenA and tokenB in your logic.',
          default: relation.definition
        }).then(defResult => {
          if (defResult.cancelled) return;
          
          const definition = defResult.value;
          const result = context.executeInstruction(301, {
            id, name, definition
          });
          
          if (result.success) {
            context.executeInstruction(400, {
              title: 'Success',
              message: result.message,
              type: 'success'
            });
            context.executeInstruction(200, {refresh: true});
          } else {
            context.executeInstruction(400, {
              title: 'Error',
              message: result.message,
              type: 'error'
            });
          }
        });
      });
    }
    
    function deleteRelation(id, context) {
      const relation = context.state.relationDefinitions.find(r => r.id == id);
      if (!relation) return;
      
      context.executeInstruction(401, {
        title: 'Confirm Deletion',
        message: \`Are you sure you want to delete the relation '\${relation.name}'?\`
      }).then(response => {
        if (response.confirmed) {
          const result = context.executeInstruction(302, { id });
          
          if (result.success) {
            context.executeInstruction(400, {
              title: 'Success',
              message: result.message,
              type: 'success'
            });
            context.executeInstruction(200, {refresh: true});
          } else {
            context.executeInstruction(400, {
              title: 'Error',
              message: result.message,
              type: 'error'
            });
          }
        }
      });
    }
    
    function compareTokens(tokenA, tokenB, relationId, context) {
      const result = context.executeInstruction(303, {
        tokenA, tokenB, relationId
      });
      
      const resultEl = document.getElementById('comparison-result');
      if (!resultEl) return;
      
      if (result.success) {
        resultEl.textContent = result.result.toString();
        resultEl.style.color = result.result ? 'var(--success-color, #10b981)' : 'var(--danger-color, #ef4444)';
      } else {
        resultEl.textContent = 'Error';
        resultEl.style.color = 'var(--warning-color, #f59e0b)';
        
        context.executeInstruction(400, {
          title: 'Error',
          message: result.message,
          type: 'error'
        });
      }
    }
    
    function saveState(context) {
      const result = context.executeInstruction(101, {});
      
      context.executeInstruction(400, {
        title: result.success ? 'Success' : 'Error',
        message: result.message,
        type: result.success ? 'success' : 'error'
      });
    }
    
    function resetState(context) {
      context.executeInstruction(401, {
        title: 'Confirm Reset',
        message: 'This will reset all data to default values. This cannot be undone.'
      }).then(response => {
        if (response.confirmed) {
          localStorage.removeItem('token_system_state');
          context.executeInstruction(100, {restore: false});
          context.executeInstruction(200, {refresh: true});
          
          context.executeInstruction(400, {
            title: 'Success',
            message: 'System reset to defaults',
            type: 'success'
          });
        }
      });
    }
    
    function exportState(context) {
      context.executeInstruction(402, {
        title: 'Enter filename for export:',
        default: \`token-system-\${Date.now()}.json\`
      }).then(result => {
        if (result.cancelled || !result.value) return;
        
        const fileName = result.value;
        const exportResult = context.executeInstruction(305, { fileName });
        
        if (exportResult.success) {
          context.executeInstruction(400, {
            title: 'Success',
            message: exportResult.message,
            type: 'success'
          });
        } else if (exportResult.requireConfirmation) {
          context.executeInstruction(401, {
            title: 'File Exists',
            message: 'This file already exists. Overwrite?'
          }).then(overwriteResponse => {
            if (overwriteResponse.confirmed) {
              const forceResult = context.executeInstruction(305, { 
                fileName, force: true 
              });
              
              context.executeInstruction(400, {
                title: forceResult.success ? 'Success' : 'Error',
                message: forceResult.message,
                type: forceResult.success ? 'success' : 'error'
              });
            }
          });
        } else {
          context.executeInstruction(400, {
            title: 'Error',
            message: exportResult.message,
            type: 'error'
          });
        }
      });
    }
    
    function importState(context) {
      // Get list of JSON files
      const files = app.api.fs.listFiles('/Documents');
      const jsonFiles = files.filter(file => 
        file.type === 'file' && file.name.endsWith('.json')
      );
      
      if (jsonFiles.length === 0) {
        return context.executeInstruction(400, {
          title: 'Error',
          message: 'No JSON files found in Documents folder',
          type: 'error'
        });
      }
      
      // Create file list
      let fileList = 'Select a file to import:\\n\\n';
      jsonFiles.forEach((file, index) => {
        fileList += \`\${index + 1}. \${file.name}\\n\`;
      });
      
      // Show file selection prompt
      context.executeInstruction(402, {
        title: fileList,
        default: '1'
      }).then(result => {
        if (result.cancelled || !result.value) return;
        
        const index = parseInt(result.value) - 1;
        if (isNaN(index) || index < 0 || index >= jsonFiles.length) {
          return context.executeInstruction(400, {
            title: 'Error',
            message: 'Invalid selection',
            type: 'error'
          });
        }
        
        const file = jsonFiles[index];
        
        context.executeInstruction(401, {
          title: 'Confirm Import',
          message: \`Import from \${file.name}? This will overwrite current data.\`
        }).then(confirmResult => {
          if (!confirmResult.confirmed) return;
          
          const importResult = context.executeInstruction(304, { 
            path: file.path 
          });
          
          if (importResult.success) {
            context.executeInstruction(400, {
              title: 'Success',
              message: importResult.message,
              type: 'success'
            });
            context.executeInstruction(200, {refresh: true});
          } else {
            context.executeInstruction(400, {
              title: 'Error',
              message: importResult.message,
              type: 'error'
            });
          }
        });
      });
    }
    
    // Start the application
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize the system
      context.executeInstruction(100, {restore: true});
      
      // Create the UI
      context.executeInstruction(200, {});
      
      // Show welcome notification
      context.executeInstruction(400, {
        title: "System Ready",
        message: "Token Relation System initialized",
        type: "success"
      });
    });
  </script>
</body>
</html>
`}

# Create a launcher that opens the Token System in a new tab
11 {"code": "
  // Create a blob URL for the HTML content
  const htmlBlob = new Blob([context.htmlContent], {type: 'text/html'});
  const blobUrl = URL.createObjectURL(htmlBlob);
  
  // Create a launcher button in the current page
  const launcher = document.createElement('div');
  launcher.style.padding = '20px';
  launcher.style.textAlign = 'center';
  
  const title = document.createElement('h2');
  title.textContent = 'Token Relation System';
  launcher.appendChild(title);
  
  const description = document.createElement('p');
  description.textContent = 'Click the button below to launch the Token Relation System in a new tab.';
  description.style.marginBottom = '20px';
  launcher.appendChild(description);
  
  const button = document.createElement('button');
  button.textContent = 'Launch Token Relation System';
  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.cursor = 'pointer';
  button.style.backgroundColor = '#3b82f6';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.onclick = () => window.open(blobUrl, '_blank');
  
  launcher.appendChild(button);
  document.body.appendChild(launcher);
  
  return { success: true, message: 'Token Relation System Launcher created', url: blobUrl };
"}

# Use our local app object to show a notification
400 {"title": "Token Relation System", "message": "Launcher ready. Click the button to open in a new tab.", "type": "success"}
