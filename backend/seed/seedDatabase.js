const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

const Persona = require('../models/Persona');
const AgentAction = require('../models/AgentAction');
const AprioriRule = require('../models/AprioriRule');
const LLMMessage = require('../models/LLMMessage');
const Customer = require('../models/Customer');
const Campaign = require('../models/Campaign');
const User = require('../models/User');

const OLIST_PATH = path.join(__dirname, '../../olist');
const OUTPUTS_PATH = path.join(__dirname, '../../outputs');

// Persona metadata (from analysis)
const PERSONA_META = {
  'High-Value Enthusiasts': {
    slug: 'high-value-enthusiasts',
    color: '#10B981',
    icon: 'crown',
    churnRisk: 12,
    description: 'Top-tier customers with high spend, frequent purchases, and excellent reviews. Brand evangelists.',
    trend: 'up',
    trendValue: 8.3,
  },
  'Emerging Loyalists': {
    slug: 'emerging-loyalists',
    color: '#6366F1',
    icon: 'trending-up',
    churnRisk: 25,
    description: 'Growing customers showing increasing purchase frequency. High potential for upselling.',
    trend: 'up',
    trendValue: 12.1,
  },
  'Silent Loyal Customers': {
    slug: 'silent-loyal-customers',
    color: '#22D3EE',
    icon: 'heart',
    churnRisk: 30,
    description: 'Regular buyers who rarely leave reviews. Consistent revenue contributors.',
    trend: 'stable',
    trendValue: 1.2,
  },
  'Dormant / One-Time Buyers': {
    slug: 'dormant-one-time-buyers',
    color: '#F59E0B',
    icon: 'moon',
    churnRisk: 68,
    description: 'Customers who purchased once but have not returned. High reactivation opportunity.',
    trend: 'down',
    trendValue: -5.4,
  },
  'Fading Customers': {
    slug: 'fading-customers',
    color: '#F97316',
    icon: 'alert-triangle',
    churnRisk: 82,
    description: 'Previously active customers showing declining engagement. Urgent retention needed.',
    trend: 'down',
    trendValue: -14.7,
  },
  'Dissatisfied / Churn-Risk Customers': {
    slug: 'dissatisfied-churn-risk-customers',
    color: '#EF4444',
    icon: 'x-circle',
    churnRisk: 91,
    description: 'Customers with poor review scores and declining orders. Critical churn risk requiring immediate intervention.',
    trend: 'down',
    trendValue: -22.3,
  },
};

const ACTION_META = {
  'No Action': { cost: 0, description: 'Maintain current engagement without additional spend', priority: 'low', confidence: 0.72 },
  'Send Discount': { cost: 15, description: 'Offer a targeted discount coupon to re-engage', priority: 'high', confidence: 0.85 },
  'Send Loyalty Reward': { cost: 8, description: 'Reward with loyalty points or exclusive access', priority: 'high', confidence: 0.91 },
  'Send Win-Back Email': { cost: 5, description: 'Personalized email campaign to reactivate dormant customers', priority: 'medium', confidence: 0.67 },
  'Escalate to Support': { cost: 12, description: 'Proactively reach out with support and satisfaction survey', priority: 'high', confidence: 0.78 },
};

async function parseCSV(filepath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filepath)) return resolve([]);
    const csvParser = require('csv-parser');
    const results = [];
    fs.createReadStream(filepath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await Promise.all([
      Persona.deleteMany({}),
      AgentAction.deleteMany({}),
      AprioriRule.deleteMany({}),
      LLMMessage.deleteMany({}),
      Customer.deleteMany({}),
      Campaign.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('🧹 Cleared existing data');

    // ─── USERS ───────────────────────────────────────────────────────
    const users = await User.create([
      { name: 'Admin User', email: 'admin@agentmind.ai', password: 'demo123', role: 'admin' },
      { name: 'Analyst', email: 'analyst@agentmind.ai', password: 'demo123', role: 'analyst' },
    ]);
    // passwords hashed via pre-save hook
    console.log('👤 Users seeded');

    // ─── PERSONAS ────────────────────────────────────────────────────
    // Parse customer_personas.csv
    let personaRows = await parseCSV(path.join(OUTPUTS_PATH, 'customer_personas.csv'));

    // Aggregate by persona label
    const personaMap = {};
    personaRows.forEach(row => {
      const label = row.persona_label || row.Persona || row.persona || '';
      if (!label) return;
      if (!personaMap[label]) {
        personaMap[label] = { count: 0, recencySum: 0, freqSum: 0, monetarySum: 0, reviewSum: 0, n: 0 };
      }
      personaMap[label].count++;
      personaMap[label].recencySum += parseFloat(row.recency_days || row.Recency || 0);
      personaMap[label].freqSum += parseFloat(row.frequency || row.Frequency || 0);
      personaMap[label].monetarySum += parseFloat(row.monetary || row.Monetary || 0);
      personaMap[label].reviewSum += parseFloat(row.review_score || row.ReviewScore || 0);
      personaMap[label].n++;
    });

    // Fallback hardcoded data if CSV parse fails
    const fallbackPersonas = {
      'High-Value Enthusiasts': { count: 8241, recencySum: 245*8241, freqSum: 3.8*8241, monetarySum: 892.4*8241, reviewSum: 4.6*8241 },
      'Emerging Loyalists': { count: 14520, recencySum: 189*14520, freqSum: 2.4*14520, monetarySum: 412.7*14520, reviewSum: 4.3*14520 },
      'Silent Loyal Customers': { count: 19870, recencySum: 210*19870, freqSum: 1.9*19870, monetarySum: 287.3*19870, reviewSum: 4.1*19870 },
      'Dormant / One-Time Buyers': { count: 28340, recencySum: 412*28340, freqSum: 1.1*28340, monetarySum: 148.6*28340, reviewSum: 3.9*28340 },
      'Fading Customers': { count: 16820, recencySum: 380*16820, freqSum: 1.6*16820, monetarySum: 201.4*16820, reviewSum: 3.2*16820 },
      'Dissatisfied / Churn-Risk Customers': { count: 11650, recencySum: 290*11650, freqSum: 1.3*11650, monetarySum: 178.9*11650, reviewSum: 2.1*11650 },
    };

    const usePersonaData = Object.keys(personaMap).length > 0 ? personaMap : 
      Object.fromEntries(Object.entries(fallbackPersonas).map(([k,v]) => [k, {...v, n: v.count}]));

    const personaDocs = Object.entries(usePersonaData).map(([name, data]) => {
      const meta = PERSONA_META[name] || { slug: name.toLowerCase().replace(/\s+/g, '-'), color: '#6366F1', icon: 'users', churnRisk: 50, description: '', trend: 'stable', trendValue: 0 };
      const n = data.n || data.count || 1;
      return {
        name,
        slug: meta.slug,
        count: data.count || n,
        avgRecency: Math.round(data.recencySum / n),
        avgFrequency: parseFloat((data.freqSum / n).toFixed(2)),
        avgMonetary: parseFloat((data.monetarySum / n).toFixed(2)),
        avgReviewScore: parseFloat((data.reviewSum / n).toFixed(2)),
        churnRisk: meta.churnRisk,
        clvScore: parseFloat(((data.monetarySum / n) * (data.freqSum / n) * (1 - meta.churnRisk / 100)).toFixed(2)),
        color: meta.color,
        icon: meta.icon,
        description: meta.description,
        trend: meta.trend,
        trendValue: meta.trendValue,
      };
    });

    await Persona.insertMany(personaDocs);
    console.log(`📊 ${personaDocs.length} Personas seeded`);

    // ─── AGENT ACTIONS ───────────────────────────────────────────────
    const agentRows = await parseCSV(path.join(OUTPUTS_PATH, 'learned_cost_aware_agent_policy.csv'));

    const agentDocs = agentRows.filter(r => r.persona).map(row => {
      const actionType = row.best_action || 'No Action';
      const meta = ACTION_META[actionType] || ACTION_META['No Action'];
      return {
        persona: row.persona,
        actionType,
        expectedNetReward: parseFloat(row.expected_net_reward || 0),
        confidence: meta.confidence,
        cost: meta.cost,
        description: meta.description,
        priority: meta.priority,
        episodesRun: Math.floor(Math.random() * 500) + 100,
        convergenceRate: parseFloat((Math.random() * 0.3 + 0.65).toFixed(3)),
      };
    });

    // Add enriched actions for better demo
    const enrichedActions = [
      { persona: 'High-Value Enthusiasts', actionType: 'Send Loyalty Reward', expectedNetReward: 0.82, ...ACTION_META['Send Loyalty Reward'], episodesRun: 642, convergenceRate: 0.91 },
      { persona: 'Emerging Loyalists', actionType: 'Send Discount', expectedNetReward: 0.61, ...ACTION_META['Send Discount'], episodesRun: 412, convergenceRate: 0.84 },
      { persona: 'Silent Loyal Customers', actionType: 'Send Loyalty Reward', expectedNetReward: 0.54, ...ACTION_META['Send Loyalty Reward'], episodesRun: 388, convergenceRate: 0.79 },
      { persona: 'Dormant / One-Time Buyers', actionType: 'Send Win-Back Email', expectedNetReward: 0.31, ...ACTION_META['Send Win-Back Email'], episodesRun: 521, convergenceRate: 0.71 },
      { persona: 'Fading Customers', actionType: 'Send Discount', expectedNetReward: 0.24, ...ACTION_META['Send Discount'], episodesRun: 489, convergenceRate: 0.68 },
      { persona: 'Dissatisfied / Churn-Risk Customers', actionType: 'Escalate to Support', expectedNetReward: -0.12, ...ACTION_META['Escalate to Support'], episodesRun: 301, convergenceRate: 0.62 },
    ];
    await AgentAction.insertMany([...agentDocs, ...enrichedActions]);
    console.log(`🤖 ${agentDocs.length + enrichedActions.length} Agent actions seeded`);

    // ─── APRIORI RULES ───────────────────────────────────────────────
    const aprioriRows = await parseCSV(path.join(OUTPUTS_PATH, 'persona_apriori_rules.csv'));
    const aprioriDocs = aprioriRows.filter(r => r.persona && r.antecedents).map(row => {
      const parseSet = (s) => s.replace(/frozenset\(\{|\}\)/g, '').replace(/'/g, '').split(',').map(x => x.trim()).filter(Boolean);
      return {
        persona: row.persona,
        antecedents: parseSet(row.antecedents || ''),
        consequents: parseSet(row.consequents || ''),
        antecedentsRaw: row.antecedents,
        consequentsRaw: row.consequents,
        support: parseFloat(row.support || 0),
        confidence: parseFloat(row.confidence || 0),
        lift: parseFloat(row.lift || 0),
      };
    });
    await AprioriRule.insertMany(aprioriDocs);
    console.log(`🛍️  ${aprioriDocs.length} Apriori rules seeded`);

    // ─── LLM MESSAGES ───────────────────────────────────────────────
    const llmDir = path.join(OUTPUTS_PATH, 'llm_messages');
    const personas = ['High-Value Enthusiasts', 'Emerging Loyalists', 'Silent Loyal Customers', 'Dormant / One-Time Buyers', 'Fading Customers', 'Dissatisfied / Churn-Risk Customers'];
    const channels = ['email', 'sms', 'push', 'whatsapp'];
    const tones = ['positive', 'neutral', 'urgent'];
    const actionTypes = ['retention', 'upsell', 'winback', 'loyalty', 'engagement'];

    let messageDocs = [];
    if (fs.existsSync(llmDir)) {
      const files = fs.readdirSync(llmDir).filter(f => f.endsWith('.txt'));
      messageDocs = files.map((file, i) => {
        const msg = fs.readFileSync(path.join(llmDir, file), 'utf-8').replace(/^"|"$/g, '').trim();
        return {
          customerId: file.replace('.txt', ''),
          persona: personas[i % personas.length],
          message: msg,
          channel: channels[i % channels.length],
          actionType: actionTypes[i % actionTypes.length],
          sentimentTone: tones[i % tones.length],
          effectiveness: parseFloat((Math.random() * 40 + 50).toFixed(1)),
        };
      });
    }
    await LLMMessage.insertMany(messageDocs);
    console.log(`💬 ${messageDocs.length} LLM messages seeded`);

    // ─── CUSTOMERS (sample 500) ────────────────────────────────────
    const masterRows = await parseCSV(path.join(OUTPUTS_PATH, 'master_customer_table.csv'));
    const sampleRows = masterRows.slice(0, 500);
    const customerDocs = sampleRows.map(row => ({
      customerId: row.customer_id || row.customer_unique_id || `cust_${Math.random().toString(36).substr(2, 9)}`,
      customerUniqueId: row.customer_unique_id || '',
      city: row.customer_city || row.city || '',
      state: row.customer_state || row.state || '',
      persona: row.persona_label || row.persona || personas[Math.floor(Math.random() * personas.length)],
      rfmR: parseFloat(row.recency_days || row.rfm_r || Math.floor(Math.random() * 500)),
      rfmF: parseFloat(row.frequency || row.rfm_f || Math.floor(Math.random() * 10) + 1),
      rfmM: parseFloat(row.monetary || row.rfm_m || Math.random() * 1000 + 50),
      rfmScore: parseFloat(row.rfm_score || (Math.random() * 4 + 1).toFixed(2)),
      totalSpend: parseFloat(row.total_spend || row.monetary || Math.random() * 2000 + 50),
      totalOrders: parseInt(row.total_orders || row.frequency || Math.floor(Math.random() * 20) + 1),
      avgReviewScore: parseFloat(row.review_score || (Math.random() * 3 + 2).toFixed(1)),
      sentimentScore: parseFloat((Math.random() * 2 - 1).toFixed(3)),
      churnRisk: parseFloat((Math.random() * 100).toFixed(1)),
      clv: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
      topCategory: row.top_category || 'cama_mesa_banho',
    }));

    if (customerDocs.length > 0) {
      // Deduplicate by customerId
      const unique = [...new Map(customerDocs.map(c => [c.customerId, c])).values()];
      await Customer.insertMany(unique, { ordered: false }).catch(() => {});
      console.log(`👥 ${unique.length} Customers seeded`);
    }

    // ─── CAMPAIGNS ─────────────────────────────────────────────────
    const campaignData = [
      { name: 'Q2 Win-Back Campaign', targetPersona: 'Dormant / One-Time Buyers', actionType: 'Send Win-Back Email', channel: 'email', status: 'active', budget: 5000, targetCount: 28340, sentCount: 14200, openRate: 22.4, conversionRate: 3.8, revenueGenerated: 42800, description: 'Reactivate dormant customers with personalized offers' },
      { name: 'Loyalty Rewards Program', targetPersona: 'High-Value Enthusiasts', actionType: 'Send Loyalty Reward', channel: 'push', status: 'active', budget: 8000, targetCount: 8241, sentCount: 8241, openRate: 71.2, conversionRate: 18.4, revenueGenerated: 198400, description: 'Exclusive rewards for top-tier customers' },
      { name: 'Churn Prevention Drive', targetPersona: 'Dissatisfied / Churn-Risk Customers', actionType: 'Escalate to Support', channel: 'whatsapp', status: 'active', budget: 3000, targetCount: 11650, sentCount: 9200, openRate: 45.7, conversionRate: 8.1, revenueGenerated: 28700, description: 'Proactive support outreach to save at-risk customers' },
      { name: 'Flash Sale for Fading', targetPersona: 'Fading Customers', actionType: 'Send Discount', channel: 'sms', status: 'completed', budget: 4500, targetCount: 16820, sentCount: 16820, openRate: 34.1, conversionRate: 6.2, revenueGenerated: 67300, description: 'Time-limited discount to re-engage fading segment' },
      { name: 'Emerging Growth Boost', targetPersona: 'Emerging Loyalists', actionType: 'Send Discount', channel: 'email', status: 'draft', budget: 6000, targetCount: 14520, sentCount: 0, openRate: 0, conversionRate: 0, revenueGenerated: 0, description: 'Upcoming upsell campaign for growing customer base' },
    ];
    await Campaign.insertMany(campaignData);
    console.log(`📣 ${campaignData.length} Campaigns seeded`);

    console.log('\n✨ Database seeded successfully!');
    console.log('🔑 Login: admin@agentmind.ai / demo123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
