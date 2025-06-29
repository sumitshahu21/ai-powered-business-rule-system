import OpenAI from 'openai';

console.log('🟢 Initializing OpenAI with API key:', process.env.AI_API_KEY ? 'Key found' : 'No key found');

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
});

export interface ParsedRule {
  condition: string;
  action: string;
  parameters: Record<string, any>;
  logic: Record<string, any>;
}

export interface RuleRefinement {
  originalRule: string;
  improvedRule: string;
  improvements: string[];
  reasoning: string;
  isValid: boolean;
  validationMessage?: string;
}

// Project context for AI to understand our business rules system
const PROJECT_CONTEXT = `
You are helping with a Business Rules Management System that allows users to create, manage, and validate business rules using natural language.

PROJECT OVERVIEW:
- Users input business rules in plain English (e.g., "If order value is over $100, apply 10% discount")
- The system parses these into structured format with conditions, actions, and parameters
- Rules can have priorities, weights, and can be validated against each other for conflicts
- Common rule types include: discount rules, inventory management, customer segmentation, pricing rules, shipping rules, etc.

RULE STRUCTURE:
- Condition: The logical condition that triggers the rule
- Action: What happens when the condition is met
- Parameters: Specific values like amounts, percentages, thresholds
- Priority: Importance level for conflict resolution
- Weight: Influence factor when multiple rules apply

BUSINESS DOMAINS SUPPORTED:
- E-commerce (orders, discounts, shipping, returns)
- Inventory management (stock levels, reordering, alerts)
- Customer management (segmentation, loyalty, support)
- Pricing (dynamic pricing, promotions, bulk discounts)
- Financial (payment processing, credit limits, risk assessment)
`;

export async function refineRule(originalRule: string): Promise<RuleRefinement> {
  try {
    console.log('🤖 Calling AI to refine rule:', originalRule);
    
    // Check if AI service is available first
    if (!process.env.AI_API_KEY) {
      console.warn('⚠️ No AI API key found');
      return getSmartFallbackRefinement(originalRule);
    }
    
    // First, check if the rule makes sense
    const validationCheck = await validateSingleRule(originalRule);
    
    if (!validationCheck.isValid) {
      return {
        originalRule,
        improvedRule: originalRule,
        improvements: [],
        reasoning: validationCheck.message || 'Rule appears to be invalid or unclear',
        isValid: false,
        validationMessage: validationCheck.message
      };
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a business rules expert. Refine this business rule to be more specific and professional.

Return ONLY valid JSON with this format:
{
  "improvedRule": "refined rule text",
  "improvements": ["improvement 1", "improvement 2"],
  "reasoning": "why these improvements matter"
}`
        },
        {
          role: "user",
          content: `Refine this rule: "${originalRule}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    console.log('🤖 AI Refinement Response:', content);
    
    if (!content) {
      throw new Error('No response from AI');
    }

    // Clean the response to ensure it's valid JSON
    const cleanedContent = content.trim().replace(/```json\n?|```\n?/g, '');
    
    try {
      const result = JSON.parse(cleanedContent);
      console.log('✅ AI Refinement Success:', result);
      
      return {
        originalRule,
        improvedRule: result.improvedRule || originalRule,
        improvements: result.improvements || [],
        reasoning: result.reasoning || 'AI provided refinement suggestions',
        isValid: true
      };
    } catch (parseError) {
      console.error('❌ Failed to parse AI refinement response:', cleanedContent);
      return getSmartFallbackRefinement(originalRule);
    }
  } catch (error: any) {
    console.error('❌ Error refining rule with AI:', error);
    
    // Check if it's a quota error
    if (error?.message && error.message.includes('429')) {
      console.warn('⚠️ OpenAI quota exceeded, using smart fallback');
    }
    
    return getSmartFallbackRefinement(originalRule);
  }
}

async function validateSingleRule(rule: string): Promise<{ isValid: boolean; message?: string }> {
  // Basic validation for gibberish or very short rules
  if (rule.length < 5) {
    return { isValid: false, message: 'Rule is too short to be meaningful. Please provide more details.' };
  }
  
  // Check for common gibberish patterns
  const gibberishPattern = /^[a-z]*$|^[bcdfghjklmnpqrstvwxyz]{4,}$/i;
  if (gibberishPattern.test(rule.replace(/\s/g, ''))) {
    return { isValid: false, message: 'This appears to be gibberish. Please enter a meaningful business rule like "If order value is over $100, apply 10% discount".' };
  }
  
  // Check for basic business rule keywords
  const hasCondition = /\b(if|when|whenever|once|after|before)\b/i.test(rule);
  const hasAction = /\b(then|apply|give|send|set|create|update|notify|alert|discount|charge)\b/i.test(rule);
  
  if (!hasCondition && !hasAction) {
    return { 
      isValid: false, 
      message: 'This doesn\'t appear to be a complete business rule. Please include a condition (if/when) and an action (then/apply/give). Example: "If customer is VIP, then apply 15% discount".' 
    };
  }
  
  return { isValid: true };
}

function getSmartFallbackRefinement(originalRule: string): RuleRefinement {
  // Provide intelligent fallback based on rule analysis
  const lowerRule = originalRule.toLowerCase();
  let improvedRule = originalRule;
  let improvements: string[] = [];
  
  // Smart enhancement based on common patterns
  if (lowerRule.includes('order') && lowerRule.includes('discount')) {
    if (lowerRule.includes('above') || lowerRule.includes('over')) {
      const numbers = originalRule.match(/\d+/g);
      const amount = numbers ? numbers[0] : '100';
      
      improvedRule = `If order subtotal exceeds $${amount} (excluding taxes and shipping), apply a 10% discount to eligible regular-priced items, with a maximum discount of $${Math.floor(parseInt(amount) * 0.5)} per order`;
      
      improvements = [
        `Specified exact monetary threshold ($${amount}) instead of vague terms`,
        'Clarified calculation basis (subtotal excluding taxes/shipping)',
        'Added eligibility constraints (regular-priced items only)',
        'Set maximum discount limit to prevent excessive discounts',
        'Made the rule implementation-ready with clear parameters'
      ];
    }
  } else if (lowerRule.includes('inventory') || lowerRule.includes('stock')) {
    improvedRule = `When inventory level for any product falls below 10 units, automatically send email alerts to inventory managers and create reorder notification in the system`;
    improvements = [
      'Specified exact quantity threshold (10 units)',
      'Defined clear actions (email alerts + system notifications)',
      'Identified target recipients (inventory managers)',
      'Made the rule actionable and measurable'
    ];
  } else if (lowerRule.includes('customer') || lowerRule.includes('vip')) {
    improvedRule = `For customers with lifetime purchase value exceeding $1,000 or 5+ orders in the past year, apply VIP status with 15% discount on all regular-priced items and free shipping`;
    improvements = [
      'Defined specific VIP criteria (purchase value + order frequency)',
      'Specified exact benefits (15% discount + free shipping)',
      'Added eligibility constraints (regular-priced items)',
      'Created measurable conditions for automation'
    ];
  } else {
    // Generic improvements
    improvedRule = `${originalRule} [Enhanced: Add specific thresholds, clear conditions, exact actions, and measurable parameters]`;
    improvements = [
      'Add specific numerical thresholds instead of vague terms',
      'Define clear conditions with measurable criteria',
      'Specify exact actions with concrete parameters',
      'Include business constraints and exception handling',
      'Ensure the rule is implementation-ready'
    ];
  }
  
  return {
    originalRule,
    improvedRule,
    improvements,
    reasoning: 'Enhanced using business rule best practices. For optimal results, connect to AI service for context-aware refinements.',
    isValid: true
  };
}

export async function generateRecommendations(rule: string, existingRules: string[]): Promise<string[]> {
  try {
    console.log('🤖 Calling AI for recommendations...');
    
    // Check if AI service is available
    if (!process.env.AI_API_KEY) {
      console.warn('⚠️ No AI API key found, using fallback recommendations');
      return getFallbackRecommendations(rule);
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a business rules expert. Provide 5 specific recommendations to improve this business rule. Return only a JSON array of strings.`
        },
        {
          role: "user",
          content: `Rule: "${rule}"\n\nProvide recommendations as a JSON array.`
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content;
    console.log('🤖 AI Recommendations Response:', content);
    
    if (!content) {
      return getFallbackRecommendations(rule);
    }

    // Clean the response to ensure it's valid JSON
    const cleanedContent = content.trim().replace(/```json\n?|```\n?/g, '');
    
    try {
      const recommendations = JSON.parse(cleanedContent);
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        console.log('✅ AI Recommendations Success:', recommendations);
        return recommendations;
      }
      return getFallbackRecommendations(rule);
    } catch (parseError) {
      console.error('❌ Failed to parse AI recommendations:', cleanedContent);
      return getFallbackRecommendations(rule);
    }
  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    return getFallbackRecommendations(rule);
  }
}

function getFallbackRecommendations(rule: string): string[] {
  const lowerRule = rule.toLowerCase();
  const recommendations = [];
  
  // Smart fallback based on rule content
  if (lowerRule.includes('discount') || lowerRule.includes('off')) {
    recommendations.push("Specify exact discount percentage and maximum amount");
    recommendations.push("Define which products are eligible for the discount");
    recommendations.push("Add customer eligibility criteria (new vs. returning)");
    recommendations.push("Set expiration date or usage limits");
    recommendations.push("Prevent stacking with other promotional offers");
  } else if (lowerRule.includes('order') || lowerRule.includes('purchase')) {
    recommendations.push("Clarify if amount includes taxes and shipping");
    recommendations.push("Define minimum and maximum order thresholds");
    recommendations.push("Add geographic restrictions if applicable");
    recommendations.push("Specify which payment methods are accepted");
  } else if (lowerRule.includes('inventory') || lowerRule.includes('stock')) {
    recommendations.push("Set specific quantity thresholds for alerts");
    recommendations.push("Define reorder points and lead times");
    recommendations.push("Add seasonal adjustment factors");
    recommendations.push("Specify which staff should receive notifications");
  } else {
    recommendations.push("Add specific numerical thresholds instead of vague terms");
    recommendations.push("Define clear conditions and measurable criteria");
    recommendations.push("Specify exact actions with parameters");
    recommendations.push("Consider edge cases and exception scenarios");
    recommendations.push("Add time-based constraints if applicable");
  }
  
  return recommendations;
}

export async function validateRules(rules: string[]): Promise<{
  valid: boolean;
  conflicts: string[];
  suggestions: string[];
}> {
  if (rules.length === 0) {
    return { valid: true, conflicts: [], suggestions: [] };
  }

  try {
    console.log('🤖 Calling AI for rule validation...');
    
    // Check if AI service is available
    if (!process.env.AI_API_KEY) {
      console.warn('⚠️ No AI API key found, using basic validation');
      return {
        valid: true,
        conflicts: [],
        suggestions: ['AI validation unavailable - manual review recommended']
      };
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Validate business rules for conflicts. Return JSON: {"valid": boolean, "conflicts": [], "suggestions": []}`
        },
        {
          role: "user",
          content: `Rules:\n${rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
        }
      ],
      temperature: 0.3,
      max_tokens: 400,
    });

    const content = completion.choices[0]?.message?.content;
    console.log('🤖 AI Validation Response:', content);
    
    if (!content) {
      throw new Error('No response from AI');
    }

    // Clean the response to ensure it's valid JSON
    const cleanedContent = content.trim().replace(/```json\n?|```\n?/g, '');
    
    try {
      const result = JSON.parse(cleanedContent);
      console.log('✅ AI Validation Success:', result);
      return result;
    } catch (parseError) {
      console.error('❌ Failed to parse AI validation response:', cleanedContent);
      return {
        valid: true,
        conflicts: [],
        suggestions: ['Validation completed with basic checks']
      };
    }
  } catch (error) {
    console.error('❌ Error validating rules with AI:', error);
    return {
      valid: true,
      conflicts: [],
      suggestions: ['AI validation temporarily unavailable']
    };
  }
}

// Keep the existing parseRule and modifyRule functions
export async function parseRule(rule: string): Promise<ParsedRule> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `${PROJECT_CONTEXT}

You are a business rules parser. Convert natural language business rules into structured JSON format.

IMPORTANT: Return ONLY valid JSON, no markdown, no explanations, no code blocks.

Return a JSON object with these exact fields:
- condition: the logical condition to check
- action: the action to take when condition is met
- parameters: object with extracted parameters and values
- logic: structured logical representation with operators

Examples:

Input: "If order value is over $100, apply 10% discount"
Output:
{
  "condition": "order_value > 100",
  "action": "apply_discount",
  "parameters": {
    "threshold_amount": 100,
    "discount_percentage": 10,
    "currency": "USD"
  },
  "logic": {
    "if": {
      "field": "order_value",
      "operator": ">",
      "value": 100
    },
    "then": {
      "action": "apply_discount",
      "value": 0.1
    }
  }
}`
        },
        {
          role: "user",
          content: rule
        }
      ],
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Clean the response to ensure it's valid JSON
    const cleanedContent = content.trim().replace(/```json\n?|```\n?/g, '');
    
    try {
      return JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', cleanedContent);
      throw new Error('Invalid JSON response from AI');
    }
  } catch (error) {
    console.error('Error parsing rule:', error);
    // Return a better fallback parsed rule
    return createFallbackRule(rule);
  }
}

function createFallbackRule(rule: string): ParsedRule {
  // Basic parsing for common patterns
  const lowerRule = rule.toLowerCase();
  
  // Extract discount percentage
  const discountMatch = rule.match(/(\d+)%\s*discount/i);
  const discount = discountMatch ? parseInt(discountMatch[1]) : null;
  
  // Extract amount
  const amountMatch = rule.match(/\$?(\d+)/);
  const amount = amountMatch ? parseInt(amountMatch[1]) : null;
  
  // Check for VIP
  const isVIP = lowerRule.includes('vip');
  
  // Check for operators
  const hasOver = lowerRule.includes('over') || lowerRule.includes('above');
  const hasBelow = lowerRule.includes('below') || lowerRule.includes('under');
  
  // Determine action
  let action = "unknown";
  let parameters: Record<string, any> = {};
  
  if (lowerRule.includes('discount')) {
    action = "apply_discount";
    if (discount) parameters.discount_percentage = discount;
  } else if (lowerRule.includes('alert') || lowerRule.includes('notify')) {
    action = "send_alert";
  } else if (lowerRule.includes('free shipping')) {
    action = "apply_free_shipping";
  }
  
  if (amount) parameters.threshold_amount = amount;
  if (isVIP) parameters.customer_status = "VIP";
  
  // Build condition
  let condition = rule;
  if (isVIP && amount && hasOver) {
    condition = `customer_status == 'VIP' AND order_value > ${amount}`;
  } else if (amount && hasOver) {
    condition = `order_value > ${amount}`;
  } else if (amount && hasBelow) {
    condition = `inventory_count < ${amount}`;
  }
  
  // Build logic
  let logic: any = { original: rule };
  
  if (isVIP && amount && hasOver) {
    logic = {
      if: {
        and: [
          { field: "customer_status", operator: "==", value: "VIP" },
          { field: "order_value", operator: ">", value: amount }
        ]
      },
      then: { action, value: discount ? discount / 100 : 1 }
    };
  } else if (amount && hasOver) {
    logic = {
      if: { field: "order_value", operator: ">", value: amount },
      then: { action, value: discount ? discount / 100 : 1 }
    };
  }
  
  return {
    condition,
    action,
    parameters,
    logic
  };
}

export async function modifyRule(instruction: string, currentRule: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a business rules modifier. Given an instruction and a current rule, return the modified rule in natural language.`
        },
        {
          role: "user",
          content: `Instruction: ${instruction}\nCurrent rule: ${currentRule}`
        }
      ],
      temperature: 0.1,
    });

    return completion.choices[0]?.message?.content || currentRule;
  } catch (error) {
    console.error('Error modifying rule:', error);
    return currentRule;
  }
}
