import { writeFileSync } from "node:fs";

import { coaches, courses, sections, studios } from "@/data/catalog";
import { listAugustWorkouts, augustTrainingSummary } from "@/data/august-training";
import { bananaAccount, couponLabel, formatBananas, hotCourseNames } from "@/data/bananas";
import { bananaRates, GROUP_FROM_PRICE, GYM_HOUR_PRICE, tiers, topUps } from "@/data/membership";
import { courseImage, sectionImages } from "@/lib/images";
import { getSessionView } from "@/lib/queries";
import { sessions } from "@/data/catalog";

const summary = augustTrainingSummary();
const bananas = bananaAccount(summary.bananasEarned);
const august = listAugustWorkouts();

function esc(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function img(src: string) {
  return esc(src.replace(/^\//, ""));
}

function paras(items: string[]) {
  return items.map((item) => `<p>${esc(item)}</p>`).join("");
}

function items(list: string[]) {
  if (list.length === 0) return "";
  return `<ul>${list.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

const homeLine: Record<string, string> = {
  group: "教练带整班。当前课表 ¥89–179/人",
  personal: "一对一。¥420–560/节，不是都接受零基础",
  open: "免费及付费体验。¥0 或 ¥49",
};

const views = sessions
  .map((session) => getSessionView(session))
  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

function courseBlock(course: (typeof courses)[number]) {
  const image = courseImage(course.id, course.name);
  const courseSessions = views.filter((view) => view.courseId === course.id);
  const coupon = couponLabel(course.id);
  const rows = courseSessions
    .map(
      (view) => `<tr>
        <td>${esc(view.timeLabel)}</td>
        <td>${esc(view.coachName)}</td>
        <td>${esc(view.city)} · ${esc(view.studioName)}<br>${esc(view.room)}</td>
        <td>${esc(view.level)}</td>
        <td>${view.booked} / ${view.capacity}</td>
        <td>${view.remaining}</td>
        <td>${esc(view.priceLabel)}</td>
        <td>${esc(view.statusLabel)}</td>
      </tr>`,
    )
    .join("");

  return `<article id="${esc(course.id)}">
    <img src="${img(image.src)}" alt="${esc(image.alt)}">
    <div>
      <p class="eyebrow">${esc(course.code)}</p>
      <h3>${esc(course.name)} <span>${esc(course.englishName)}</span></h3>
      <p>${esc(course.summary)}</p>
      <p>${esc(course.description)}</p>
      <dl>
        <div><dt>时长</dt><dd>${course.durationMinutes} 分钟</dd></div>
        <div><dt>技术难度</dt><dd>${esc(course.level)}</dd></div>
        <div><dt>强度</dt><dd>${esc(course.intensity)}</dd></div>
        <div><dt>消耗</dt><dd>${esc(course.calories)}</dd></div>
        ${course.levelDetail ? `<div><dt>准入与退阶</dt><dd>${esc(course.levelDetail)}</dd></div>` : ""}
        ${course.audience ? `<div><dt>适合谁</dt><dd>${esc(course.audience)}</dd></div>` : ""}
        ${coupon ? `<div><dt>优惠券</dt><dd>${esc(coupon)}</dd></div>` : ""}
      </dl>
      <h4>课程结构</h4>
      <ol>${course.outline.map((block) => `<li><strong>${esc(block.minutes)} ${esc(block.title)}</strong> ${esc(block.detail)}</li>`).join("")}</ol>
      <h4>训练目标</h4>${items(course.goals)}
      <h4>适合</h4>${items(course.suitableFor)}
      <h4>不适合</h4>${items(course.notSuitableFor)}
      <h4>场馆提供</h4>${items(course.equipmentProvided)}
      <h4>请自带</h4>${items(course.bring)}
      <h4>费用包含</h4><p>${esc(course.priceIncludes)}</p>
      <h4>注意事项</h4>${paras(course.generalNotes)}
      <h4>取消规则</h4><p>${esc(course.cancelRule)}</p>
      <h4>场次</h4>
      <div class="table-wrap">
        <table>
          <thead><tr><th>时间</th><th>教练</th><th>地点</th><th>等级</th><th>已约 / 容量</th><th>剩余</th><th>价格</th><th>状态</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  </article>`;
}

function sectionBlock(section: (typeof sections)[number]) {
  const image = sectionImages[section.slug];
  const sectionCourses = courses.filter((course) => course.section === section.slug);
  return `<section id="${esc(section.slug)}">
    <header class="hero">
      <img src="${img(image.src)}" alt="${esc(image.alt)}">
      <div>
        <p class="eyebrow">${esc(section.index)} · ${esc(section.englishName)}</p>
        <h2>${esc(section.name)}</h2>
        <p class="lead">${esc(homeLine[section.slug])}</p>
        <p>${esc(section.detail)}</p>
        <p>${esc(section.bookingRule)}</p>
      </div>
    </header>
    ${sectionCourses.map(courseBlock).join("\n")}
  </section>`;
}

const studiosHtml = studios
  .map(
    (studio) => `<li><strong>${esc(studio.short)}</strong> ${esc(studio.city)} · ${esc(studio.kind)}<br>${esc(studio.address)}<br>${esc(studio.transit)} · ${esc(studio.phone)}</li>`,
  )
  .join("");

const coachesHtml = coaches
  .map(
    (coach) => `<li><strong>${esc(coach.name)}</strong> ${esc(coach.title)} · 执教 ${coach.years} 年<br>${esc(coach.credentials.join("、"))}<br>${esc(coach.bio)}</li>`,
  )
  .join("");

const augustRows = august
  .map(
    (item) => `<tr>
      <td>${esc(item.timeLabel)}</td>
      <td>${esc(item.courseName)}</td>
      <td>${esc(item.sectionName)}</td>
      <td>${esc(item.coachName)}</td>
      <td>${esc(item.place)}</td>
      <td>${esc(item.payLabel)}</td>
      <td>${formatBananas(item.bananas)} 根</td>
    </tr>`,
  )
  .join("");

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>超级猫咪</title>
  <style>
    :root {
      --bg: #f6f1e8;
      --card: #fbf8f2;
      --ink: #2d261f;
      --muted: #74685c;
      --line: #e2d6c6;
      --persimmon: #c2410c;
      --moss: #2f6b57;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font: 16px/1.7 "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
    }
    h1, h2, h3, h4 { font-family: "Songti SC", "Noto Serif SC", serif; font-weight: 650; line-height: 1.25; }
    a { color: inherit; }
    header.bar {
      position: sticky; top: 0; z-index: 2;
      display: flex; gap: 16px; align-items: center;
      padding: 12px 20px; border-bottom: 1px solid var(--line);
      background: color-mix(in srgb, var(--bg) 92%, white);
    }
    header.bar strong { font-family: "Songti SC", "Noto Serif SC", serif; font-size: 20px; }
    nav { margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; }
    nav a { text-decoration: none; padding: 4px 12px; border-radius: 999px; font-size: 14px; }
    nav a:hover { background: #efe6d8; }
    main { max-width: 1080px; margin: 0 auto; padding: 24px 16px 80px; }
    .home { display: grid; gap: 12px; }
    @media (min-width: 800px) { .home { grid-template-columns: repeat(3, 1fr); } }
    .home a {
      position: relative; display: block; min-height: 280px; overflow: hidden;
      color: white; text-decoration: none;
    }
    .home img, article > img, .hero img { width: 100%; height: 220px; object-fit: cover; display: block; }
    .home img { position: absolute; inset: 0; height: 100%; }
    .home span { position: absolute; left: 0; right: 0; bottom: 0; padding: 20px; background: linear-gradient(transparent, rgba(30,22,16,.82)); }
    .home strong { display: block; font-family: "Songti SC", "Noto Serif SC", serif; font-size: 40px; }
    section { margin-top: 48px; }
    .hero, article {
      display: grid; gap: 16px; margin-top: 28px;
      background: var(--card); border: 1px solid var(--line);
    }
    @media (min-width: 800px) {
      .hero, article { grid-template-columns: 280px 1fr; }
      .hero img, article > img { height: 100%; min-height: 220px; }
    }
    .hero > div, article > div { padding: 8px 18px 18px; }
    .eyebrow { letter-spacing: .14em; color: var(--muted); font-size: 12px; }
    h2 { font-size: 40px; margin: 0 0 8px; }
    h3 { font-size: 28px; margin: 0; }
    h3 span { display: block; color: var(--muted); font-size: 14px; letter-spacing: .08em; }
    h4 { margin: 18px 0 6px; font-size: 18px; }
    .lead { font-size: 18px; }
    .stats, .rates, .money { display: grid; gap: 12px; }
    @media (min-width: 700px) {
      .stats { grid-template-columns: repeat(3, 1fr); }
      .rates { grid-template-columns: repeat(4, 1fr); }
      .money { grid-template-columns: 1fr 1fr; }
    }
    .card { background: var(--card); border: 1px solid var(--line); padding: 16px; text-align: center; }
    .card b { display: block; color: var(--persimmon); font-family: "Songti SC", "Noto Serif SC", serif; font-size: 42px; font-weight: 650; }
    .card span, .rates strong { display: block; }
    dl { display: grid; gap: 8px; margin: 12px 0; }
    dl div { display: grid; grid-template-columns: 7rem 1fr; gap: 8px; border-top: 1px solid var(--line); padding-top: 8px; }
    dt { color: var(--muted); }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { border-top: 1px solid var(--line); text-align: left; padding: 8px; vertical-align: top; }
    th { color: var(--muted); font-weight: 500; }
    .table-wrap { overflow-x: auto; }
    ul, ol { margin: 6px 0 0; padding-left: 1.2rem; }
    .moss { color: var(--moss); }
  </style>
</head>
<body>
  <header class="bar">
    <strong>超级猫咪</strong>
    <nav>
      <a href="#home">首页</a>
      <a href="#group">团课</a>
      <a href="#personal">私教</a>
      <a href="#open">公开课</a>
      <a href="#membership">会员</a>
      <a href="#training">我的运动</a>
    </nav>
  </header>
  <main>
    <section id="home">
      <h1 class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden">超级猫咪</h1>
      <div class="home">
        ${sections
          .map((section) => {
            const image = sectionImages[section.slug];
            return `<a href="#${section.slug}"><img src="${img(image.src)}" alt="${esc(image.alt)}"><span><strong>${esc(section.name)}</strong>${esc(homeLine[section.slug])}</span></a>`;
          })
          .join("")}
      </div>
    </section>

    ${sections.map(sectionBlock).join("\n")}

    <section id="membership">
      <h2>会员</h2>
      <p>按次付费，没有年卡，也没有自动续费。超猫卡按余额储值。预约团课按当场标价计算应付金额，持卡再打 95 折。</p>
      <div class="stats">
        <div class="card"><span>团课</span><b>¥${GROUP_FROM_PRICE} 起</b><span>当前课表团课的最低价。每节按当场标价计算。</span></div>
        <div class="card"><span>自助健身舱</span><b>¥${GYM_HOUR_PRICE}/小时</b><span>24 小时无人值守。不足 1 小时按 1 小时计。到店进舱。</span></div>
        <div class="card"><span>充值</span><b>¥288 起</b><span>${topUps.map((item) => `¥${item.amount}${item.bonus ? ` 赠 ¥${item.bonus}` : ""}${item.badge ? `（${item.badge}）` : ""}`).join("，")}。</span></div>
      </div>
      <h3>香蕉规则</h3>
      <div class="rates">
        ${bananaRates.map((item) => `<div class="card"><span>${esc(item.name)}</span><strong>${esc(item.rate)}</strong></div>`).join("")}
      </div>
      <p>累计 8 根香蕉，可兑换 1 张 10 元课程优惠券。账户先保留 8 根，超出的部分按每 8 根兑换 1 张。热门团课不能使用优惠券：${esc(hotCourseNames.join("、"))}。</p>
      <h3>会员等级</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>等级</th><th>香蕉</th><th>权益</th></tr></thead>
          <tbody>
            ${tiers.map((tier) => `<tr><td>${esc(tier.name)}</td><td>${tier.points === 0 ? "开始累计" : `${tier.points} 根起`}</td><td>${esc(tier.perk)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <h3>门店</h3>
      <ul>${studiosHtml}</ul>
      <h3>教练</h3>
      <ul>${coachesHtml}</ul>
    </section>

    <section id="training">
      <h2>我的运动</h2>
      <div class="stats">
        <div class="card"><span>训练天数</span><b>${summary.days}</b></div>
        <div class="card"><span>训练次数</span><b>${summary.count}</b></div>
        <div class="card"><span>训练时长</span><b>${summary.minutes}</b><span>分钟</span></div>
      </div>
      <div class="money">
        <div class="card"><span>超猫卡余额</span><b>¥${summary.balance}</b></div>
        <div class="card"><span>剩余香蕉</span><b>${formatBananas(bananas.bananas)} 根</b></div>
      </div>
      <h3>2026年8月</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>时间</th><th>课程</th><th>类型</th><th>教练</th><th>地点</th><th>费用</th><th>香蕉</th></tr></thead>
          <tbody>${augustRows}</tbody>
        </table>
      </div>
    </section>
  </main>
</body>
</html>
`;

writeFileSync(new URL("../public/super-cat.html", import.meta.url), html);
console.log(`wrote public/super-cat.html ${html.length} bytes, courses ${courses.length}, sessions ${views.length}, bananas ${bananas.bananas}, balance ${summary.balance}`);
