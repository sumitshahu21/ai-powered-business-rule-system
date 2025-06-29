import OpenAI from 'openai';

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
          content: `${PROJECT_CONTEXT}

You are a business rules expert. Your task is to take a user's rough business rule and refine it into a clear, precise, and professional business rule.

REFINEMENT GOALS:
1. Make conditions specific and measurable
2. Clarify actions with exact parameters
3. Add necessary constraints and edge cases
4. Use professional business language
5. Ensure the rule is unambiguous
6. Add relevant business context

IMPORTANT: Return ONLY valid JSON, no markdown, no explanations, no code blocks.

Return a JSON object with:
- improvedRule: the refined version of the rule
- improvements: array of specific improvements made
- reasoning: explanation of why these improvements matter

Example:
Input: "if order big give discount"
Output:
{
  "improvedRule": "If order subtotal exceeds $200 (excluding taxes and shipping), apply a 10% discount to eligible items, valid for regular-priced merchandise only",
  "improvements": [
    "Specified exact threshold ($200) instead of vague 'big'",
    "Clarified what amount to calculate (subtotal excluding taxes/shipping)",
    "Defined discount percentage (10%)",
    "Added eligibility constraints (regular-priced items only)",
    "Excluded taxes and shipping from calculation"
  ],
  "reasoning": "These improvements eliminate ambiguity, provide clear business logic, and prevent potential misuse or confusion in implementation"
}`
        },
        {
          role: "user",
          content: `Please refine this business rule to be more specific, professional, and unambiguous:

Original rule: "${originalRule}"

Provide a refined version that would be clear to implement in a business system, with specific thresholds, conditions, and actions.`
        }
      ],
      temperature: 0.3,
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
      return getFallbackRefinement(originalRule);
    }
  } catch (error) {
    console.error('❌ Error refining rule with AI:', error);
    return getFallbackRefinement(originalRule);
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

function getFallbackRefinement(originalRule: string): RuleRefinement {
  return {
    originalRule,
    improvedRule: `${originalRule} (needs manual refinement - AI service unavailable)`,
    improvements: [
      'AI refinement service is temporarily unavailable',
      'Please manually add specific conditions and thresholds',
      'Ensure actions are clearly defined with exact parameters',
      'Add any necessary business constraints or exceptions'
    ],
    reasoning: 'AI service temporarily unavailable. Manual refinement recommended.',
    isValid: true
  };
}

export async function generateRecommendations(rule: string, existingRules: string[]): Promise<string[]> {
  try {
    console.log('🤖 Calling AI for recommendations...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `${PROJECT_CONTEXT}

You are a business rules expert. Analyze the given rule and provide intelligent, actionable recommendations.

RECOMMENDATION TYPES:
1. Specific improvements to make the rule more precise
2. Edge cases and exceptions to consider
3. Related rules that would complement this one
4. Potential conflicts with existing rules
5. Business best practices for this type of rule
6. Implementation considerations

IMPORTANT: Return ONLY valid JSON array, no markdown, no explanations, no code blocks.

Provide 5-7 specific, actionable recommendations. Each should be concrete and implementable.

Example for "If order over $100 give discount":
[
  "Specify exact discount percentage (e.g., 10%, 15%)",
  "Define what 'order value' includes (subtotal, tax, shipping)",
  "Add customer eligibility criteria (new vs. returning customers)",
  "Set maximum discount amount to prevent excessive discounts",
  "Add expiration date or usage limits",
  "Exclude sale items or gift cards from discount eligibility",
  "Consider tiered discounts for higher order values"
]`
        },
        {
          role: "user",
          content: `New rule: "${rule}"

Existing rules for context:
${existingRules.length > 0 ? existingRules.map((r, i) => `${i + 1}. ${r}`).join('\n') : 'No existing rules'}

Provide specific recommendations to improve this rule and avoid conflicts.`
        }
      ],
      temperature: 0.3,
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
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `${PROJECT_CONTEXT}

You are a business rules validator. Analyze the given rules for conflicts, ambiguities, logical errors, and business logic issues.

VALIDATION CRITERIA:
1. Logical conflicts (contradictory conditions)
2. Ambiguous language that could cause misinterpretation
3. Missing edge cases or boundary conditions
4. Business logic flaws (e.g., negative discounts, impossible conditions)
5. Overlapping rules that might cause confusion
6. Missing parameters or incomplete specifications

IMPORTANT: Return ONLY valid JSON, no markdown, no explanations, no code blocks.

Return a JSON object with:
- valid: boolean indicating if all rules are valid and conflict-free
- conflicts: array of specific conflict descriptions with rule numbers
- suggestions: array of specific improvement suggestions

Example output:
{
  "valid": false,
  "conflicts": [
    "Rules 1 and 3 conflict: Rule 1 gives 10% discount for orders over $100, but Rule 3 gives 15% for the same condition",
    "Rule 2 has ambiguous condition: 'large order' is not clearly defined"
  ],
  "suggestions": [
    "Define exact thresholds instead of vague terms like 'large' or 'high value'",
    "Add priority levels to resolve conflicts between overlapping discount rules",
    "Specify currency and include/exclude tax in monetary conditions"
  ]
}`
        },
        {
          role: "user",
          content: `Please validate these business rules:

${rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}

Analyze for conflicts, ambiguities, and business logic issues. Focus on practical business scenarios.`
        }
      ],
      temperature: 0.1,
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
      throw parseError;
    }
  } catch (error) {
    console.error('❌ Error validating rules with AI:', error);
    return {
      valid: false,
      conflicts: ['AI validation service temporarily unavailable'],
      suggestions: ['Please manually review rules for conflicts and ambiguities']
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
