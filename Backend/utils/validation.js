export class ValidationUtils {
  /**
   * Validate component tree against whitelist
   */
  static validateComponentTree(components, allowedComponents) {
    const errors = [];
    
    const validate = (comp, path = 'root') => {
      // Check component type
      if (!allowedComponents.includes(comp.type)) {
        errors.push({
          path,
          component: comp.type,
          error: `Component "${comp.type}" is not in whitelist`
        });
      }
      
      // Check for inline styles
      if (comp.props?.style || comp.props?.styles) {
        errors.push({
          path,
          component: comp.type,
          error: 'Inline styles are not allowed'
        });
      }
      
      // Recursively validate children
      if (Array.isArray(comp.children)) {
        comp.children.forEach((child, index) => {
          if (typeof child === 'object' && child.type) {
            validate(child, `${path}.children[${index}]`);
          }
        });
      }
    };
    
    components.forEach((comp, index) => validate(comp, `components[${index}]`));
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize user input for security
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove dangerous characters
    let sanitized = input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
    
    return sanitized;
  }

  /**
   * Validate generated code structure
   */
  static validateGeneratedCode(code) {
    const rules = [
      {
        test: /import\s+.*\s+from\s+['"]@\/components\/ui['"]/,
        message: 'Must import only from @/components/ui'
      },
      {
        test: /style\s*=/,
        message: 'Inline styles are not allowed',
        shouldNotMatch: true
      },
      {
        test: /<(div|span|p|h[1-6]|section|article|header|footer)>/,
        message: 'HTML elements are not allowed, use components only',
        shouldNotMatch: true
      },
      {
        test: /dangerouslySetInnerHTML|eval|Function|document\.write/,
        message: 'Dangerous patterns are not allowed',
        shouldNotMatch: true
      }
    ];
    
    const violations = rules
      .filter(rule => {
        const matches = rule.test.test(code);
        return rule.shouldNotMatch ? matches : !matches;
      })
      .map(rule => rule.message);
    
    return {
      isValid: violations.length === 0,
      violations
    };
  }
}