const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ["visa", "housing", "banking", "health", "transport", "university", "utilities", "other"],
    default: "other"
  },
  priority: {
    type: String,
    enum: ["critical", "high", "medium", "low"],
    default: "medium"
  },
  deadline: { type: String },
  link: { type: String },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  notes: { type: String }
});

const checklistSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  items: [checklistItemSchema],
  userProfile: {
    isEU: { type: Boolean },
    level: { 
      type: String, 
      enum: ["bachelor", "master", "phd", "other"] 
    },
    duration: { type: String },
    hasAccommodation: { type: Boolean },
    nationality: { type: String },
    languageLevel: { type: String },
    arrivalDate: { type: Date }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  completionRate: { 
    type: Number, 
    default: 0 
  }
}, { 
  timestamps: true 
});

// Calculate completion rate before saving
checklistSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    const completedItems = this.items.filter(item => item.completed).length;
    this.completionRate = Math.round((completedItems / this.items.length) * 100);
  }
  next();
});

// Update completedAt timestamp when item is marked complete
checklistSchema.pre('save', function(next) {
  this.items.forEach(item => {
    if (item.completed && !item.completedAt) {
      item.completedAt = new Date();
    } else if (!item.completed) {
      item.completedAt = null;
    }
  });
  next();
});

module.exports = mongoose.model("Checklist", checklistSchema);