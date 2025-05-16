/**
 * Validation service for YAML configurations
 */
const yaml = require('js-yaml');

/**
 * Validate YAML syntax
 */
const validateYamlSyntax = (yamlString) => {
  try {
    yaml.load(yamlString);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `YAML syntax error: ${error.message}`
    };
  }
};

/**
 * Validate Gateway configuration
 */
const validateGatewayConfig = (yamlString) => {
  try {
    // First validate YAML syntax
    const syntaxResult = validateYamlSyntax(yamlString);
    if (!syntaxResult.valid) {
      return syntaxResult;
    }
    
    const config = yaml.load(yamlString);
    
    // Check required fields
    if (!config.apiVersion) {
      return {
        valid: false,
        error: 'Missing required field: apiVersion'
      };
    }
    
    if (!config.kind) {
      return {
        valid: false,
        error: 'Missing required field: kind'
      };
    }
    
    if (!config.metadata || !config.metadata.name) {
      return {
        valid: false,
        error: 'Missing required field: metadata.name'
      };
    }
    
    // Validate Gateway-specific fields
    if (config.kind === 'Gateway') {
      if (!config.spec) {
        return {
          valid: false,
          error: 'Missing required field: spec'
        };
      }
      
      if (!config.spec.gatewayClassName) {
        return {
          valid: false,
          error: 'Missing required field: spec.gatewayClassName'
        };
      }
      
      if (!config.spec.listeners || !Array.isArray(config.spec.listeners) || config.spec.listeners.length === 0) {
        return {
          valid: false,
          error: 'Gateway must have at least one listener defined in spec.listeners'
        };
      }
      
      // Validate each listener
      for (const listener of config.spec.listeners) {
        if (!listener.name) {
          return {
            valid: false,
            error: 'Each listener must have a name'
          };
        }
        
        if (!listener.port) {
          return {
            valid: false,
            error: `Listener ${listener.name} is missing required field: port`
          };
        }
        
        if (!listener.protocol) {
          return {
            valid: false,
            error: `Listener ${listener.name} is missing required field: protocol`
          };
        }
        
        // Validate protocol values
        const validProtocols = ['HTTP', 'HTTPS', 'TCP', 'TLS'];
        if (!validProtocols.includes(listener.protocol)) {
          return {
            valid: false,
            error: `Listener ${listener.name} has invalid protocol: ${listener.protocol}. Must be one of: ${validProtocols.join(', ')}`
          };
        }
      }
    }
    
    // Validate HTTPRoute-specific fields
    if (config.kind === 'HTTPRoute') {
      if (!config.spec) {
        return {
          valid: false,
          error: 'Missing required field: spec'
        };
      }
      
      if (!config.spec.parentRefs || !Array.isArray(config.spec.parentRefs) || config.spec.parentRefs.length === 0) {
        return {
          valid: false,
          error: 'HTTPRoute must have at least one parentRef defined in spec.parentRefs'
        };
      }
      
      // Validate each parentRef
      for (const parentRef of config.spec.parentRefs) {
        if (!parentRef.name) {
          return {
            valid: false,
            error: 'Each parentRef must have a name'
          };
        }
      }
      
      if (!config.spec.rules || !Array.isArray(config.spec.rules) || config.spec.rules.length === 0) {
        return {
          valid: false,
          error: 'HTTPRoute must have at least one rule defined in spec.rules'
        };
      }
      
      // Validate each rule
      for (const rule of config.spec.rules) {
        if (!rule.backendRefs || !Array.isArray(rule.backendRefs) || rule.backendRefs.length === 0) {
          return {
            valid: false,
            error: 'Each HTTPRoute rule must have at least one backendRef'
          };
        }
        
        // Validate each backendRef
        for (const backendRef of rule.backendRefs) {
          if (!backendRef.name) {
            return {
              valid: false,
              error: 'Each backendRef must have a name'
            };
          }
          
          if (!backendRef.port) {
            return {
              valid: false,
              error: `BackendRef ${backendRef.name} is missing required field: port`
            };
          }
        }
      }
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Validation error: ${error.message}`
    };
  }
};

module.exports = {
  validateYamlSyntax,
  validateGatewayConfig
};
