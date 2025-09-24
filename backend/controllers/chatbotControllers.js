const fetch = require('node-fetch');
const User = require("../models/userModels");
const Checklist = require("../models/checklistModels");

// Ollama API configuration
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434/api/chat";

// Checklist templates based on user profile
const checklistTemplates = {
  minorNonEU: [
    {
      title: "Validate VLS-TS with Parental Authorization",
      description: "Minors need parental consent for visa validation at Prefecture",
      category: "visa",
      priority: "critical",
      deadline: "Within 3 months",
      link: "https://administration-etrangers-en-france.interieur.gouv.fr/"
    },
    {
      title: "Register Legal Guardian",
      description: "Provide guardian information and attestation d'hébergement",
      category: "visa",
      priority: "critical",
      deadline: "With visa validation"
    },
    {
      title: "Open Bank Account with Parental Consent",
      description: "Minors need parental authorization for banking",
      category: "banking",
      priority: "high",
      deadline: "First month"
    }
  ],
  
  adultNonEU: [
    {
      title: "Validate VLS-TS (Student Visa)",
      description: "Validate your visa online within 3 months",
      category: "visa",
      priority: "critical",
      deadline: "Within 3 months",
      link: "https://administration-etrangers-en-france.interieur.gouv.fr/"
    },
    {
      title: "OFII Medical Appointment",
      description: "Complete mandatory medical check-up (adults only)",
      category: "visa",
      priority: "high",
      deadline: "After visa validation"
    }
  ],

  allNonEU: [
    {
      title: "Open French Bank Account",
      description: "Required for CAF, rent, and administrative tasks",
      category: "banking",
      priority: "high",
      deadline: "First week"
    },
    {
      title: "Apply for CAF Housing Aid",
      description: "Get APL/ALS assistance up to €200/month",
      category: "housing",
      priority: "high",
      deadline: "After accommodation"
    },
    {
      title: "Register for Social Security",
      description: "Healthcare coverage through ameli.fr",
      category: "health",
      priority: "high",
      deadline: "Within first month"
    }
  ],

  french: [
    {
      title: "Apply for CAF Housing Aid",
      description: "Housing assistance for all students",
      category: "housing",
      priority: "high",
      deadline: "After moving in"
    },
    {
      title: "Get Student Transport Card",
      description: "Imagine R for students under 26",
      category: "transport",
      priority: "medium",
      deadline: "First week"
    }
  ],
  
  EU: [
    {
      title: "Open French Bank Account",
      description: "Essential for French administration",
      category: "banking",
      priority: "high",
      deadline: "First week"
    },
    {
      title: "Apply for CAF Housing Aid",
      description: "EU citizens eligible for housing assistance",
      category: "housing",
      priority: "high",
      deadline: "After accommodation"
    },
    {
      title: "Register for Healthcare",
      description: "Use EHIC card and register on ameli.fr",
      category: "health",
      priority: "medium",
      deadline: "Within 3 months"
    }
  ],
  
  universal: [
    {
      title: "Get Navigo/Imagine R Card",
      description: "Public transport with student discount",
      category: "transport",
      priority: "medium",
      deadline: "First week"
    },
    {
      title: "Get French Phone Number",
      description: "Required for administrative contacts",
      category: "utilities",
      priority: "medium",
      deadline: "First week"
    },
    {
      title: "University Registration",
      description: "Complete administrative enrollment",
      category: "university",
      priority: "high",
      deadline: "Check university calendar"
    }
  ],

  university: [
    {
      title: "Pay CVEC",
      description: "€100 student life contribution (university only)",
      category: "university",
      priority: "high",
      deadline: "Before enrollment",
      link: "https://cvec.etudiant.gouv.fr/"
    }
  ]
};

// System prompts for the AI
const systemPrompts = {
  checklist: `You are a helpful assistant for students coming to Paris. Your job is to gather information to create a personalized administrative checklist.

IMPORTANT RULES:
1. Start by asking the user's age. This is CRUCIAL because:
   - Students under 18 (minors) do NOT need OFII medical appointments
   - Minors need parental authorization for visa, bank accounts, etc.
   - Adults (18+) have standard procedures including OFII

2. Ask these questions IN ORDER:
   - Age (determines minor/adult procedures)
   - Nationality (French/EU/non-EU - determines visa needs)
   - Type of studies (university/grande école/BTS/language school)
   - Accommodation status
   - Duration of stay

3. Be friendly but efficient. After gathering all info, tell them you're creating their checklist.

Remember: Age determines many procedures. Minors have different requirements than adults.`,

  chat: `You are an expert on French administrative procedures for students in Paris.
You can answer questions about:
- CAF housing assistance (up to €200/month)
- Visa procedures (VLS-TS must be validated within 3 months)
- Banking (need French account for CAF)
- Healthcare (ameli.fr registration)
- Transport (Navigo/Imagine R cards)
- CVEC payment (€100 for university students)

Always provide specific, actionable information with official websites when relevant.`
};

// Main message handler
exports.sendMessage = async (req, res) => {
  const { message, mode, conversationHistory, userProfile } = req.body;
  const userId = req.userId;

  try {
    console.log("Processing message in mode:", mode);
    
    // Prepare messages for Ollama
    const systemPrompt = systemPrompts[mode] || systemPrompts.chat;
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message }
    ];

    // Call Ollama API
    let aiResponse = "";
    
    try {
      const ollamaRes = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || "mistral",
          messages: messages,
          stream: false,
          temperature: 0.7
        })
      });

      if (!ollamaRes.ok) {
        console.error("Ollama API error:", ollamaRes.status);
        throw new Error(`Ollama API error: ${ollamaRes.status}`);
      }

      const ollamaData = await ollamaRes.json();
      aiResponse = ollamaData.message?.content || ollamaData.response || "I'm having trouble understanding. Could you rephrase?";
      
    } catch (error) {
      console.error("Ollama error:", error);
      aiResponse = "I apologize, but I'm having technical difficulties. Please try again.";
    }

    // Check if we should generate a checklist
    let checklist = null;
    let updatedProfile = userProfile || {};
    
    if (mode === 'checklist') {
      // Extract profile information from conversation
      const profileData = extractProfile(message, conversationHistory, userProfile);
      updatedProfile = profileData;
      
      // Generate checklist if we have enough information
      if (profileData.complete) {
        checklist = generatePersonalizedChecklist(profileData);
        
        // Save to database
        const newChecklist = new Checklist({
          userId: userId,
          items: checklist,
          userProfile: profileData,
          createdAt: new Date()
        });
        
        await newChecklist.save();
        console.log("Checklist created for user:", userId);
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

// Extract user profile from conversation
function extractProfile(currentMessage, history, existingProfile) {
  const profile = existingProfile || {};
  const allText = [...history, { content: currentMessage }]
    .map(m => m.content.toLowerCase())
    .join(' ');
  
  // Extract age (MOST IMPORTANT)
  const ageMatch = allText.match(/\b(\d{2})\b|\bi.?m (\d{2})|(\d{2}) years? old/);
  if (ageMatch && !profile.age) {
    const age = parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3]);
    if (age >= 16 && age <= 99) {
      profile.age = age;
      profile.isMinor = age < 18;
      console.log(`User age detected: ${age}, Minor: ${profile.isMinor}`);
    }
  }
  
  // Extract nationality
  if (allText.includes('french') && !allText.includes('not french')) {
    profile.nationality = 'french';
  } else if (allText.includes('eu') || allText.includes('european')) {
    profile.nationality = 'eu';
  } else if (allText.includes('non-eu') || allText.includes('non eu') || 
             allText.includes('outside eu') || allText.includes('american') || 
             allText.includes('chinese') || allText.includes('indian')) {
    profile.nationality = 'non-eu';
  }
  
  // Extract study type
  if (allText.includes('university') || allText.includes('licence') || 
      allText.includes('master') || allText.includes('doctorate')) {
    profile.studyType = 'university';
  } else if (allText.includes('grande') || allText.includes('engineering')) {
    profile.studyType = 'grande_ecole';
  } else if (allText.includes('bts') || allText.includes('dut')) {
    profile.studyType = 'technical';
  } else if (allText.includes('language')) {
    profile.studyType = 'language';
  }
  
  // Extract accommodation
  if (allText.includes('have accommodation') || allText.includes('already have') || 
      (allText.includes('yes') && allText.includes('accommodation'))) {
    profile.hasAccommodation = true;
  } else if (allText.includes("don't have") || allText.includes('no accommodation') || 
             (allText.includes('no') && allText.includes('accommodation'))) {
    profile.hasAccommodation = false;
  }
  
  // Extract duration
  if (allText.includes('month') || allText.includes('year') || allText.includes('semester')) {
    const durationMatch = allText.match(/(\d+)\s*(month|year|semester)/);
    if (durationMatch) {
      profile.duration = durationMatch[0];
    }
  }
  
  // Check if profile is complete
  profile.complete = !!(
    profile.age && 
    profile.nationality && 
    profile.studyType && 
    profile.duration &&
    'hasAccommodation' in profile
  );
  
  console.log("Profile status:", profile);
  return profile;
}

// Generate checklist based on profile
function generatePersonalizedChecklist(profile) {
  let tasks = [];
  
  // CRITICAL: Age-based logic
  if (profile.nationality === 'non-eu') {
    if (profile.isMinor) {
      // Minors get special visa procedures, NO OFII medical
      tasks.push(...checklistTemplates.minorNonEU);
    } else {
      // Adults get standard procedures INCLUDING OFII
      tasks.push(...checklistTemplates.adultNonEU);
    }
    // Both get general non-EU tasks
    tasks.push(...checklistTemplates.allNonEU);
  } else if (profile.nationality === 'eu') {
    tasks.push(...checklistTemplates.EU);
  } else if (profile.nationality === 'french') {
    tasks.push(...checklistTemplates.french);
  }
  
  // Add universal tasks for everyone
  tasks.push(...checklistTemplates.universal);
  
  // Add CVEC only for university/grande école students
  if (profile.studyType === 'university' || profile.studyType === 'grande_ecole') {
    tasks.push(...checklistTemplates.university);
  }
  
  // Filter accommodation if already arranged
  if (profile.hasAccommodation) {
    tasks = tasks.filter(task => !task.title.includes("Find Accommodation"));
  } else {
    tasks.push({
      title: "Find Accommodation",
      description: "Search for student housing via CROUS or private rentals",
      category: "housing",
      priority: "critical",
      deadline: "Before arrival"
    });
  }
  
  // Remove duplicates and add IDs
  const uniqueTasks = [];
  const seen = new Set();
  
  for (const task of tasks) {
    if (!seen.has(task.title)) {
      uniqueTasks.push({
        ...task,
        id: `task_${Date.now()}_${uniqueTasks.length}`,
        completed: false
      });
      seen.add(task.title);
    }
  }
  
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  uniqueTasks.sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );
  
  console.log(`Generated ${uniqueTasks.length} tasks for user (Age: ${profile.age}, Minor: ${profile.isMinor})`);
  return uniqueTasks;
}

// Toggle checklist item
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
    res.status(500).json({ message: "Error updating checklist" });
  }
};

// Get checklist
exports.getChecklist = async (req, res) => {
  const userId = req.userId;
  
  try {
    const checklist = await Checklist.findOne({ userId }).sort({ createdAt: -1 });
    if (!checklist) {
      return res.status(404).json({ message: "No checklist found" });
    }
    
    res.status(200).json(checklist);
  } catch (error) {
    res.status(500).json({ message: "Error fetching checklist" });
  }
};