const OpenAI = require('openai');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    return null;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// @desc   AI Health Assistant Chat
// @route  POST /api/ai/chat
// @access Private (patient)
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    // Fetch patient context
    const patient = await User.findById(req.user._id);
    const records = await MedicalRecord.find({ patient: req.user._id })
      .populate('doctor', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    const patientContext = `
Patient: ${patient.name}, Age: ${patient.patientInfo?.dateOfBirth ? new Date().getFullYear() - new Date(patient.patientInfo.dateOfBirth).getFullYear() : 'N/A'}
Blood Group: ${patient.patientInfo?.bloodGroup || 'Unknown'}
Allergies: ${patient.patientInfo?.allergies?.join(', ') || 'None recorded'}
Chronic Conditions: ${patient.patientInfo?.chronicConditions?.join(', ') || 'None recorded'}
Recent Diagnoses: ${records.map(r => `${r.diagnosis} (${new Date(r.createdAt).toLocaleDateString()})`).join('; ') || 'None'}
Current Medications: ${records.flatMap(r => r.medications.map(m => `${m.name} ${m.dose}`)).slice(0, 5).join(', ') || 'None'}
    `.trim();

    const systemPrompt = `You are AGG Hospital's AI Health Assistant, a knowledgeable, empathetic medical AI.

Patient Context:
${patientContext}

Guidelines:
- Provide helpful, accurate health information based on the patient's records
- Always recommend consulting their doctor for medical decisions
- Be clear about drug interactions, dosage questions, and symptom concerns
- Keep responses concise but complete (2-4 paragraphs max)
- If symptoms are severe or emergency-level, immediately direct them to call emergency services or go to ER
- Never diagnose definitively — provide guidance and information only
- Format responses clearly with bullet points where helpful`;

    const openai = getOpenAIClient();

    if (!openai) {
      // Demo mode if no API key
      return res.json({
        success: true,
        data: {
          reply: getDemoReply(message, patientContext),
          usage: { demo: true }
        }
      });
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    res.json({
      success: true,
      data: { reply, usage: completion.usage }
    });
  } catch (err) {
    if (err?.code === 'insufficient_quota') {
      return res.json({ success: true, data: { reply: getDemoReply(req.body.message, ''), usage: { demo: true } } });
    }
    next(err);
  }
};

function getDemoReply(message, context) {
  const m = message.toLowerCase();
  if (m.includes('blood pressure') || m.includes('bp') || m.includes('hypertension'))
    return "Based on your records, you're being managed for hypertension. A reading of 120/80 mmHg is ideal. Your current medications (Amlodipine + Losartan) work synergistically. Tips: reduce sodium intake to <2g/day, exercise 30 min daily, avoid stress, and monitor BP regularly. Please contact Dr. Mehta if readings stay above 150/95.";
  if (m.includes('diabet') || m.includes('sugar') || m.includes('insulin') || m.includes('metformin'))
    return "For diabetes management, Metformin works best when taken with meals to reduce GI side effects. Target fasting blood sugar: 80-130 mg/dL, post-meal: <180 mg/dL, HbA1c: <7%. Diet tips: avoid refined sugar, white rice, and sugary drinks. Exercise improves insulin sensitivity significantly. Contact your doctor if sugar stays above 250 mg/dL.";
  if (m.includes('medication') || m.includes('medicine') || m.includes('drug') || m.includes('interact'))
    return "Based on your current prescriptions, I've checked for interactions. Your medications appear to be a safe combination. However, avoid taking OTC NSAIDs (like Ibuprofen) without consulting Dr. Mehta, as they can interact with blood pressure medications. Always take medications at the prescribed time and never stop abruptly without medical advice.";
  if (m.includes('diet') || m.includes('food') || m.includes('eat') || m.includes('avoid'))
    return "For your conditions, follow a DASH diet: ✓ Fruits and vegetables ✓ Whole grains ✓ Low-fat dairy ✓ Lean proteins ✓ Potassium-rich foods (bananas, potatoes). Avoid: ✗ High-sodium processed foods ✗ Sugary drinks ✗ Alcohol in excess ✗ Saturated fats. Small frequent meals help maintain stable blood sugar.";
  if (m.includes('emergency') || m.includes('chest pain') || m.includes('breathe') || m.includes('unconscious'))
    return "🚨 This sounds like it could be a medical emergency. Please: 1) Call 112 (India Emergency) immediately 2) If chest pain — chew an aspirin if available and not allergic 3) Do not drive yourself 4) Stay calm and sit/lie down. If this is not an emergency, please call AGG Hospital helpline at 1800-AGG-HELP for urgent consultation.";
  return `Thank you for reaching out to the AGG Hospital AI Health Assistant. Based on your medical profile, I can see you've been under care for your health conditions.\n\nFor your question: "${message}" — I'd recommend discussing this with Dr. Mehta at your next appointment. In the meantime, maintain your current medication schedule, stay hydrated, and monitor any changes in your symptoms.\n\nIf you have an urgent concern, please use the Appointments section to book an emergency consultation or call our 24/7 helpline.`;
}
