class GeneratorAgent {
  constructor() {
    this.allowedComponents = [
      'Button', 'Card', 'Input', 'Table', 'Modal', 
      'Sidebar', 'Navbar', 'Chart'
    ];
  }

  /**
   * Convert structured plan into valid React functional component code
   * @param {Object} plan - Structured plan from PlannerAgent
   * @param {string} existingCode - Optional existing code for incremental updates
   * @returns {string} React component code
   */
  async generate(plan, existingCode = null) {
    try {
      console.log('GeneratorAgent: Generating code from plan');
      
      let code;
      if (existingCode) {
        // Incremental update - modify existing code
        console.log('GeneratorAgent: Performing incremental update');
        code = this.modifyExistingCode(plan, existingCode);
      } else {
        // New generation - create fresh code
        console.log('GeneratorAgent: Creating new code');
        code = this.generateReactComponent(plan);
      }
      
      // Validate generated code
      this.validateGeneratedCode(code);
      
      console.log('GeneratorAgent: Code generated successfully');
      return code;
      
    } catch (error) {
      console.error('GeneratorAgent: Error:', error);
      throw new Error(`Code generation failed: ${error.message}`);
    }
  }

  /**
   * Modify existing code incrementally based on the new plan
   * This preserves unchanged parts of the code and only updates what changed
   */
  modifyExistingCode(plan, existingCode) {
    try {
      // Parse the existing component structure from the code
      const existingStructure = this.parseComponentStructure(existingCode);
      
      // Compare with new plan and generate targeted modifications
      const modifications = this.diffAndModify(existingStructure, plan);
      
      if (modifications.length === 0) {
        // No changes needed
        return existingCode;
      }
      
      // Apply targeted modifications to existing code
      let modifiedCode = existingCode;
      
      modifications.forEach(mod => {
        switch (mod.type) {
          case 'ADD_COMPONENT':
            modifiedCode = this.addComponentToCode(modifiedCode, mod);
            break;
          case 'REMOVE_COMPONENT':
            modifiedCode = this.removeComponentFromCode(modifiedCode, mod);
            break;
          case 'UPDATE_PROPS':
            modifiedCode = this.updateComponentProps(modifiedCode, mod);
            break;
          case 'UPDATE_CHILDREN':
            modifiedCode = this.updateComponentChildren(modifiedCode, mod);
            break;
          case 'MOVE_COMPONENT':
            modifiedCode = this.moveComponentInCode(modifiedCode, mod);
            break;
          case 'REPLACE_COMPONENT':
            modifiedCode = this.replaceComponentInCode(modifiedCode, mod);
            break;
        }
      });
      
      return modifiedCode;
      
    } catch (error) {
      console.error('GeneratorAgent: Incremental update failed, falling back to full regeneration', error);
      // Fall back to full regeneration if incremental update fails
      return this.generateReactComponent(plan);
    }
  }

  /**
   * Parse component structure from existing code
   */
  parseComponentStructure(code) {
    const structure = {
      components: []
    };
    
    // Extract component tree structure
    const componentRegex = /<(\w+)([^>]*)>(.*?)<\/\1>/gs;
    let match;
    
    while ((match = componentRegex.exec(code)) !== null) {
      const [fullMatch, type, propsString, childrenContent] = match;
      
      // Parse props
      const props = this.parsePropsString(propsString);
      
      // Recursively parse children
      const children = this.parseComponentStructure(childrenContent).components;
      
      structure.components.push({
        type,
        props,
        children,
        fullMatch,
        position: match.index
      });
    }
    
    return structure;
  }

  /**
   * Parse props from JSX attribute string
   */
  parsePropsString(propsString) {
    const props = {};
    
    // Match prop="value" pattern
    const propRegex = /(\w+)=["']([^"']*)["']/g;
    let match;
    while ((match = propRegex.exec(propsString)) !== null) {
      props[match[1]] = match[2];
    }
    
    // Match prop={value} pattern
    const propObjRegex = /(\w+)=\{([^}]+)\}/g;
    while ((match = propObjRegex.exec(propsString)) !== null) {
      try {
        // Try to parse as JSON
        props[match[1]] = JSON.parse(match[2]);
      } catch {
        // Keep as string
        props[match[1]] = match[2];
      }
    }
    
    return props;
  }

  /**
   * Compare existing structure with new plan and generate diff
   */
  diffAndModify(existingStructure, newPlan) {
    const modifications = [];
    
    // Track existing components by type and props
    const existingComponents = new Map();
    existingStructure.components.forEach((comp, index) => {
      const key = `${comp.type}_${index}`;
      existingComponents.set(key, comp);
    });
    
    // Compare with new plan and generate modifications
    newPlan.components.forEach((newComp, index) => {
      const existingComp = this.findMatchingComponent(existingStructure.components, newComp);
      
      if (!existingComp) {
        // Component doesn't exist - add it
        modifications.push({
          type: 'ADD_COMPONENT',
          component: newComp,
          position: this.findInsertPosition(existingStructure, newComp)
        });
      } else {
        // Component exists - check for updates
        const propChanges = this.compareProps(existingComp.props, newComp.props);
        if (propChanges.length > 0) {
          modifications.push({
            type: 'UPDATE_PROPS',
            component: existingComp,
            changes: propChanges
          });
        }
        
        // Check children changes
        if (JSON.stringify(existingComp.children) !== JSON.stringify(newComp.children)) {
          modifications.push({
            type: 'UPDATE_CHILDREN',
            component: existingComp,
            children: newComp.children
          });
        }
      }
    });
    
    // Check for components that need to be removed
    existingStructure.components.forEach(existingComp => {
      const existsInPlan = newPlan.components.some(newComp => 
        this.componentsAreSimilar(existingComp, newComp)
      );
      
      if (!existsInPlan) {
        modifications.push({
          type: 'REMOVE_COMPONENT',
          component: existingComp
        });
      }
    });
    
    // Handle plan.modifications array from PlannerAgent
    if (newPlan.modifications && Array.isArray(newPlan.modifications)) {
      newPlan.modifications.forEach(mod => {
        // These are already specific operations, we can map them directly
        const operation = this.mapModificationToOperation(mod);
        if (operation) {
          modifications.push(operation);
        }
      });
    }
    
    return modifications;
  }

  /**
   * Find a matching component in existing structure
   */
  findMatchingComponent(existingComponents, newComponent) {
    return existingComponents.find(comp => 
      comp.type === newComponent.type && 
      this.componentsAreSimilar(comp, newComponent)
    );
  }

  /**
   * Check if two components are similar (type and key props match)
   */
  componentsAreSimilar(comp1, comp2) {
    if (comp1.type !== comp2.type) return false;
    
    // Check key identifying props
    const keyProps = ['title', 'label', 'placeholder', 'children'];
    for (const prop of keyProps) {
      if (comp1.props?.[prop] && comp2.props?.[prop]) {
        if (comp1.props[prop] === comp2.props[prop]) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Compare props and return changes
   */
  compareProps(oldProps, newProps) {
    const changes = [];
    
    // Check for added or modified props
    Object.entries(newProps).forEach(([key, value]) => {
      if (!oldProps[key] || oldProps[key] !== value) {
        changes.push({
          type: 'SET',
          prop: key,
          value: value
        });
      }
    });
    
    // Check for removed props
    Object.keys(oldProps).forEach(key => {
      if (!newProps.hasOwnProperty(key)) {
        changes.push({
          type: 'REMOVE',
          prop: key
        });
      }
    });
    
    return changes;
  }

  /**
   * Find position to insert a new component
   */
  findInsertPosition(structure, component) {
    // Logic to determine where to insert based on component type and layout
    if (component.type === 'Navbar') {
      return { at: 'start', parent: 'root' };
    } else if (component.type === 'Sidebar') {
      return { at: 'after', sibling: 'Navbar', parent: 'root' };
    } else {
      return { at: 'end', parent: 'root' };
    }
  }

  /**
   * Map human-readable modification to code operation
   */
  mapModificationToOperation(mod) {
    if (typeof mod === 'string') {
      if (mod.includes('Added button')) {
        const buttonText = mod.match(/Added button "([^"]+)"/)?.[1] || 'New Button';
        return {
          type: 'ADD_COMPONENT',
          component: {
            type: 'Button',
            props: { variant: 'primary', children: buttonText }
          }
        };
      } else if (mod.includes('Added input')) {
        const fieldName = mod.match(/Added input field "([^"]+)"/)?.[1] || 'New Field';
        return {
          type: 'ADD_COMPONENT',
          component: {
            type: 'Input',
            props: { placeholder: `Enter ${fieldName}`, label: fieldName }
          }
        };
      } else if (mod.includes('Changed button label')) {
        const newLabel = mod.match(/Changed button label to "([^"]+)"/)?.[1];
        return {
          type: 'UPDATE_PROPS',
          component: { type: 'Button' },
          changes: [{ type: 'SET', prop: 'children', value: newLabel }]
        };
      } else if (mod.includes('Removed button')) {
        return {
          type: 'REMOVE_COMPONENT',
          component: { type: 'Button' }
        };
      }
    }
    return null;
  }

  /**
   * Add a new component to existing code
   */
  addComponentToCode(code, modification) {
    const { component } = modification;
    const componentJSX = this.generateJSX([component], 2);
    
    // Find appropriate insertion point
    if (component.type === 'Navbar') {
      // Insert at the beginning
      return code.replace(
        /return \(\s*(\n)/,
        `return (\n  ${componentJSX}$1`
      );
    } else if (component.type === 'Sidebar') {
      // Insert after Navbar
      return code.replace(
        /(<Navbar[^>]*>\s*<\/Navbar>\s*)/,
        `$1  ${componentJSX}\n  `
      );
    } else {
      // Insert at the end
      return code.replace(
        /(\s*)\);?\s*}\s*$/,
        `\n  ${componentJSX}$1`
      );
    }
  }

  /**
   * Remove a component from existing code
   */
  removeComponentFromCode(code, modification) {
    const { component } = modification;
    
    if (component.type) {
      const regex = new RegExp(`\\s*<${component.type}[^>]*>.*?</${component.type}>\\s*\\n?`, 'g');
      return code.replace(regex, '');
    }
    
    return code;
  }

  /**
   * Update component props in existing code
   */
  updateComponentProps(code, modification) {
    const { component, changes } = modification;
    
    let modifiedCode = code;
    
    changes.forEach(change => {
      if (change.type === 'SET') {
        // Find the component tag and update the prop
        const regex = new RegExp(`(<${component.type})([^>]*)(>)`);
        modifiedCode = modifiedCode.replace(regex, (match, openTag, props, closeTag) => {
          // Remove existing prop if it exists
          const propRegex = new RegExp(`\\s+${change.prop}=["'][^"']*["']|\\s+${change.prop}={[^}]+}`, 'g');
          props = props.replace(propRegex, '');
          
          // Add new prop value
          const propValue = typeof change.value === 'string' 
            ? ` "${change.value}"`
            : ` {${JSON.stringify(change.value)}}`;
          
          return `${openTag} ${change.prop}=${propValue}${props}${closeTag}`;
        });
      } else if (change.type === 'REMOVE') {
        // Remove the prop
        const regex = new RegExp(`(<${component.type})([^>]*)(>)`);
        modifiedCode = modifiedCode.replace(regex, (match, openTag, props, closeTag) => {
          const propRegex = new RegExp(`\\s+${change.prop}=["'][^"']*["']|\\s+${change.prop}={[^}]+}`, 'g');
          props = props.replace(propRegex, '');
          return `${openTag}${props}${closeTag}`;
        });
      }
    });
    
    return modifiedCode;
  }

  /**
   * Update component children in existing code
   */
  updateComponentChildren(code, modification) {
    const { component, children } = modification;
    const childrenJSX = this.generateJSX(children, 4);
    
    const regex = new RegExp(`(<${component.type}[^>]*>)([\\s\\S]*?)(</${component.type}>)`);
    
    return code.replace(regex, (match, openTag, oldChildren, closeTag) => {
      if (children.length > 0) {
        return `${openTag}\n${childrenJSX}\n  ${closeTag}`;
      } else {
        return `${openTag}${closeTag}`;
      }
    });
  }

  /**
   * Move a component within the code
   */
  moveComponentInCode(code, modification) {
    // First remove from old location
    let modifiedCode = this.removeComponentFromCode(code, modification);
    
    // Then add to new location
    modifiedCode = this.addComponentToCode(modifiedCode, modification);
    
    return modifiedCode;
  }

  /**
   * Replace one component with another
   */
  replaceComponentInCode(code, modification) {
    const { oldComponent, newComponent } = modification;
    const newComponentJSX = this.generateJSX([newComponent], 2);
    
    const regex = new RegExp(`<${oldComponent.type}[^>]*>.*?</${oldComponent.type}>\\s*\\n?`, 'g');
    
    return code.replace(regex, newComponentJSX + '\n');
  }

  /**
   * Generate React component code with strict component library usage
   */
  generateReactComponent(plan) {
    const componentName = 'GeneratedUI';
    
    let imports = `import React from 'react';\n`;
    imports += `import { ${this.getAllowedComponentsImport()} } from '@/components/ui';\n\n`;
    
    let componentCode = `export const ${componentName} = () => {\n`;
    componentCode += `  return (\n`;
    componentCode += this.generateJSX(plan.components, 4);
    componentCode += `  );\n`;
    componentCode += `};\n\n`;
    componentCode += `export default ${componentName};`;
    
    return imports + componentCode;
  }

  /**
   * Generate JSX from component tree
   */
  generateJSX(components, indentLevel = 2) {
    if (!components || components.length === 0) return '';
    
    const indent = ' '.repeat(indentLevel);
    let jsx = '';
    
    components.forEach((comp, index) => {
      const props = this.formatProps(comp.props);
      const childrenJSX = comp.children && comp.children.length > 0
        ? `\n${this.generateJSX(comp.children, indentLevel + 2)}${indent}`
        : '';
      
      jsx += `${indent}<${comp.type}${props}>\n`;
      jsx += childrenJSX;
      jsx += `${indent}</${comp.type}>\n`;
    });
    
    return jsx;
  }

  /**
   * Format component props as JSX attributes
   */
  formatProps(props) {
    if (!props || Object.keys(props).length === 0) return '';
    
    return ' ' + Object.entries(props)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        }
        if (typeof value === 'boolean') {
          return value ? key : '';
        }
        if (typeof value === 'object') {
          return `${key}={${JSON.stringify(value)}}`;
        }
        return `${key}={${value}}`;
      })
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Get import string for allowed components
   */
  getAllowedComponentsImport() {
    return this.allowedComponents.join(', ');
  }

  /**
   * Validate generated code for security and compliance
   */
  validateGeneratedCode(code) {
    // Check for inline styles
    if (code.includes('style={') || code.includes('styles=')) {
      throw new Error('Generated code contains inline styles');
    }
    
    // Check for disallowed HTML elements
    const disallowedElements = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article'];
    disallowedElements.forEach(el => {
      if (code.includes(`<${el}`) || code.includes(`<${el}>`)) {
        throw new Error(`Generated code contains disallowed HTML element: ${el}`);
      }
    });
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      'dangerouslySetInnerHTML',
      'eval(',
      'Function(',
      'document.write',
      'innerHTML'
    ];
    
    dangerousPatterns.forEach(pattern => {
      if (code.includes(pattern)) {
        throw new Error(`Generated code contains dangerous pattern: ${pattern}`);
      }
    });
  }
}

export default GeneratorAgent;