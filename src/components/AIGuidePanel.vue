<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { getAIGuideReply } from "@/apis/ai";
import { getGoodsApi } from "@/apis/home";
import { useCategoryStore } from "@/stores/category";

const route = useRoute();
const categoryStore = useCategoryStore();

const visible = ref(false);
const loading = ref(false);
const inputValue = ref("");
const productPool = ref([]);
const messages = ref([
  {
    id: 1,
    role: "assistant",
    text: "你好，我是 AI 导购助手。你可以直接告诉我预算、用途、送礼对象或想买的品类，我会结合站内商品帮你推荐。",
    suggestions: ["预算 300 左右，想买卧室用品", "推荐几款适合送礼的商品", "想买高颜值厨房用品"],
  },
]);

const quickPrompts = [
  "租房党想买实用家居",
  "预算 500 以内送礼推荐",
  "卧室收纳有什么值得买",
  "想看厨房好物",
];

const routeCategoryId = computed(() => {
  const routeId = route.params.id;
  if (!routeId || !route.path.includes("/category")) return "";
  return String(routeId);
});

const routeCategoryName = computed(() => {
  const current = categoryStore.categoryList.find((item) => String(item.id) === routeCategoryId.value);
  return current?.name || "";
});

const normalizeText = (value = "") => String(value).replace(/\s+/g, "").toLowerCase();

const extractBudget = (query) => {
  const rangeMatch = query.match(/(\d+(?:\.\d+)?)\s*[-~到至]\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }

  const underMatch = query.match(/(?:预算|控制在|不超过|小于|低于|以内)?\s*(\d+(?:\.\d+)?)\s*(?:元|块)?\s*(?:以内|以下|之内|左右)?/);
  if (underMatch && /(预算|以内|以下|控制在|不超过|左右|块|元)/.test(query)) {
    const target = Number(underMatch[1]);
    if (/左右/.test(query)) {
      return { min: Math.max(target - 100, 0), max: target + 100, target };
    }
    return { min: 0, max: target, target };
  }

  return null;
};

const tokenize = (query) => {
  const matches = query.match(/[A-Za-z0-9]+|[\u4e00-\u9fa5]{2,}/g) || [];
  return [...new Set(matches.map((item) => item.toLowerCase()))];
};

const scoreProduct = (product, query, budget, tokens) => {
  const searchableText = normalizeText(`${product.name} ${product.desc} ${product.categoryName}`);
  let score = 0;

  tokens.forEach((token) => {
    const keyword = normalizeText(token);
    if (keyword && searchableText.includes(keyword)) {
      score += keyword.length >= 4 ? 14 : 8;
    }
  });

  const semanticMap = [
    { keywords: ["送礼", "礼物"], match: ["礼", "套装", "香", "杯", "家居"], score: 8 },
    { keywords: ["厨房", "做饭", "餐厨"], match: ["厨房", "餐", "锅", "杯", "碗"], score: 8 },
    { keywords: ["卧室", "睡眠"], match: ["床", "枕", "被", "卧室"], score: 8 },
    { keywords: ["收纳", "整理"], match: ["收纳", "整理", "置物"], score: 8 },
    { keywords: ["颜值", "好看", "高级"], match: ["设计", "轻奢", "简约", "ins"], score: 6 },
    { keywords: ["实用", "耐用", "性价比"], match: ["基础", "经典", "组合"], score: 6 },
  ];

  semanticMap.forEach((rule) => {
    if (rule.keywords.some((item) => query.includes(item)) && rule.match.some((item) => searchableText.includes(item))) {
      score += rule.score;
    }
  });

  if (routeCategoryName.value && searchableText.includes(normalizeText(routeCategoryName.value))) {
    score += 10;
  }

  const price = Number(product.price);
  if (budget) {
    if (price >= budget.min && price <= budget.max) {
      score += 20;
      if (budget.target) {
        score += Math.max(0, 10 - Math.abs(price - budget.target) / 20);
      }
    } else {
      score -= 12;
    }
  }

  return score;
};

const getCandidateProducts = (query, limit = 8) => {
  const trimmedQuery = query.trim();
  const budget = extractBudget(trimmedQuery);
  const tokens = tokenize(trimmedQuery);

  return productPool.value
    .map((product) => ({
      ...product,
      score: scoreProduct(product, trimmedQuery, budget, tokens),
    }))
    .filter((product) => product.score > -5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

const buildFallbackReply = (query, products) => {
  if (!products.length) {
    return {
      text: "我先帮你筛了一轮，暂时没找到特别匹配的商品。你可以再补充预算、风格、使用场景，或者告诉我是自用还是送礼。",
      products: [],
      suggestions: ["给父母买", "想要极简风", "预算 200 以内"],
    };
  }

  return {
    text: `我先结合“${query}”筛出几款更匹配的商品，你可以先看看这些。如果你愿意，我还能继续帮你细分成送礼、性价比、颜值或场景向推荐。`,
    products: products.slice(0, 4),
    suggestions: ["再便宜一点", "更适合送礼", "想要颜值更高的"],
  };
};

const appendAssistantMessage = (payload) => {
  messages.value.push({
    id: Date.now() + Math.random(),
    role: "assistant",
    ...payload,
  });
};

const loadProducts = async () => {
  if (loading.value || productPool.value.length) return;

  try {
    const res = await getGoodsApi();
    productPool.value = (res.result || []).flatMap((category) =>
      (category.goods || []).map((goods) => ({
        ...goods,
        categoryId: category.id,
        categoryName: category.name,
      }))
    );
  } catch (error) {
    ElMessage.warning("AI 导购暂时无法获取商品数据");
  }
};

const buildHistoryForModel = () => {
  return messages.value.slice(-6).map((item) => ({
    role: item.role === "assistant" ? "assistant" : "user",
    content: item.text,
  }));
};

const handleAsk = async (question = inputValue.value) => {
  const trimmed = question.trim();
  if (!trimmed || loading.value) return;

  messages.value.push({
    id: Date.now(),
    role: "user",
    text: trimmed,
  });
  inputValue.value = "";

  loading.value = true;
  try {
    await loadProducts();
    const candidates = getCandidateProducts(trimmed);
    const aiResult = await getAIGuideReply({
      query: trimmed,
      categoryName: routeCategoryName.value,
      products: candidates,
      history: buildHistoryForModel(),
    });

    const pickedProducts = aiResult.recommendIds.length
      ? candidates.filter((item) => aiResult.recommendIds.includes(String(item.id))).slice(0, 4)
      : candidates.slice(0, 4);

    appendAssistantMessage({
      text: aiResult.reply,
      products: pickedProducts,
      suggestions: aiResult.followups.length ? aiResult.followups : ["再便宜一点", "更适合送礼", "看看同类爆款"],
    });
  } catch (error) {
    const fallback = buildFallbackReply(trimmed, getCandidateProducts(trimmed, 4));
    appendAssistantMessage(fallback);
    ElMessage.warning("Ollama 回复失败，已切换为本地推荐模式");
  } finally {
    loading.value = false;
  }
};

const openPanel = async () => {
  visible.value = true;
  if (!productPool.value.length) {
    await loadProducts();
  }
};
</script>

<template>
  <div class="ai-guide">
    <Transition name="panel-slide">
      <section v-if="visible" class="ai-guide__panel">
        <div class="ai-guide__header">
          <div>
            <p class="ai-guide__eyebrow">Smart Shopping Assistant</p>
            <h3>AI 导购</h3>
            <p class="ai-guide__sub">
              {{ routeCategoryName ? `当前结合 ${routeCategoryName} 分类推荐` : "已连接本地 Ollama · qwen3:1.7b" }}
            </p>
          </div>
          <button class="ai-guide__close" @click="visible = false">×</button>
        </div>

        <div class="ai-guide__body">
          <div class="ai-guide__quick">
            <button
              v-for="prompt in quickPrompts"
              :key="prompt"
              type="button"
              class="ai-guide__chip"
              @click="handleAsk(prompt)"
            >
              {{ prompt }}
            </button>
          </div>

          <div class="ai-guide__messages">
            <article
              v-for="message in messages"
              :key="message.id"
              class="ai-guide__message"
              :class="`is-${message.role}`"
            >
              <p class="ai-guide__role">{{ message.role === "assistant" ? "AI 导购" : "我" }}</p>
              <p class="ai-guide__text">{{ message.text }}</p>

              <div v-if="message.suggestions?.length" class="ai-guide__suggestions">
                <button
                  v-for="item in message.suggestions"
                  :key="item"
                  type="button"
                  class="ai-guide__suggestion"
                  @click="handleAsk(item)"
                >
                  {{ item }}
                </button>
              </div>

              <div v-if="message.products?.length" class="ai-guide__cards">
                <RouterLink
                  v-for="product in message.products"
                  :key="product.id"
                  :to="`/detail/${product.id}`"
                  class="ai-guide__card"
                >
                  <img :src="product.picture" :alt="product.name" />
                  <div class="ai-guide__card-content">
                    <p class="ai-guide__card-title ellipsis-2">{{ product.name }}</p>
                    <p class="ai-guide__card-desc ellipsis">{{ product.desc }}</p>
                    <div class="ai-guide__card-meta">
                      <span>{{ product.categoryName }}</span>
                      <strong>￥{{ product.price }}</strong>
                    </div>
                  </div>
                </RouterLink>
              </div>
            </article>
          </div>
        </div>

        <div class="ai-guide__footer">
          <el-input
            v-model="inputValue"
            placeholder="比如：预算 300 左右，想买送礼的厨房用品"
            @keyup.enter="handleAsk()"
          />
          <el-button type="primary" :loading="loading" @click="handleAsk()">发送</el-button>
        </div>
      </section>
    </Transition>

    <button class="ai-guide__trigger" type="button" @click="openPanel">
      <span>AI</span>
      <span>导购</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.ai-guide {
  position: fixed;
  right: 32px;
  bottom: 96px;
  z-index: 1200;
}

.ai-guide__trigger {
  width: 72px;
  height: 72px;
  border: 0;
  border-radius: 22px;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  box-shadow: 0 16px 34px rgba(15, 118, 110, 0.28);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.ai-guide__panel {
  width: 380px;
  height: 640px;
  margin-bottom: 16px;
  border-radius: 28px;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(20, 184, 166, 0.18), transparent 30%),
    linear-gradient(180deg, #f7fffd, #ffffff 20%);
  box-shadow: 0 22px 70px rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(15, 118, 110, 0.08);
  display: flex;
  flex-direction: column;
}

.ai-guide__header {
  padding: 22px 22px 18px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  h3 {
    font-size: 26px;
    margin-top: 2px;
  }
}

.ai-guide__eyebrow {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: #0f766e;
  text-transform: uppercase;
}

.ai-guide__sub {
  margin-top: 6px;
  color: #6b7280;
  font-size: 13px;
}

.ai-guide__close {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: rgba(15, 118, 110, 0.08);
  color: #0f766e;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.ai-guide__body {
  flex: 1;
  min-height: 0;
  padding: 0 18px 18px;
  display: flex;
  flex-direction: column;
}

.ai-guide__quick {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.ai-guide__chip,
.ai-guide__suggestion {
  border: 0;
  border-radius: 999px;
  background: #ecfeff;
  color: #0f766e;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
}

.ai-guide__messages {
  flex: 1;
  overflow: auto;
  padding-right: 4px;
}

.ai-guide__message {
  margin-bottom: 14px;
  padding: 14px;
  border-radius: 18px;

  &.is-assistant {
    background: #ffffff;
    border: 1px solid #ecfdf5;
  }

  &.is-user {
    background: #0f766e;
    color: #fff;
    margin-left: 56px;
  }
}

.ai-guide__role {
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 6px;
}

.ai-guide__text {
  line-height: 1.7;
}

.ai-guide__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.ai-guide__cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 14px;
}

.ai-guide__card {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 18px;
  background: #f8fafc;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.1);
  }

  img {
    width: 76px;
    height: 76px;
    border-radius: 14px;
    object-fit: cover;
    background: #fff;
  }
}

.ai-guide__card-content {
  flex: 1;
  min-width: 0;
}

.ai-guide__card-title {
  font-size: 14px;
  line-height: 1.5;
}

.ai-guide__card-desc {
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
}

.ai-guide__card-meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #64748b;
  font-size: 12px;

  strong {
    color: #ef4444;
    font-size: 16px;
  }
}

.ai-guide__footer {
  padding: 16px 18px 18px;
  border-top: 1px solid rgba(15, 118, 110, 0.08);
  background: rgba(255, 255, 255, 0.92);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}
</style>
