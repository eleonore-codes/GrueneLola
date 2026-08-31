(function(){
  const test=window.ROTE_LOLA_TEST;
  let mode='practice';
  const $=s=>document.querySelector(s);
  const norm=s=>String(s??'').trim().toLocaleLowerCase('de-DE').replace(/[–—]/g,'-').replace(/\s+/g,' ');
  const accepted=(value,answers)=>answers.some(a=>norm(value)===norm(a));
  const totalParts=()=>test.questions.reduce((n,q)=>n+(q.parts?.length||1),0);
  $('#testTitle').textContent=test.title;
  $('#testSubtitle').textContent=test.subtitle;
  function solution(q){return q.type==='choice'?q.options[q.correct]:q.parts.map(p=>`${p.label}: ${p.answers[0]}`).join(' · ')}
  function render(){
    $('#questions').innerHTML=test.questions.map((q,qi)=>`<article class="question" data-q="${qi}"><span class="points">4 Punkte</span><h2>${qi+1}. ${q.title}</h2><p>${q.prompt}</p>${q.type==='choice'?`<div class="choices">${q.options.map((o,i)=>`<label><input type="radio" name="q${qi}" value="${i}"> ${o}</label>`).join('')}</div>`:`<div class="part-grid">${q.parts.map((p,pi)=>`<div class="part"><label for="q${qi}p${pi}">${p.label}</label><input id="q${qi}p${pi}" data-part="${pi}" autocomplete="off"></div>`).join('')}</div>`}<button class="button secondary question-check${mode==='exam'?' hidden':''}" type="button">Prüfen</button><p class="feedback" aria-live="polite"></p></article>`).join('');
    document.querySelectorAll('.question-check').forEach(b=>b.addEventListener('click',()=>checkQuestion(+b.closest('.question').dataset.q,true)));
    document.querySelectorAll('#questions input').forEach(i=>{i.addEventListener('input',updateProgress);i.addEventListener('change',updateProgress)});
    updateProgress();
  }
  function values(qi){const q=test.questions[qi];if(q.type==='choice'){const x=document.querySelector(`input[name=q${qi}]:checked`);return [x?x.value:'']}return q.parts.map((_,pi)=>$(`#q${qi}p${pi}`).value)}
  function checkQuestion(qi,show){
    const q=test.questions[qi],vals=values(qi);let right=0;
    if(q.type==='choice')right=Number(vals[0])===q.correct?1:0;
    else q.parts.forEach((p,pi)=>{const ok=accepted(vals[pi],p.answers);right+=ok;const el=$(`#q${qi}p${pi}`);el.classList.toggle('correct',ok);el.classList.toggle('wrong',!ok&&show)});
    if(show){const max=q.parts?.length||1;document.querySelector(`[data-q="${qi}"] .feedback`).textContent=right===max?'Richtig!':`Noch nicht ganz. Lösung: ${solution(q)}`}
    return right/(q.parts?.length||1)*4;
  }
  function updateProgress(){let done=0;test.questions.forEach((q,qi)=>{done+=values(qi).filter(Boolean).length});const total=totalParts();$('#progressText').textContent=`${done} von ${total} Feldern bearbeitet`;$('#progressBar').style.width=`${done/total*100}%`}
  function submit(){let score=0;const comp={};test.questions.forEach((q,qi)=>{const pts=checkQuestion(qi,true);score+=pts;(comp[q.competency]??=[]).push(pts/4)});score=Math.round(score*10)/10;const level=score>=36?'sehr sicher':score>=30?'sicher':score>=22?'auf gutem Weg':'noch gezielt üben';$('#result').classList.remove('hidden');$('#result').innerHTML=`<h2>Dein Ergebnis: ${score} von 40 Punkten</h2><p><strong>${level}</strong> – dies ist eine Lernrückmeldung, keine Schulnote.</p><ul>${Object.entries(comp).map(([k,v])=>`<li>${k}: ${Math.round(v.reduce((a,b)=>a+b,0)/v.length*100)} %</li>`).join('')}</ul>`;$('#result').scrollIntoView({behavior:'smooth'})}
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x===b));$('#modeNote').textContent=mode==='practice'?'Du kannst jede Aufgabe sofort prüfen.':'Die Lösungen erscheinen erst nach der Abgabe.';render()}));
  $('#submitTest').addEventListener('click',submit);
  $('#printBlank').addEventListener('click',()=>{document.body.classList.remove('print-solutions');window.print()});
  $('#printSolutions').addEventListener('click',()=>{let box=$('#printSolutionsBox');if(!box){box=document.createElement('section');box.id='printSolutionsBox';box.className='solution-print';box.innerHTML='<h2>Lösungsblatt · '+test.title+'</h2>'+test.questions.map((q,i)=>`<p><strong>${i+1}.</strong> ${solution(q)}</p>`).join('')+'<h3>Bewertungsschlüssel</h3><p>36–40: sehr sicher · 30–35: sicher · 22–29: auf gutem Weg · 0–21: gezielt weiterüben</p>';$('#result').after(box)}document.body.classList.add('print-solutions');window.print()});
  $('#modeNote').textContent='Du kannst jede Aufgabe sofort prüfen.';render();
})();
