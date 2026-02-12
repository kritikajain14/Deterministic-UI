
class ExplainerAgent {
  /**
   * Explain layout decisions and component selection
   * @param {string} userIntent - Original user intent
   * @param {Object} plan - Generated plan
   * @param {Array|string} modifications - Modification operations performed
   * @returns {string} Human-readable explanation
   */
  async explain(userIntent, plan, modifications = []) {
    try {
      console.log('ExplainerAgent: Generating explanation');
      
      const explanation = this.generateExplanation(userIntent, plan, modifications);
      
      // Validate explanation length and content
      this.validateExplanation(explanation);
      
      console.log('ExplainerAgent: Explanation generated');
      return explanation;
      
    } catch (error) {
      console.error('ExplainerAgent: Error:', error);
      throw new Error(`Explanation generation failed: ${error.message}`);
    }
  }

  /**
   * Generate human-readable explanation
   */
  generateExplanation(intent, plan, modifications) {
    const componentCounts = this.countComponents(plan.components);
    const isModification = modifications && modifications.length > 0;
    
    let explanation = `Based on your request to "${intent}", `;
    
    if (isModification) {
      explanation += `I've made the following targeted changes to your existing UI:\n\n`;
      
      // List each modification in detail
      if (Array.isArray(modifications)) {
        modifications.forEach((mod, index) => {
          explanation += `${index + 1}. ${mod}\n`;
        });
      } else if (typeof modifications === 'string') {
        explanation += `• ${modifications}\n`;
      }
      
      explanation += `\n**Incremental Update Benefits**: Instead of regenerating the entire interface, I only modified the specific elements you requested. This preserves your existing layout and other components while making precise changes where needed.\n\n`;
    } else {
      explanation += `I've created a ${plan.layout} layout that best suits your needs. `;
    }
    
    explanation += `\n**Current Layout Structure**: `;
    
    // Describe the component hierarchy
    this.describeComponentHierarchy(explanation, plan.components);
    
    explanation += `\n\n**Component Rationale**: `;
    this.describeComponentRationale(explanation, plan.components);
    
    if (!isModification) {
      explanation += `\n\n**Why This Layout**: `;
      switch(plan.layout) {
        case 'dashboard':
          explanation += `A dashboard layout provides at-a-glance views of key metrics and data. It's ideal for monitoring and analysis tasks.`;
          break;
        case 'form':
          explanation += `A form layout guides users through data entry with clear field labels, input validation, and submission controls.`;
          break;
        case 'modal-view':
          explanation += `Modal-based layouts focus user attention on specific tasks without losing context of the underlying page.`;
          break;
        default:
          explanation += `This standard application layout provides clear navigation and content organization.`;
      }
    }
    
    explanation += `\n\n**Accessibility & Determinism**: All components are pre-built with WCAG-compliant contrast ratios, keyboard navigation, and screen reader support. The exact same input will always produce identical output.`;
    
    return explanation;
  }

  /**
   * Describe component hierarchy in natural language
   */
  describeComponentHierarchy(explanation, components, depth = 0) {
    components.forEach(comp => {
      const indent = '  '.repeat(depth);
      explanation += `\n${indent}• ${comp.type}`;
      
      // Add key props for context
      if (comp.props?.title) {
        explanation += `: "${comp.props.title}"`;
      } else if (comp.props?.label) {
        explanation += `: "${comp.props.label}"`;
      } else if (comp.props?.children) {
        explanation += `: "${comp.props.children}"`;
      }
      
      if (comp.children && comp.children.length > 0) {
        this.describeComponentHierarchy(explanation, comp.children, depth + 1);
      }
    });
  }

  /**
   * Describe rationale for component selection
   */
  describeComponentRationale(explanation, components) {
    const uniqueTypes = [...new Set(components.map(c => c.type))];
    
    uniqueTypes.forEach(type => {
      switch(type) {
        case 'Navbar':
          explanation += `The Navbar provides persistent navigation and branding. `;
          break;
        case 'Sidebar':
          explanation += `Sidebar offers additional navigation options and contextual filters. `;
          break;
        case 'Card':
          explanation += `Cards organize related content into digestible containers. `;
          break;
        case 'Button':
          explanation += `Buttons trigger actions and provide clear user affordances. `;
          break;
        case 'Input':
          explanation += `Input fields capture user data with proper validation and labeling. `;
          break;
        case 'Table':
          explanation += `Tables present structured data for efficient scanning and comparison. `;
          break;
        case 'Modal':
          explanation += `Modals focus user attention on critical tasks or confirmations. `;
          break;
        case 'Chart':
          explanation += `Charts visualize data patterns for quick insights. `;
          break;
      }
    });
  }

  /**
   * Count components by type
   */
  countComponents(components, counts = new Map()) {
    components.forEach(comp => {
      counts.set(comp.type, (counts.get(comp.type) || 0) + 1);
      if (comp.children && comp.children.length > 0) {
        this.countComponents(comp.children, counts);
      }
    });
    return counts;
  }

  /**
   * Validate explanation meets requirements
   */
  validateExplanation(explanation) {
    // Check length
    const wordCount = explanation.split(/\s+/).length;
    if (wordCount > 300) {
      throw new Error('Explanation exceeds 300 words');
    }
    
    // Check for code in explanation
    if (explanation.includes('```') || explanation.includes('<') && explanation.includes('>')) {
      throw new Error('Explanation contains code blocks');
    }
  }
}

export default ExplainerAgent;