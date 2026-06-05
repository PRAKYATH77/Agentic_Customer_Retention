const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  provider: { 
    type: String, 
    required: true,
    enum: ['shopify', 'woocommerce', 'hubspot', 'salesforce'] 
  },
  isConnected: { 
    type: Boolean, 
    default: false 
  },
  credentials: {
    apiKey: { type: String, default: null },
    storeUrl: { type: String, default: null },
    apiSecret: { type: String, default: null } // Optional, for platforms that need it
  },
  lastSyncedAt: { 
    type: Date, 
    default: null 
  }
}, { timestamps: true });

module.exports = mongoose.model('Integration', integrationSchema);
