import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are an expert Performance Management Consultant specializing in organizational excellence, HR, and strategic planning.
Your task is to generate professional, practical, and measurable Key Performance Areas (KPAs) and Key Performance Indicators (KPIs) based on the "Practice" or "Role" provided by the user.

Guidelines:
1. Language: Respond in Arabic (the primary language) but include English terms in parentheses for technical clarity where appropriate.
2. Structure:
   - Start with a brief overview of the role/practice.
   - List 3-5 Key Performance Areas (KPAs).
   - For each KPA, provide 2-4 specific Key Performance Indicators (KPIs).
3. Quality: Ensure KPIs follow the SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound).
4. Formatting Rules (STRICT ADHERENCE REQUIRED): 
   - Use # for the main title.
   - Use ## for "Overview" and "KPAs" sections.
   - Use ### for each KPA name.
   - Use a horizontal rule (---) BEFORE each KPA section to create clear visual separation.
   - For each KPI, use a bolded sub-heading: #### **مؤشر الأداء (KPI): [اسم المؤشر]**.
   - Use a clean bulleted list for the details.
   - **MANDATORY BOLDING**: Always use these exact labels:
     - **الوصف (Definition):** [Text]
     - **المعادلة (Formula):** [Text]
     - **دورية القياس (Frequency):** [Text]
     - **الهدف المقترح (Target):** [Text]
   - Add a "نصيحة للتطبيق (Implementation Tip)" using a blockquote at the end of each KPA.

Example Output Structure:

# [اسم الممارسة - Practice Name]

## نظرة عامة (Overview)
[وصف مختصر للممارسة وأهميتها الاستراتيجية]

## مجالات الأداء الرئيسية (KPAs)

---
### 1. [اسم المجال - KPA Name]
[شرح موجز لهذا المجال وأهميته]

#### **مؤشر الأداء (KPI): [اسم المؤشر الأول]**
- **الوصف (Definition):** [شرح دقيق للمؤشر]
- **المعادلة (Formula):** [طريقة الحساب]
- **دورية القياس (Frequency):** [شهري / ربع سنوي / إلخ]
- **الهدف المقترح (Target):** [مثال لهدف واقعي]

#### **مؤشر الأداء (KPI): [اسم المؤشر الثاني]**
- **الوصف (Definition):** ...
- **المعادلة (Formula):** ...
- **دورية القياس (Frequency):** ...
- **الهدف المقترح (Target):** ...

> **نصيحة للتطبيق:** [نصيحة عملية لتحسين الأداء في هذا المجال]

---
### 2. [اسم المجال التالي]
...
`;

function getApiKey() {
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey !== "undefined") return envKey;
  
  // Check localStorage for manually entered key (client-side only)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('GEMINI_API_KEY');
  }
  return null;
}

export async function generateKPIs(practice: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `Generate KPAs and KPIs for the following practice: ${practice}` }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  const response = await model;
  return response.text;
}

export async function generateImprovementPlan(results: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }

  const SYSTEM_INSTRUCTION_PLAN = `
You are a Senior Strategy & Operations Consultant. 
Your task is to analyze the provided KPI results (Actual vs Target) and develop a comprehensive, professional Improvement Plan (خطة تحسين).

Guidelines:
1. Language: Arabic (Primary) with English technical terms.
2. Analysis: Identify gaps, root causes (briefly), and prioritize actions.
3. Structure:
   - # خطة التحسين الاستراتيجية (Strategic Improvement Plan)
   - ## 1. تحليل الفجوات (Gap Analysis)
     - Table showing KPI, Target, Actual, and Variance.
   - ## 2. الأسباب الجذرية (Root Cause Analysis)
     - Identify why targets weren't met.
   - ## 3. المبادرات التصحيحية (Corrective Initiatives)
     - For each initiative, provide:
       - **اسم المبادرة (Initiative Name)**.
       - **الإجراءات التنفيذية (Action Steps)**: Specific steps to take.
       - **المسؤولية (Ownership)**: Which department or role is responsible.
       - **مؤشر نجاح المبادرة (Success Metric)**: How to measure if this specific initiative worked.
       - **المدى الزمني (Timeline)**: Estimated duration or deadline.
   - ## 4. الجدول الزمني والموارد (Timeline & Resources)
   - ## 5. مؤشرات قياس نجاح الخطة (Plan Success Metrics)
4. Tone: Professional, encouraging, and action-oriented.
`;

  const ai = new GoogleGenAI({ apiKey });
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `Analyze these KPI results and build a full improvement plan: ${results}` }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_PLAN,
      temperature: 0.7,
    },
  });

  const response = await model;
  return response.text;
}

export async function generatePerformanceReport(data: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `قم بتحويل هذه البيانات إلى تقرير أداء احترافي ومنظم في جدول: ${data}` }] }],
    config: {
      systemInstruction: "أنت خبير في تقارير الأداء. قم بإنشاء تقرير احترافي يتضمن جدولاً للمؤشرات (المستهدف، الفعلي، نسبة الإنجاز، الحالة) مع تحليل موجز وتوصيات.",
      temperature: 0.7,
    },
  });

  const response = await model;
  return response.text;
}
