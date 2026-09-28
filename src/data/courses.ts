import type { Course, Intensity, Level, OutlineBlock, SectionSlug } from "@/lib/types";

const groupCancel =
  "距离开课时间大于 6 小时取消预约，支持全额退款，名额立即释放。距离开课时间不满 6 小时取消预约，不支持退款。开课后不能取消。";
const personalCancel =
  "开课前满 24 小时可免费取消，名额立即释放。距开课不足 24 小时仍可在本站取消并释放名额，预约记录会标记「已超过免费取消时限」。开课后不能取消。业务规则里的逾期取消费用，本站不收款、不扣费。";
const openCancel =
  "开课前满 6 小时可免费取消，名额立即释放。距开课不足 6 小时仍可在本站取消并释放名额，预约记录会标记「已超过免费取消时限」。开课后不能取消。";

const groupPrice =
  "按城市、门店和场次定价，使用城市团课参考范围。未核实本课程单独售价，当前场次价待确认。北京、上海的 89—179 元不能分配给这门课；成都不能因全国口径「69元起」就写成 69 元。";
const hyroxPrice = "专项课程价格待确认，不直接套用 69 元起或普通团课最高价。";
const personalPrice = "按城市、教练职级及课包计价，参考私教历史单课标价。当前单课价和课包价待确认，历史标价不能乘成套餐售价。";

function steps(items: [string, string][]): OutlineBlock[] {
  return items.map(([title, detail]) => ({ minutes: "以当堂为准", title, detail }));
}

function course(
  input: {
    id: string;
    code: string;
    section: SectionSlug;
    name: string;
    englishName: string;
    summary: string;
    description: string;
    level: Level;
    levelNote: string;
    intensity: Intensity;
    audience: string;
    tags: string[];
    priceNote: string;
    notSuitableFor?: string[];
    outline: [string, string][];
    cancelRule: string;
  },
): Course {
  return {
    ...input,
    durationMinutes: 0,
    calories: "消耗因人而异，本页不估算热量。",
    goals: input.outline.map(([title]) => title),
    outline: steps(input.outline),
    suitableFor: input.tags,
    notSuitableFor: input.notSuitableFor ?? ["未根据自身情况评估就提高负荷的人"],
    equipmentProvided: ["当堂课程使用的场地和器械，以门店安排为准"],
    bring: ["运动鞋", "可运动的衣服", "饮用水"],
    generalNotes: ["仍须根据自身情况选择课程。"],
    priceIncludes: input.priceNote,
  };
}

export const courses: Course[] = [
  course({
    id: "bodycombat",
    code: "SC-GRP-01",
    section: "group",
    name: "燃脂搏击",
    englishName: "BODYCOMBAT",
    summary: "跟随音乐完成拳击、踢腿风格的连续有氧，没有人与人之间的肢体对抗。",
    description:
      "结合拳击、踢腿等武术风格动作，跟随音乐完成连续的有氧训练。侧重心肺耐力、身体协调与压力释放，通常没有人与人之间的肢体对抗，不属于实战格斗教学。",
    level: "初中级",
    levelNote: "初中级至中级；可选择低冲击动作版本。",
    intensity: "中高",
    audience:
      "希望下班后释放压力、提高心肺能力的运动者；喜欢强节奏音乐和集体跟练，不想独自重复跑步；无格斗基础也可尝试低冲击版本，但目标不是学习实战对抗。",
    tags: ["压力释放", "心肺训练", "音乐跟练", "非对抗搏击"],
    priceNote: groupPrice,
    notSuitableFor: ["想学习实战对抗或对打的人"],
    outline: [
      ["动作学习", "跟随音乐练习拳击、踢腿等武术风格动作，可改用低冲击版本。"],
      ["连续有氧", "以心肺、协调和压力释放为主，不安排人与人之间的肢体对抗。"],
    ],
    cancelRule: groupCancel,
  }),
  course({
    id: "bodypump",
    code: "SC-GRP-02",
    section: "group",
    name: "塑形杠铃",
    englishName: "BODYPUMP",
    summary: "用杠铃和杠铃片做多次重复的抗阻训练，负重可以按个人能力调整。",
    description:
      "利用杠铃和杠铃片进行多次重复的抗阻训练，通过深蹲、推举、划船等动作组合锻炼主要肌群。侧重全身肌耐力与动作控制，负重可根据个人能力调整。",
    level: "初中级",
    levelNote: "初中级；首次参加建议从轻重量开始。",
    intensity: "中",
    audience:
      "想从有氧拓展到抗阻训练、希望锻炼全身肌耐力的人；偏好有教练示范、音乐节奏和明确动作顺序；愿意先用轻重量学习，而非追求最大重量或竞技力量成绩。",
    tags: ["抗阻入门", "全身训练", "肌耐力", "音乐跟练"],
    priceNote: groupPrice,
    outline: [
      ["动作顺序", "深蹲、推举、划船等组合，由教练示范。"],
      ["负重选择", "按个人能力选择杠铃片，首次参加从轻重量开始。"],
    ],
    cancelRule: groupCancel,
  }),
  course({
    id: "power-loop",
    code: "SC-GRP-03",
    section: "group",
    name: "力量循环",
    englishName: "Strength Circuit",
    summary: "把力量和体能动作排成循环，兼顾基础力量、肌耐力和综合体能。",
    description:
      "将不同力量与体能动作编排为循环训练，通过多个动作或训练站锻炼全身。兼顾基础力量、肌耐力和综合体能，具体器械及编排以当堂课程为准。",
    level: "中级",
    levelNote: "中级；负重、次数和动作版本可调整。",
    intensity: "中高",
    audience:
      "已有基础动作经验，希望在一节课中兼顾力量和体能的人；不喜欢长时间重复单一动作，偏好多站点、多器械和任务式训练；愿意按自己的能力调整负重与速度。",
    tags: ["基础进阶", "综合体能", "循环训练", "动作多样"],
    priceNote: groupPrice,
    outline: [
      ["循环安排", "多个动作或训练站轮换，器械和编排以当堂为准。"],
      ["负荷调整", "负重、次数和动作版本可以按自己的能力降低。"],
    ],
    cancelRule: groupCancel,
  }),
  course({
    id: "trx",
    code: "SC-GRP-04",
    section: "group",
    name: "全身塑形",
    englishName: "TRX",
    summary: "用悬吊训练带和自身体重做推、拉、蹲和稳定训练。",
    description:
      "借助悬吊训练带和自身体重完成推、拉、蹲及稳定训练。通过身体角度改变负荷，侧重核心稳定、平衡与全身抗阻能力。",
    level: "初中级",
    levelNote: "初中级至中级。",
    intensity: "中",
    audience:
      "希望提高核心稳定与平衡、喜欢自重训练的人；关注动作控制而非单纯增加器械重量；愿意循序学习身体角度、重心与发力方式，希望给常规力量训练增加变化。",
    tags: ["核心稳定", "自重抗阻", "平衡控制", "悬吊训练"],
    priceNote: groupPrice,
    outline: [
      ["悬吊动作", "用训练带完成推、拉、蹲和稳定练习。"],
      ["负荷变化", "通过身体角度改变难度，先学重心和发力。"],
    ],
    cancelRule: groupCancel,
  }),
  course({
    id: "battle-rope",
    code: "SC-GRP-05",
    section: "group",
    name: "热浪战绳",
    englishName: "Battle Rope",
    summary: "用战绳做挥动和体能组合，训练密度较高。",
    description:
      "利用战绳完成挥动、交替摆动及体能组合训练。强调上肢与核心协同，在连续或间歇训练中提升肌耐力与心肺能力。",
    level: "中级",
    levelNote: "中级至中高级；训练密度较高。",
    intensity: "高",
    audience:
      "有规律运动习惯、希望挑战心肺与肌耐力的人；喜欢目标明确、节奏紧凑的间歇训练，不排斥较高强度；能维持基础动作质量，并愿意根据疲劳程度降低速度或休息。",
    tags: ["体能挑战", "间歇训练", "肌耐力", "运动进阶"],
    priceNote: groupPrice,
    outline: [
      ["战绳技术", "挥动、交替摆动，强调上肢和核心一起发力。"],
      ["间歇密度", "连续或间歇进行。疲劳时降低速度或增加休息。"],
    ],
    cancelRule: groupCancel,
  }),
  course({
    id: "medball",
    code: "SC-GRP-06",
    section: "group",
    name: "疯狂药球",
    englishName: "Med Ball",
    summary: "用药球做多方向的力量和体能训练，练习协调和力量传递。",
    description:
      "使用药球进行全身力量与体能训练，通过多方向动作练习身体协调、核心控制和力量传递。具体动作及用球重量以教练安排为准。",
    level: "中级",
    levelNote: "中级。",
    intensity: "中高",
    audience:
      "已有一定运动基础，想提升全身协调与力量传递的人；喜欢带工具、方向变化较多的训练；希望为跑跳或球类活动补充一般体能，但不把团课当作专项技术教学。",
    tags: ["身体协调", "核心控制", "功能训练", "工具训练"],
    priceNote: groupPrice,
    notSuitableFor: ["把团课当作专项技术教学的人"],
    outline: [
      ["多方向动作", "用药球练习协调、核心控制和力量传递。"],
      ["重量安排", "用球重量和动作以教练当堂安排为准。"],
    ],
    cancelRule: groupCancel,
  }),
  course({
    id: "rpm",
    code: "SC-GRP-07",
    section: "group",
    name: "燃脂骑行",
    englishName: "RPM",
    summary: "在室内单车上跟随音乐调节节奏和阻力，阻力可以自己调。",
    description:
      "在室内单车上跟随音乐完成不同节奏和阻力的骑行训练，模拟平路、爬坡等体验。主要锻炼心肺耐力和下肢肌耐力，阻力可自行调整。",
    level: "初中级",
    levelNote: "初中级至中级；首次上课需请教练协助调车。",
    intensity: "中",
    audience:
      "想提升心肺、喜欢骑行与音乐，但不想学习复杂舞步的人；希望不受天气影响地完成有氧训练，偏好自行调节阻力；适合愿意关注车座设置与骑行姿势的初次体验者和有氧爱好者。",
    tags: ["心肺训练", "室内骑行", "自调阻力", "音乐节奏"],
    priceNote: groupPrice,
    outline: [
      ["调车", "首次上课请教练协助调整车座和姿势。"],
      ["骑行段落", "跟随音乐完成不同节奏和阻力，阻力可自行调整。"],
    ],
    cancelRule: groupCancel,
  }),
  course({
    id: "bodyjam",
    code: "SC-GRP-08",
    section: "group",
    name: "舞蹈有氧",
    englishName: "BODYJAM",
    summary: "跟随音乐学习和串联舞蹈动作，协调要求高于单纯基础有氧。",
    description:
      "跟随音乐学习并串联舞蹈动作组合，在重复练习中锻炼节奏感、身体协调和心肺能力。更适合喜欢音乐与编舞体验的人。",
    level: "初中级",
    levelNote: "初中级至中级；编舞和协调要求高于单纯基础有氧。",
    intensity: "中",
    audience:
      "喜欢舞蹈、流行音乐和集体氛围，希望把运动变成兴趣的人；愿意反复学习动作组合，不要求第一次就完全跟上；更看重节奏、表达和乐趣，而非固定器械训练。",
    tags: ["舞蹈兴趣", "节奏协调", "趣味有氧", "集体氛围"],
    priceNote: groupPrice,
    outline: [
      ["动作组合", "跟随音乐分段学习，再把动作串起来。"],
      ["重复练习", "不要求第一次就完全跟上，重点是节奏和协调。"],
    ],
    cancelRule: groupCancel,
  }),
  course({
    id: "rebound",
    code: "SC-GRP-09",
    section: "group",
    name: "活力蹦床",
    englishName: "Rebound",
    summary: "在个人蹦床上做节奏弹跳。有跳跃限制的人应先咨询专业人员。",
    description:
      "在个人蹦床上完成节奏性弹跳和动作组合，结合音乐进行有氧训练。侧重心肺、下肢肌耐力和平衡控制；有跳跃运动限制者应先咨询专业人员。",
    level: "中级",
    levelNote: "中级。",
    intensity: "中高",
    audience:
      "希望尝试新鲜有趣的有氧形式、喜欢弹跳和音乐的人；有一定平衡能力，愿意先熟悉落点、节奏与稳定控制；不适合仅凭「蹦床」名称就期待低强度或康复训练的人。",
    tags: ["趣味有氧", "节奏弹跳", "平衡训练", "新鲜体验"],
    priceNote: groupPrice,
    notSuitableFor: ["有跳跃运动限制且未先咨询专业人员的人", "把蹦床课当作低强度或康复训练的人"],
    outline: [
      ["落点与稳定", "先熟悉个人蹦床的落点和节奏。"],
      ["弹跳组合", "结合音乐做弹跳和动作组合，侧重心肺、下肢和平衡。"],
    ],
    cancelRule: groupCancel,
  }),
  course({
    id: "barre",
    code: "SC-GRP-10",
    section: "group",
    name: "活力芭杆",
    englishName: "Barre",
    summary: "借助芭杆做小幅度、持续发力的下肢、臀部和核心练习。",
    description:
      "结合芭杆辅助、重复的小幅度动作和控制练习，重点锻炼下肢、臀部和核心肌耐力。动作幅度虽小，也需要持续发力与稳定控制。",
    level: "初中级",
    levelNote: "初中级。",
    intensity: "中",
    audience:
      "喜欢细致动作、关注下肢与核心控制的人；希望尝试芭杆辅助练习，偏好小幅重复、持续发力，而非高速冲刺；愿意耐心学习站姿、发力和动作精度。",
    tags: ["下肢肌耐力", "动作精度", "核心控制", "芭杆体验"],
    priceNote: groupPrice,
    outline: [
      ["站姿与发力", "借助芭杆学习站姿、小幅度动作和持续发力。"],
      ["控制练习", "以下肢、臀部和核心肌耐力为主，不是高速冲刺。"],
    ],
    cancelRule: groupCancel,
  }),
  course({
    id: "mind-body",
    code: "SC-GRP-11",
    section: "group",
    name: "瑜伽与普拉提",
    englishName: "Yoga & Pilates",
    summary: "按门店具体课名再细分。不能默认包含大器械普拉提，也不能默认全部低强度。",
    description:
      "通过呼吸配合、体式或控制性动作练习身体活动度、柔韧性、核心稳定与身体觉察。此项为课程类别，需根据门店具体课名继续细分；不能默认包含大器械普拉提。",
    level: "入门",
    levelNote: "入门至中级，取决于具体课程。",
    intensity: "低",
    audience:
      "久坐后希望增加日常活动、练习呼吸与身体控制的人，以及希望为力量或有氧训练补充活动度练习的运动者；更关注动作质量与身体感受。偏好舒缓节奏者应进一步筛选基础或舒缓课，不能默认所有瑜伽、普拉提都低强度。",
    tags: ["身体觉察", "活动度", "呼吸控制", "基础课可选"],
    priceNote: groupPrice,
    notSuitableFor: ["默认所有瑜伽或普拉提都是低强度的人", "默认包含大器械普拉提的人"],
    outline: [
      ["呼吸与控制", "用呼吸配合体式或控制性动作。"],
      ["具体课名", "到店后按门店课名确认是基础、舒缓还是更高要求的课。"],
    ],
    cancelRule: groupCancel,
  }),
  course({
    id: "hyrox",
    code: "SC-GRP-12",
    section: "group",
    name: "HYROX 训练",
    englishName: "HYROX",
    summary: "围绕跑步和功能性训练提升综合体能。价格不套用普通团课区间。",
    description:
      "围绕跑步与功能性训练组合提升综合体能，可用于日常体能进阶或赛事备赛。课程可能涉及划船、负重等训练，具体站点、跑步安排和器材依门店课程配置确定。",
    level: "中高级",
    levelNote: "中级至中高级；入门班是否开放需单独确认。",
    intensity: "高",
    audience:
      "具备一定跑步和抗阻基础，希望参加 HYROX 或挑战综合体能的人；偏好有训练指标、可记录进步的目标导向练习；愿意同时提升耐力、力量和动作衔接，而非只练单项或寻找轻松体验。",
    tags: ["赛事备赛", "跑步加力量", "综合体能", "目标进阶"],
    priceNote: hyroxPrice,
    notSuitableFor: ["没有跑步和抗阻基础、只想找轻松体验的人"],
    outline: [
      ["跑步与功能站", "跑步结合划船、负重等训练，站点以门店配置为准。"],
      ["进阶确认", "入门班是否开放需要单独确认，不默认所有人可上。"],
    ],
    cancelRule: groupCancel,
  }),
  course({
    id: "pt-foundation",
    code: "SC-PT-01",
    section: "personal",
    name: "基础力量与动作入门",
    englishName: "Foundations",
    summary: "一对一学习深蹲、髋铰链、推、拉，建立可以自己练的动作基础。",
    description:
      "一对一学习深蹲、髋铰链、推、拉等基础动作，熟悉器械使用、呼吸和负重控制。根据现有能力安排渐进训练，建立可独立练习的动作基础。",
    level: "入门",
    levelNote: "入门，个性化调整。",
    intensity: "低",
    audience:
      "零基础、较长时间未训练，或自主练习时不确定动作是否正确的人；需要慢节奏讲解、即时反馈和反复练习；希望建立独立训练能力，愿意为一对一指导投入高于团课的预算。",
    tags: ["零基础", "一对一反馈", "动作学习", "独立训练准备"],
    priceNote: personalPrice,
    outline: [
      ["基础动作", "深蹲、髋铰链、推、拉，以及器械、呼吸和负重控制。"],
      ["渐进安排", "按现有能力调整，目标是建立可以自己练习的动作基础。"],
    ],
    cancelRule: personalCancel,
  }),
  course({
    id: "pt-fat",
    code: "SC-PT-02",
    section: "personal",
    name: "减脂与综合体能",
    englishName: "Conditioning",
    summary: "把抗阻、有氧和间歇按体能与日程安排。不承诺固定减重数字。",
    description:
      "结合抗阻训练、有氧和间歇训练，根据体能与日程安排训练量，帮助提升活动水平、体能和持续训练能力。不承诺固定减重数值，效果也受饮食、睡眠等因素影响。",
    level: "入门",
    levelNote: "入门至中级，个性化调整。",
    intensity: "中",
    audience:
      "有体重管理或提升日常体力目标、希望建立规律训练的人；过去容易因缺少计划而中断，偏好明确安排和阶段反馈；愿意配合长期生活习惯调整，不寻求极端节食或短期速瘦承诺。",
    tags: ["体重管理", "习惯建立", "计划训练", "体能提升"],
    priceNote: personalPrice,
    notSuitableFor: ["寻求极端节食或短期速瘦承诺的人"],
    outline: [
      ["训练组合", "抗阻、有氧和间歇按体能与日程安排训练量。"],
      ["预期", "不承诺固定减重数值，饮食和睡眠也会影响变化。"],
    ],
    cancelRule: personalCancel,
  }),
  course({
    id: "pt-muscle",
    code: "SC-PT-03",
    section: "personal",
    name: "增肌与力量提升",
    englishName: "Strength",
    summary: "按肌群安排抗阻，逐步调整重量、组数、次数和恢复。",
    description:
      "围绕全身或重点肌群安排抗阻训练，逐步调整重量、训练组数、重复次数与恢复节奏。适合希望系统提高力量、肌肉训练质量和训练计划执行能力的人。",
    level: "初中级",
    levelNote: "初中级至中高级，个性化调整。",
    intensity: "中高",
    audience:
      "已有抗阻训练经验但进步停滞、希望更系统提高力量或肌肉训练质量的人；关注训练记录、渐进负荷与恢复安排，愿意定期复盘；也适合目标明确、需要从基础开始规划增肌训练的初学者。",
    tags: ["增肌目标", "力量进阶", "训练复盘", "渐进负荷"],
    priceNote: personalPrice,
    outline: [
      ["抗阻计划", "全身或重点肌群，调整重量、组数、次数和恢复。"],
      ["记录复盘", "用训练记录看渐进负荷，不把单节课写成固定成果。"],
    ],
    cancelRule: personalCancel,
  }),
  course({
    id: "pt-control",
    code: "SC-PT-04",
    section: "personal",
    name: "核心稳定与动作控制",
    englishName: "Control",
    summary: "练躯干稳定、髋肩活动和发力控制。不能替代疼痛诊疗或医疗康复。",
    description:
      "围绕躯干稳定、髋肩活动与全身协调安排训练，练习在动作中保持稳定、控制负荷和合理发力。此类普通健身指导不能替代疼痛诊疗或医疗康复。",
    level: "入门",
    levelNote: "入门至中级，个性化调整。",
    intensity: "低",
    audience:
      "在训练中难以保持躯干稳定、希望提高平衡和动作质量的人；重视细节指导，愿意先练控制再增加重量；久坐且缺少运动者可在评估后逐步开始，有持续疼痛或伤病者应先接受医疗评估。",
    tags: ["动作质量", "核心稳定", "细节指导", "循序渐进"],
    priceNote: personalPrice,
    notSuitableFor: ["把本课当作疼痛诊疗或医疗康复的人", "有持续疼痛或伤病、尚未接受医疗评估的人"],
    outline: [
      ["稳定与活动", "躯干稳定、髋肩活动和全身协调。"],
      ["边界", "这是普通健身指导，不替代医疗评估。"],
    ],
    cancelRule: personalCancel,
  }),
  course({
    id: "pt-performance",
    code: "SC-PT-05",
    section: "personal",
    name: "运动表现与体能进阶",
    englishName: "Performance",
    summary: "按跑步或其他运动目标安排力量、耐力、速度或爆发力。不是每位教练都提供全部专项。",
    description:
      "根据跑步或其他运动目标，安排力量、耐力、速度或爆发力等训练，关注专项需求与恢复。需选择具有对应经验的教练，不能默认所有教练提供全部专项服务。",
    level: "中级",
    levelNote: "中级至中高级，个性化调整。专项服务是否另价需确认。",
    intensity: "高",
    audience:
      "有稳定运动习惯，并设有赛事、跑步成绩或其他运动表现目标的人；需要让体能训练与专项训练相互配合，偏好阶段计划与进度评估；愿意选择匹配专项经验的教练，而非只按价格或职级决定。",
    tags: ["专项目标", "赛事准备", "周期训练", "表现进阶"],
    priceNote: `${personalPrice}专项服务是否另价需确认。`,
    notSuitableFor: ["默认所有教练都提供全部专项服务的人"],
    outline: [
      ["专项安排", "按跑步或其他目标安排力量、耐力、速度或爆发力，并安排恢复。"],
      ["教练匹配", "选择有对应经验的教练，不按职级默认专项范围。"],
    ],
    cancelRule: personalCancel,
  }),
  course({
    id: "open-public",
    code: "SC-OPN-01",
    section: "open",
    name: "公开课",
    englishName: "Open",
    summary: "没有核实到统一商品目录，也没有面向普通消费者的固定报名价。",
    description:
      "未核实到统一公开课商品目录，以及面向普通消费者的固定报名项目。本页只保留入口，不把某一场标成免费课或固定售价。",
    level: "入门",
    levelNote: "难度待具体项目确认。",
    intensity: "低",
    audience: "想先了解公开课是否对自己开放的人。当前没有可核验的统一报名目录。",
    tags: ["价格待确认", "目录待核实"],
    priceNote: "价格待确认。未核实到统一公开课商品目录及面向普通消费者的固定报名项目。",
    outline: [
      ["报名项目", "具体项目、时长和收费都待确认。"],
      ["预约", "可以先占名额咨询，不表示该场免费或已经标价。"],
    ],
    cancelRule: openCancel,
  }),
  course({
    id: "open-chengdu",
    code: "SC-OPN-02",
    section: "open",
    name: "成都校企实践",
    englishName: "Chengdu Practice",
    summary: "成都体育学院校企教学实践。未公布收费，校外报名资格未确认。",
    description:
      "已查到成都体育学院校企教学实践项目，未公布收费。面向校外公众的报名资格未确认。本场按钮是咨询报名，不是免费预约。",
    level: "入门",
    levelNote: "难度和参与条件待项目方确认。",
    intensity: "低",
    audience: "希望咨询成都这一项目是否面向校外公众的人。提交咨询不表示已经获得报名资格。",
    tags: ["咨询报名", "收费未公布", "资格未确认"],
    priceNote: "未公布收费。面向校外公众的报名资格未确认。",
    notSuitableFor: ["把本项目理解为已经对公众免费开放的课程的人"],
    outline: [
      ["项目", "校企教学实践，收费未公布。"],
      ["资格", "校外公众能否报名尚未确认，先咨询。"],
    ],
    cancelRule: openCancel,
  }),
];
