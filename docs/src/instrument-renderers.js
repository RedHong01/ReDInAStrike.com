// Reuse the SBH full-bleed field and the portfolio's native table vocabulary.
// Every value comes from the source sheet; no simulated playtest data.
function rules(section, {escapeHtml:e,gddPair:p}) {
  const rewardRows=section.rewardRows.map(r=>`<tr><th scope="row">${e(r[0])}</th>${r.slice(1).map(n=>`<td>${e(n)}</td>`).join("")}</tr>`).join("")
  const highest=Math.max(...section.levelRows.map(r=>r.total))
  const milestones=section.levelRows.filter(r=>[4,8,12,16,20].includes(r.level))
  const bars=section.levelRows.map(r=>`<li class="instrument-level${milestones.includes(r)?" is-milestone":""}"><span class="instrument-level-value">${e(r.total.toLocaleString("en-US"))}</span><span class="instrument-level-track"><i style="height:${r.total/highest*100}%"></i></span><span class="instrument-level-number">${r.level}</span></li>`).join("")
  const milestoneRows=milestones.map(r=>`<tr><th scope="row">${r.level}</th><td>${e(r.unlock)}</td><td>${e(r.reward)}</td></tr>`).join("")
  return `<section class="framer-case-section gdd-section sbh-section instrument-rules-section" aria-label="${e(section.title)}">
    <h2 class="gdd-h2">${e(section.title)}</h2><p class="gdd-intro">${p(section.intro)}</p>
    <div class="sbh-bleed instrument-rules">
      <div class="instrument-rewards"><h3 class="sbh-sub">A song's reward · 一首歌的回报</h3><div class="gdd-table-scroll"><table class="gdd-table"><caption>Coins by performance and difficulty · 表格规划的金币奖励</caption><thead><tr><th scope="col">Result / 表现</th><th scope="col">Easy</th><th scope="col">Medium</th><th scope="col">Hard</th><th scope="col">Boss</th></tr></thead><tbody>${rewardRows}</tbody></table></div><p class="sbh-fig-note">${p({en:"Higher difficulty and a better result receive larger rewards in this draft. Failures still return 50 coins. The prototype's 250-coin result belongs to a different draft.",zh:"这份草案为更高难度与更好表现提供更高回报，失败也获得50金币。原型中250金币的结算属于不同草案。"})}</p></div>
      <div class="instrument-progress"><h3 class="sbh-sub">Twenty levels, new instrument families · 二十关的解锁路线</h3><p class="instrument-chart-unit">Gears per level · 各关齿轮总成本</p><div class="instrument-level-scroll" tabindex="0" role="region" aria-label="Twenty level gear costs"><ol class="instrument-levels">${bars}</ol></div><div class="gdd-table-scroll"><table class="gdd-table"><caption>Milestones in the design sheet · 设计表中的里程碑</caption><thead><tr><th scope="col">Level</th><th scope="col">Unlock / 解锁</th><th scope="col">Reward / 奖励</th></tr></thead><tbody>${milestoneRows}</tbody></table></div><p class="sbh-fig-note">${p({en:"The fourth, eighth, twelfth and sixteenth levels open families. The sixteenth names Brass but rewards a string instrument; that cross-family reward is still an open design detail.",zh:"第4、8、12、16关开放乐器家族。第16关写着开放铜管，却奖励弦乐器；这个跨家族奖励仍需进一步明确。"})}</p></div>
    </div><p class="gdd-note">${p(section.note)}</p>
  </section>`
}
export const instrumentSectionRenderers={"instrument-rules":rules}
