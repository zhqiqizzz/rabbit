const OLLAMA_CHAT_URL = "/ollama/api/chat";
const OLLAMA_MODEL = "qwen3:1.7b";

const extractJsonObject = (content = "") => {
  const cleaned = content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```json/gi, "```")
    .trim();

  const fencedMatch = cleaned.match(/```([\s\S]*?)```/);
  const candidate = fencedMatch ? fencedMatch[1].trim() : cleaned;

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch (error) {
    return null;
  }
};

export const getAIGuideReply = async ({ query, categoryName, products, history = [] }) => {
  const productLines = products.map((item, index) => {
    return `${index + 1}. id=${item.id}; name=${item.name}; desc=${item.desc || "无"}; price=${item.price}; category=${item.categoryName}`;
  });

  const messages = [
    {
      role: "system",
      content: [
        "你是电商网站里的 AI 导购助手。",
        "你的目标是根据用户需求，从候选商品里做中文推荐。",
        "不要输出思维链，不要解释你如何推理。",
        "请严格返回 JSON，不要加 markdown。",
        'JSON 格式: {"reply":"100字以内的导购回复","recommendIds":["商品id"],"followups":["追问1","追问2","追问3"]}',
        "recommendIds 只能从候选商品 id 里选择，最多 4 个。",
        "followups 给 3 条简短追问，帮助用户继续筛选。",
      ].join("\n"),
    },
    ...history,
    {
      role: "user",
      content: [
        `当前分类: ${categoryName || "无"}`,
        `用户需求: ${query}`,
        "候选商品:",
        ...productLines,
      ].join("\n"),
    },
  ];

  const response = await fetch(OLLAMA_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      messages,
      options: {
        temperature: 0.4,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data?.message?.content || "";
  const parsed = extractJsonObject(content);

  if (!parsed) {
    throw new Error("Invalid Ollama JSON response");
  }

  return {
    reply: parsed.reply || "我先帮你筛了一轮，下面是比较适合你的几款。",
    recommendIds: Array.isArray(parsed.recommendIds) ? parsed.recommendIds.map(String) : [],
    followups: Array.isArray(parsed.followups) ? parsed.followups.slice(0, 3) : [],
    raw: content,
  };
};
