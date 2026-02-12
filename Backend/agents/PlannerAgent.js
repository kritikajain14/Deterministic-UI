class PlannerAgent {
  constructor() {
    this.allowedComponents = [
      'Button', 'Card', 'Input', 'Table', 'Modal', 
      'Sidebar', 'Navbar', 'Chart'
    ];
  }

  /**
   * Converts natural language UI intent into structured JSON plan
   * @param {string} userIntent - Natural language description
   * @param {Object} context - Previous plan and modification instructions
   * @returns {Object} Structured plan (modified incrementally if context exists)
   */
  async plan(userIntent, context = null) {
    try {
      console.log('PlannerAgent: Processing intent:', userIntent);
      
      let plan;
      if (context?.previousPlan) {
        // Incremental modification - modify existing plan
        console.log('PlannerAgent: Modifying existing plan');
        plan = await this.modifyExistingPlan(userIntent, context.previousPlan);
      } else {
        // New generation - create fresh plan
        console.log('PlannerAgent: Creating new plan');
        plan = this.mockLLMPlanning(userIntent);
      }
      
      // Validate plan structure and component whitelist
      const validatedPlan = this.validatePlan(plan);
      
      console.log('PlannerAgent: Plan generated successfully');
      return validatedPlan;
      
    } catch (error) {
      console.error('PlannerAgent: Error:', error);
      throw new Error(`Planning failed: ${error.message}`);
    }
  }

  /**
   * Modify existing plan based on modification intent
   * This is the key method for incremental editing
   */
  async modifyExistingPlan(modificationIntent, existingPlan) {
    const intent = modificationIntent.toLowerCase();
    
    // Deep clone the existing plan to avoid mutations
    const modifiedPlan = JSON.parse(JSON.stringify(existingPlan));
    
    // Track modifications for explanation
    modifiedPlan.modifications = [];
    
    // Handle different types of modifications
    if (intent.includes('add')) {
      this.handleAddOperation(modifiedPlan, intent);
    } else if (intent.includes('remove') || intent.includes('delete')) {
      this.handleRemoveOperation(modifiedPlan, intent);
    } else if (intent.includes('change') || intent.includes('modify') || intent.includes('update')) {
      this.handleModifyOperation(modifiedPlan, intent);
    } else if (intent.includes('move')) {
      this.handleMoveOperation(modifiedPlan, intent);
    } else if (intent.includes('replace')) {
      this.handleReplaceOperation(modifiedPlan, intent);
    } else if (intent.includes('rename') || intent.includes('label')) {
      this.handleRenameOperation(modifiedPlan, intent);
    }
    
    return modifiedPlan;
  }

  /**
   * Handle adding new components to existing plan
   */
  handleAddOperation(plan, intent) {
    const modifications = [];
    
    if (intent.includes('button')) {
      // Find where to add the button
      const targetComponent = this.findComponentByType(plan.components, 'Card') || 
                            this.findComponentByType(plan.components, 'Navbar');
      
      if (targetComponent) {
        const newButton = {
          type: 'Button',
          props: { 
            variant: 'primary', 
            children: this.extractButtonLabel(intent) || 'New Button' 
          },
          children: []
        };
        
        if (targetComponent.children) {
          targetComponent.children.push(newButton);
        } else {
          targetComponent.children = [newButton];
        }
        
        modifications.push(`Added button "${newButton.props.children}"`);
      }
    }
    
    if (intent.includes('input') || intent.includes('field')) {
      const formComponent = this.findComponentByType(plan.components, 'Card');
      if (formComponent) {
        const newInput = {
          type: 'Input',
          props: { 
            placeholder: this.extractPlaceholder(intent) || 'Enter value',
            label: this.extractLabel(intent) || 'New Field'
          },
          children: []
        };
        
        if (formComponent.children) {
          formComponent.children.push(newInput);
        } else {
          formComponent.children = [newInput];
        }
        
        modifications.push(`Added input field "${newInput.props.label}"`);
      }
    }
    
    if (intent.includes('table')) {
      const newTable = {
        type: 'Table',
        props: { 
          columns: ['Column 1', 'Column 2', 'Column 3'],
          data: []
        },
        children: []
      };
      
      // Add table to appropriate location
      if (plan.layout === 'dashboard') {
        plan.components.push(newTable);
      } else {
        const cardComponent = this.findComponentByType(plan.components, 'Card');
        if (cardComponent) {
          cardComponent.children.push(newTable);
        } else {
          plan.components.push(newTable);
        }
      }
      
      modifications.push('Added table component');
    }
    
    if (intent.includes('chart') || intent.includes('graph')) {
      const newChart = {
        type: 'Chart',
        props: { 
          type: this.extractChartType(intent),
          title: this.extractChartTitle(intent),
          data: []
        },
        children: []
      };
      
      plan.components.push(newChart);
      modifications.push(`Added ${newChart.props.type} chart`);
    }
    
    if (intent.includes('modal') || intent.includes('dialog')) {
      const newModal = {
        type: 'Modal',
        props: { 
          isOpen: false, 
          title: this.extractModalTitle(intent) || 'Modal Dialog'
        },
        children: [
          {
            type: 'Card',
            props: {},
            children: [
              {
                type: 'Input',
                props: { placeholder: 'Enter details', label: 'Details' },
                children: []
              },
              {
                type: 'Button',
                props: { variant: 'primary', children: 'Submit' },
                children: []
              }
            ]
          }
        ]
      };
      
      // Add button to open modal
      const openButton = {
        type: 'Button',
        props: { variant: 'primary', children: 'Open Modal' },
        children: []
      };
      
      plan.components.push(openButton);
      plan.components.push(newModal);
      modifications.push('Added modal dialog with open button');
    }
    
    plan.modifications = modifications;
  }

  /**
   * Handle removing components from existing plan
   */
  handleRemoveOperation(plan, intent) {
    const modifications = [];
    
    if (intent.includes('button')) {
      const buttonIndex = this.findComponentIndexByType(plan.components, 'Button');
      if (buttonIndex !== -1) {
        const removed = plan.components.splice(buttonIndex, 1);
        modifications.push(`Removed button`);
      }
    }
    
    if (intent.includes('table')) {
      const tableIndex = this.findComponentIndexByType(plan.components, 'Table');
      if (tableIndex !== -1) {
        const removed = plan.components.splice(tableIndex, 1);
        modifications.push(`Removed table`);
      }
    }
    
    if (intent.includes('chart')) {
      const chartIndex = this.findComponentIndexByType(plan.components, 'Chart');
      if (chartIndex !== -1) {
        const removed = plan.components.splice(chartIndex, 1);
        modifications.push(`Removed chart`);
      }
    }
    
    if (intent.includes('input') || intent.includes('field')) {
      // Recursively search for and remove input fields
      this.removeComponentsByType(plan.components, 'Input');
      modifications.push(`Removed input fields`);
    }
    
    if (intent.includes('modal')) {
      const modalIndex = this.findComponentIndexByType(plan.components, 'Modal');
      if (modalIndex !== -1) {
        const removed = plan.components.splice(modalIndex, 1);
        modifications.push(`Removed modal`);
      }
    }
    
    if (intent.includes('all') || intent.includes('everything')) {
      // Reset to minimal layout
      plan.components = [
        {
          type: 'Card',
          props: { title: 'Empty State' },
          children: [
            {
              type: 'Button',
              props: { variant: 'primary', children: 'Start Adding' },
              children: []
            }
          ]
        }
      ];
      modifications.push(`Reset to empty state`);
    }
    
    plan.modifications = modifications;
  }

  /**
   * Handle modifying existing components (props, content, etc.)
   */
  handleModifyOperation(plan, intent) {
    const modifications = [];
    
    if (intent.includes('button')) {
      const buttons = this.findAllComponentsByType(plan.components, 'Button');
      if (buttons.length > 0) {
        const button = buttons[0];
        const newLabel = this.extractNewLabel(intent);
        if (newLabel) {
          button.props.children = newLabel;
          modifications.push(`Changed button label to "${newLabel}"`);
        }
        
        if (intent.includes('primary')) {
          button.props.variant = 'primary';
          modifications.push(`Changed button to primary variant`);
        } else if (intent.includes('secondary')) {
          button.props.variant = 'secondary';
          modifications.push(`Changed button to secondary variant`);
        } else if (intent.includes('outline')) {
          button.props.variant = 'outline';
          modifications.push(`Changed button to outline variant`);
        }
      }
    }
    
    if (intent.includes('title') || intent.includes('heading')) {
      const cards = this.findAllComponentsByType(plan.components, 'Card');
      cards.forEach(card => {
        if (card.props) {
          const newTitle = this.extractNewTitle(intent);
          if (newTitle) {
            card.props.title = newTitle;
            modifications.push(`Changed card title to "${newTitle}"`);
          }
        }
      });
      
      const navbars = this.findAllComponentsByType(plan.components, 'Navbar');
      navbars.forEach(navbar => {
        if (navbar.props) {
          const newTitle = this.extractNewTitle(intent);
          if (newTitle) {
            navbar.props.title = newTitle;
            modifications.push(`Changed navbar title to "${newTitle}"`);
          }
        }
      });
    }
    
    if (intent.includes('table')) {
      const tables = this.findAllComponentsByType(plan.components, 'Table');
      tables.forEach(table => {
        if (intent.includes('column')) {
          const newColumns = this.extractTableColumns(intent);
          if (newColumns.length > 0) {
            table.props.columns = newColumns;
            modifications.push(`Updated table columns: ${newColumns.join(', ')}`);
          }
        }
      });
    }
    
    if (intent.includes('chart') && intent.includes('type')) {
      const charts = this.findAllComponentsByType(plan.components, 'Chart');
      charts.forEach(chart => {
        const newType = this.extractChartType(intent);
        if (newType) {
          chart.props.type = newType;
          modifications.push(`Changed chart type to ${newType}`);
        }
      });
    }
    
    if (intent.includes('placeholder')) {
      const inputs = this.findAllComponentsByType(plan.components, 'Input');
      inputs.forEach(input => {
        const newPlaceholder = this.extractNewPlaceholder(intent);
        if (newPlaceholder) {
          input.props.placeholder = newPlaceholder;
          modifications.push(`Updated input placeholder to "${newPlaceholder}"`);
        }
      });
    }
    
    plan.modifications = modifications;
  }

  /**
   * Handle moving components within the layout
   */
  handleMoveOperation(plan, intent) {
    const modifications = [];
    
    if (intent.includes('button')) {
      const button = this.findComponentByType(plan.components, 'Button');
      if (button) {
        // Remove button from current location
        this.removeComponent(plan.components, button);
        
        // Find target location (e.g., inside a card, navbar, etc.)
        if (intent.includes('navbar') || intent.includes('header')) {
          const navbar = this.findComponentByType(plan.components, 'Navbar');
          if (navbar) {
            navbar.children = navbar.children || [];
            navbar.children.push(button);
            modifications.push('Moved button to navbar');
          }
        } else if (intent.includes('sidebar')) {
          const sidebar = this.findComponentByType(plan.components, 'Sidebar');
          if (sidebar) {
            sidebar.children = sidebar.children || [];
            sidebar.children.push(button);
            modifications.push('Moved button to sidebar');
          }
        } else if (intent.includes('card')) {
          const card = this.findComponentByType(plan.components, 'Card');
          if (card) {
            card.children = card.children || [];
            card.children.push(button);
            modifications.push('Moved button to card');
          }
        }
      }
    }
    
    plan.modifications = modifications;
  }

  /**
   * Handle replacing one component with another
   */
  handleReplaceOperation(plan, intent) {
    const modifications = [];
    
    if (intent.includes('table') && intent.includes('chart')) {
      const tableIndex = this.findComponentIndexByType(plan.components, 'Table');
      if (tableIndex !== -1) {
        plan.components[tableIndex] = {
          type: 'Chart',
          props: { 
            type: 'bar', 
            title: 'Data Visualization',
            data: []
          },
          children: []
        };
        modifications.push('Replaced table with chart');
      }
    } else if (intent.includes('chart') && intent.includes('table')) {
      const chartIndex = this.findComponentIndexByType(plan.components, 'Chart');
      if (chartIndex !== -1) {
        plan.components[chartIndex] = {
          type: 'Table',
          props: { 
            columns: ['Data 1', 'Data 2'],
            data: []
          },
          children: []
        };
        modifications.push('Replaced chart with table');
      }
    }
    
    plan.modifications = modifications;
  }

  /**
   * Handle renaming labels and titles
   */
  handleRenameOperation(plan, intent) {
    const modifications = [];
    const newName = this.extractNewName(intent);
    
    if (newName) {
      if (intent.includes('button')) {
        const buttons = this.findAllComponentsByType(plan.components, 'Button');
        buttons.forEach(button => {
          button.props.children = newName;
        });
        modifications.push(`Renamed button to "${newName}"`);
      }
      
      if (intent.includes('title')) {
        const cards = this.findAllComponentsByType(plan.components, 'Card');
        cards.forEach(card => {
          if (card.props) {
            card.props.title = newName;
          }
        });
        
        const navbars = this.findAllComponentsByType(plan.components, 'Navbar');
        navbars.forEach(navbar => {
          if (navbar.props) {
            navbar.props.title = newName;
          }
        });
        
        modifications.push(`Renamed title to "${newName}"`);
      }
      
      if (intent.includes('label') || intent.includes('field')) {
        const inputs = this.findAllComponentsByType(plan.components, 'Input');
        inputs.forEach(input => {
          if (input.props) {
            input.props.label = newName;
          }
        });
        modifications.push(`Renamed field label to "${newName}"`);
      }
    }
    
    plan.modifications = modifications;
  }

  // ============ Helper Methods ============

  findComponentByType(components, type) {
    for (const comp of components) {
      if (comp.type === type) {
        return comp;
      }
      if (comp.children && comp.children.length > 0) {
        const found = this.findComponentByType(comp.children, type);
        if (found) return found;
      }
    }
    return null;
  }

  findComponentIndexByType(components, type) {
    for (let i = 0; i < components.length; i++) {
      if (components[i].type === type) {
        return i;
      }
    }
    return -1;
  }

  findAllComponentsByType(components, type, result = []) {
    for (const comp of components) {
      if (comp.type === type) {
        result.push(comp);
      }
      if (comp.children && comp.children.length > 0) {
        this.findAllComponentsByType(comp.children, type, result);
      }
    }
    return result;
  }

  removeComponent(components, targetComponent) {
    for (let i = 0; i < components.length; i++) {
      if (components[i] === targetComponent) {
        components.splice(i, 1);
        return true;
      }
      if (components[i].children && components[i].children.length > 0) {
        if (this.removeComponent(components[i].children, targetComponent)) {
          return true;
        }
      }
    }
    return false;
  }

  removeComponentsByType(components, type) {
    for (let i = components.length - 1; i >= 0; i--) {
      if (components[i].type === type) {
        components.splice(i, 1);
      } else if (components[i].children && components[i].children.length > 0) {
        this.removeComponentsByType(components[i].children, type);
      }
    }
  }

  // ============ Text Extraction Helpers ============

  extractButtonLabel(intent) {
    const patterns = [
      /button (?:called|labeled|named|text)? ["']([^"']+)["']/i,
      /button ["']([^"']+)["']/i,
      /"(.*?)".*?button/i,
      /add.*?button.*?(?:called|named|with text)? ["']([^"']+)["']/i,
      /button.*?that says ["']([^"']+)["']/i
    ];
    
    for (const pattern of patterns) {
      const match = intent.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  extractPlaceholder(intent) {
    const patterns = [
      /placeholder ["']([^"']+)["']/i,
      /placeholder (?:text)? ["']([^"']+)["']/i,
      /with placeholder ["']([^"']+)["']/i
    ];
    
    for (const pattern of patterns) {
      const match = intent.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  extractLabel(intent) {
    const patterns = [
      /label(?:led)? ["']([^"']+)["']/i,
      /called ["']([^"']+)["']/i,
      /named ["']([^"']+)["']/i,
      /field ["']([^"']+)["']/i
    ];
    
    for (const pattern of patterns) {
      const match = intent.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  extractChartType(intent) {
    if (intent.includes('bar')) return 'bar';
    if (intent.includes('line')) return 'line';
    if (intent.includes('pie')) return 'pie';
    if (intent.includes('area')) return 'area';
    if (intent.includes('scatter')) return 'scatter';
    return 'bar';
  }

  extractChartTitle(intent) {
    const patterns = [
      /chart (?:called|titled|named) ["']([^"']+)["']/i,
      /title ["']([^"']+)["']/i,
      /called ["']([^"']+)["'].*?chart/i
    ];
    
    for (const pattern of patterns) {
      const match = intent.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  extractModalTitle(intent) {
    const patterns = [
      /modal (?:called|titled|named) ["']([^"']+)["']/i,
      /dialog (?:called|titled|named) ["']([^"']+)["']/i,
      /title ["']([^"']+)["']/i
    ];
    
    for (const pattern of patterns) {
      const match = intent.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  extractNewLabel(intent) {
    const patterns = [
      /(?:change|update|modify).*?(?:label|text|name) (?:to )?["']([^"']+)["']/i,
      /(?:change|update|modify).*?(?:button|element).*?(?:to )?["']([^"']+)["']/i,
      /to ["']([^"']+)["']/i
    ];
    
    for (const pattern of patterns) {
      const match = intent.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  extractNewTitle(intent) {
    const patterns = [
      /(?:change|update|modify).*?title (?:to )?["']([^"']+)["']/i,
      /title (?:to )?["']([^"']+)["']/i,
      /rename .*?to ["']([^"']+)["']/i
    ];
    
    for (const pattern of patterns) {
      const match = intent.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  extractTableColumns(intent) {
    const columns = [];
    
    // Try to extract quoted column names
    const quotePattern = /["']([^"']+)["']/g;
    let match;
    while ((match = quotePattern.exec(intent)) !== null) {
      columns.push(match[1]);
    }
    
    // If no quoted columns, try common patterns
    if (columns.length === 0) {
      if (intent.includes('name')) columns.push('Name');
      if (intent.includes('email')) columns.push('Email');
      if (intent.includes('status')) columns.push('Status');
      if (intent.includes('date')) columns.push('Date');
      if (intent.includes('amount') || intent.includes('price')) columns.push('Amount');
    }
    
    return columns.length > 0 ? columns : ['Name', 'Value', 'Status'];
  }

  extractNewPlaceholder(intent) {
    const patterns = [
      /placeholder (?:to )?["']([^"']+)["']/i,
      /placeholder ["']([^"']+)["']/i,
      /to ["']([^"']+)["'](?=.*?placeholder)/i
    ];
    
    for (const pattern of patterns) {
      const match = intent.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  extractNewName(intent) {
    const patterns = [
      /rename.*?to ["']([^"']+)["']/i,
      /to ["']([^"']+)["'](?=.*?rename)/i,
      /called ["']([^"']+)["']/i,
      /named ["']([^"']+)["']/i
    ];
    
    for (const pattern of patterns) {
      const match = intent.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  /**
   * Mock LLM call for new plan generation
   */
  mockLLMPlanning(intent) {
    // ... existing mockLLMPlanning code ...
    // (Keep the same as before for new generations)
    const intent_lower = intent.toLowerCase();
    
    let layout = 'default';
    const components = [];

    if (intent_lower.includes('dashboard') || intent_lower.includes('analytics')) {
      layout = 'dashboard';
      components.push(
        { type: 'Navbar', props: { title: 'Analytics Dashboard' }, children: [] },
        { type: 'Sidebar', props: { collapsed: false }, children: [] },
        { type: 'Card', props: { title: 'Revenue Overview' }, children: [] },
        { type: 'Chart', props: { type: 'line', dataKey: 'revenue' }, children: [] },
        { type: 'Table', props: { columns: ['Metric', 'Value', 'Change'] }, children: [] }
      );
    } else if (intent_lower.includes('form') || intent_lower.includes('input')) {
      layout = 'form';
      components.push(
        { type: 'Card', props: { title: 'Input Form' }, children: [
          { type: 'Input', props: { placeholder: 'Enter name', label: 'Name' }, children: [] },
          { type: 'Input', props: { placeholder: 'Enter email', type: 'email', label: 'Email' }, children: [] },
          { type: 'Button', props: { variant: 'primary', children: 'Submit' }, children: [] }
        ]}
      );
    } else if (intent_lower.includes('modal') || intent_lower.includes('dialog')) {
      layout = 'modal-view';
      components.push(
        { type: 'Button', props: { variant: 'primary', children: 'Open Modal' }, children: [] },
        { type: 'Modal', props: { isOpen: false, title: 'Dialog' }, children: [
          { type: 'Card', props: {}, children: [
            { type: 'Input', props: { placeholder: 'Enter details' }, children: [] }
          ]}
        ]}
      );
    } else {
      layout = 'default';
      components.push(
        { type: 'Navbar', props: { title: 'Application' }, children: [] },
        { type: 'Card', props: { title: 'Welcome' }, children: [
          { type: 'Button', props: { variant: 'primary', children: 'Get Started' }, children: [] }
        ]}
      );
    }

    return {
      layout,
      components,
      modifications: ''
    };
  }

  /**
   * Validate plan against whitelist and structure requirements
   */
  validatePlan(plan) {
    if (!plan.layout || typeof plan.layout !== 'string') {
      throw new Error('Invalid plan: missing layout');
    }

    if (!Array.isArray(plan.components)) {
      throw new Error('Invalid plan: components must be an array');
    }

    // Recursively validate components
    const validateComponent = (comp) => {
      if (!this.allowedComponents.includes(comp.type)) {
        throw new Error(`Invalid component type: ${comp.type}. Allowed: ${this.allowedComponents.join(', ')}`);
      }

      if (comp.props) {
        // Check for inline styles
        if (comp.props.style || comp.props.styles) {
          throw new Error('Inline styles are not allowed');
        }
      }

      if (Array.isArray(comp.children)) {
        comp.children.forEach(child => {
          if (typeof child === 'object' && child.type) {
            validateComponent(child);
          }
        });
      }
    };

    plan.components.forEach(validateComponent);

    return plan;
  }
}

export default PlannerAgent;