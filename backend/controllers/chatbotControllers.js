const fetch = require('node-fetch');
const User = require("../models/userModels");
const Checklist = require("../models/checklistModels");

// For Ollama integration
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434/api/chat";

// Predefined checklist templates based on user situations
const checklistTemplates = {
  nonEU: [
    {
      title: "Validate VLS-TS (Visa)",
      description: "Validate your long-stay visa within 3 months of arrival",
      category: "visa",
      priority: "high",
      deadline: "Within 3 months",
      link: "https://administration-etrangers-en-france.interieur.gouv.fr/"
    },
    {
      title: "OFII Medical Appointment",
      description: "Complete mandatory medical check-up",
      category: "visa",
      priority: "high",
      deadline: "After visa validation"
    },
    {
      title: "Open French Bank Account",
      description: "Required for CAF, rent payments, and phone contracts",
      category: "banking",
      priority: "high",
      deadline: "ASAP"
    },
    {
      title: "Apply for CAF Housing Aid",
      description: "Get APL/ALS housing assistance (up to €200/month)",
      category: "housing",
      priority: "high",
      deadline: "After getting accommodation"
    },
    {
      title: "Register for Social Security",
      description: "Register on ameli.fr for healthcare coverage",
      category: "health",
      priority: "high",
      deadline: "ASAP"
    },
    {
      title: "Pay CVEC",
      description: "Student and Campus Life Contribution (€100)",
      category: "university",
      priority: "high",
      deadline: "Before enrollment"
    }
  ],
  EU: [
    {
      title: "Open French Bank Account",
      description: "Needed for most administrative tasks",
      category: "banking",
      priority: "high",
      deadline: "First week"
    },
    {
      title: "Apply for CAF Housing Aid",
      description: "Get APL/ALS housing assistance",
      category: "housing",
      priority: "high",
      deadline: "After accommodation"
    },
    {
      title: "Get French Health Insurance",
      description: "Register on ameli.fr with EHIC card",
      category: "health",
      priority: "medium",
      deadline: "Within 3 months"
    },
    {
      title: "Pay CVEC",
      description: "Student contribution (€100)",
      category: "university",
      priority: "high",
      deadline: "Before enrollment"
    }
  ],
  common: [
    {
      title: "Get Navigo Card",
      description: "Public transport pass with student discount",
      category: "transport",
      priority: "medium",
      deadline: "First week"
    },
    {
      title: "Get French SIM Card",
      description: "Local phone number for administrative tasks",
      category: "utilities",
      priority: "medium",
      deadline: "First week"
    },
    {
      title: "Register at University",
      description: "Complete administrative enrollment",
      category: "university",
      priority: "high",
      deadline: "Check university calendar"
    },
    {
      title: "Find Accommodation",
      description: "If not already arranged",
      category: "housing",
      priority: "critical",
      deadline: "Before arrival"
    }
  ]
};

// System prompts for different modes
const systemPrompts = {
  checklist: `You are a helpful assistant for international students arriving in Paris. 
    You help them create personalized checklists based on their specific situation.
    Ask relevant questions about:
    - Nationality (EU/non-EU)
    - Student level (Bachelor/Master/PhD)
    - Accommodation status
    - Duration of stay
    - French language level
    - Budget constraints
    
    Based on their answers, help them understand what administrative tasks they need to complete.
    Be friendly, clear, and provide practical advice.`,
    
  chat: `You are an expert assistant for international students in Paris.
    You have extensive knowledge about:
    - French administrative procedures (CAF, OFII, Prefecture)
    - Student life in Paris
    - Housing and accommodation
    - Banking and finances
    - Healthcare and insurance
    - Transportation
    - Student discounts and benefits
    
    Provide accurate, helpful, and practical information.
    Always mention official websites when relevant.
    Be encouraging and supportive.`
};

exports.sendMessage = async (req, res) => {
  const { message, mode, conversationHistory, userProfile } = req.body;
  const userId = req.userId;

  try {
    // Build context for Ollama
    const systemPrompt = systemPrompts[mode] || systemPrompts.chat;
    
    // Format messages for Ollama
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message }
    ];

    // Call Ollama API (or use a mock response for testing)
    let aiResponse;
    
    if (process.env.USE_OLLAMA === 'true') {
      // Real Ollama API call
      const ollamaRes = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || "llama2",
          messages: messages,
          stream: false
        })
      });

      if (!ollamaRes.ok) {
        const errorText = await ollamaRes.text();
        console.error("Ollama failed:", ollamaRes.status, errorText);
        throw new Error(`Ollama API error: ${ollamaRes.status}`);
      }

      const ollamaData = await ollamaRes.json();
      aiResponse = ollamaData.message?.content || ollamaData.response || "Sorry, I couldn't generate a response.";
      console.log("Ollama response structure:", Object.keys(ollamaData));
      
    } else {
      // Mock response for testing without Ollama
      aiResponse = generateMockResponse(message, mode, conversationHistory);
    }

    // Generate checklist if in checklist mode and enough info collected
    let checklist = null;
    let updatedProfile = userProfile;
    
    if (mode === 'checklist') {
      const profileData = extractProfileFromConversation(
        message, 
        conversationHistory, 
        userProfile
      );
      
      if (profileData.isComplete) {
        checklist = generateChecklist(profileData);
        updatedProfile = profileData;
        
        // Save checklist to database
        const newChecklist = new Checklist({
          userId: userId,
          items: checklist,
          userProfile: profileData,
          createdAt: new Date()
        });
        
        await newChecklist.save();
      }
    }

    res.status(200).json({
      response: aiResponse,
      checklist: checklist,
      userProfile: updatedProfile
    });

  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      message: "Error processing your message",
      error: error.message
    });
  }
};

// Helper function to generate mock responses when Ollama is not available
function generateMockResponse(message, mode, history) {
  const lowerMessage = message.toLowerCase();
  
  if (mode === 'checklist') {
    // Check what information we still need
    const hasNationality = history.some(m => 
      m.content.toLowerCase().includes('nationality') || 
      m.content.toLowerCase().includes('citizen')
    );
    
    if (!hasNationality || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Great! Let's start by understanding your situation. Are you an EU citizen or non-EU citizen?";
    }
    
    if (lowerMessage.includes('eu') || lowerMessage.includes('european')) {
      return "Perfect! As an EU citizen, your process will be simpler. What's your student level - Bachelor, Master, or PhD?";
    }
    
    if (lowerMessage.includes('non-eu') || lowerMessage.includes('non eu')) {
      return "I understand. As a non-EU citizen, you'll have some additional steps. What type of visa do you have - Student visa (VLS-TS) or another type?";
    }
    
    if (lowerMessage.includes('bachelor') || lowerMessage.includes('master') || lowerMessage.includes('phd')) {
      return "Great! Do you already have accommodation arranged in Paris?";
    }
    
    if (lowerMessage.includes('yes') || lowerMessage.includes('no')) {
      return "How long will you be staying in Paris? (e.g., 6 months, 1 year, 2 years)";
    }
    
    if (lowerMessage.includes('month') || lowerMessage.includes('year')) {
      return `Based on your information, I've created a personalized checklist for you! 
      
You'll see it on the right side of your screen. The most urgent tasks are marked with high priority. 

Here's a summary:
- First priority: Visa validation (if non-EU) and opening a bank account
- Second priority: CAF application for housing aid and health insurance
- Third priority: Transport card and other utilities

Each item has a deadline and helpful links. Click on each item to mark it as complete.

Do you have any questions about any of these tasks?`;
    }
  }
  
  // Chat mode responses
  if (lowerMessage.includes('caf')) {
    return `CAF (Caisse d'Allocations Familiales) provides housing assistance to students in France. 

Here's what you need to know:
- You can get up to €200/month for housing aid (APL/ALS)
- You need: French bank account, rental contract, and attestation de loyer from landlord
- Apply online at caf.fr
- Processing takes 2-3 months, but payment is retroactive
- Tip: Apply as soon as you move in!

The main documents needed:
1. Rental contract (bail)
2. Attestation de loyer (form from CAF website, filled by landlord)
3. Bank account details (RIB)
4. Student certificate
5. Birth certificate (translated if not in French)`;
  }
  
  if (lowerMessage.includes('visa') || lowerMessage.includes('vls')) {
    return `For non-EU students with a VLS-TS (long-stay student visa):

You MUST validate it within 3 months of arrival! Here's how:
1. Go to: administration-etrangers-en-france.interieur.gouv.fr
2. Pay the tax (around €50-60)
3. Submit documents online
4. You'll receive a confirmation - keep it safe!

After validation:
- Register for OFII medical appointment (mandatory)
- Keep all documents for future residence permit renewals

Missing the 3-month deadline means you'll need to return to your home country for a new visa!`;
  }
  
  if (lowerMessage.includes('bank')) {
    return `Opening a French bank account is essential. Here are your options:

Traditional banks (need appointment):
- BNP Paribas (student-friendly)
- Société Générale (good student packages)
- LCL (many branches)

Online banks (easier, often free):
- Boursorama (most popular)
- Revolut (instant account)
- N26 (German, works in France)

Documents needed:
1. Passport
2. Student certificate
3. Proof of address (even temporary)
4. Sometimes: Proof of income/scholarship

Tip: Some banks require appointments weeks in advance. Online banks can be opened in days!`;
  }
  
  return "I'm here to help! Could you please be more specific about what you'd like to know? I can help with visa procedures, housing, CAF, banking, transportation, or any other aspect of student life in Paris.";
}

// Extract user profile from conversation
function extractProfileFromConversation(currentMessage, history, existingProfile) {
  const profile = existingProfile || {};
  const allMessages = [...history, { content: currentMessage }].map(m => m.content.toLowerCase());
  const combined = allMessages.join(' ');
  
  // Check nationality
  if (combined.includes('eu citizen') || combined.includes('european')) {
    profile.isEU = true;
  } else if (combined.includes('non-eu') || combined.includes('non eu')) {
    profile.isEU = false;
  }
  
  // Check student level
  if (combined.includes('bachelor')) profile.level = 'bachelor';
  if (combined.includes('master')) profile.level = 'master';
  if (combined.includes('phd') || combined.includes('doctorate')) profile.level = 'phd';
  
  // Check accommodation
  if (combined.includes('have accommodation') || combined.includes('already have')) {
    profile.hasAccommodation = true;
  }
  if (combined.includes("don't have") || combined.includes('no accommodation')) {
    profile.hasAccommodation = false;
  }
  
  // Check duration
  const durationMatch = combined.match(/(\d+)\s*(month|year)/);
  if (durationMatch) {
    profile.duration = durationMatch[0];
  }
  
  // Check if we have enough info
  profile.isComplete = 
    profile.isEU !== undefined && 
    profile.level !== undefined &&
    profile.duration !== undefined;
  
  return profile;
}

// Generate personalized checklist
function generateChecklist(profile) {
  let checklist = [];
  
  // Add visa-related tasks for non-EU
  if (!profile.isEU) {
    checklist.push(...checklistTemplates.nonEU);
  } else {
    checklist.push(...checklistTemplates.EU);
  }
  
  // Add common tasks
  checklist.push(...checklistTemplates.common);
  
  // Filter accommodation task if already has
  if (profile.hasAccommodation) {
    checklist = checklist.filter(item => item.title !== "Find Accommodation");
  }
  
  // Add IDs and completion status
  checklist = checklist.map((item, index) => ({
    ...item,
    id: `task_${Date.now()}_${index}`,
    completed: false
  }));
  
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  checklist.sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );
  
  return checklist;
}

// Toggle checklist item completion
exports.toggleChecklistItem = async (req, res) => {
  const { itemId } = req.params;
  const userId = req.userId;
  
  try {
    const checklist = await Checklist.findOne({ userId });
    
    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found" });
    }
    
    const item = checklist.items.find(i => i.id === itemId);
    if (item) {
      item.completed = !item.completed;
      await checklist.save();
    }
    
    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ message: "Error updating checklist", error: error.message });
  }
};

// Get user's checklist
exports.getChecklist = async (req, res) => {
  const userId = req.userId;
  
  try {
    const checklist = await Checklist.findOne({ userId }).sort({ createdAt: -1 });
    
    if (!checklist) {
      return res.status(404).json({ message: "No checklist found" });
    }
    
    res.status(200).json(checklist);
  } catch (error) {
    res.status(500).json({ message: "Error fetching checklist", error: error.message });
  }
};