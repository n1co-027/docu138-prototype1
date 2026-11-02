const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let DB;try{DB=JSON.parse(localStorage.getItem('b138'))}catch(e){}DB=DB||{users:[],reqs:[],ses:null};
const save=()=>{try{localStorage.setItem('b138',JSON.stringify(DB))}catch(e){}};
const DOCS=[['Barangay Clearance','🪪',0,'Jobs, IDs, loans'],['Certificate of Residency','🏠',0,'Proof of address'],['Certificate of Indigency','🤝',0,'Aid and assistance'],['Business Clearance','🏪',0,'Sari-sari, stalls'],['Barangay ID','🆔',0,'Resident ID card'],['First-Time Job Seeker','💼',0,'First-time applicants']];
const STAT=['Submitted','Under review','Approved','Ready for pickup','Released'];
const SDESC=['We received your request.','A barangay staff member is checking your details.','Your request was approved and the document is being prepared.','Bring a valid ID to the barangay hall on your appointment.','Document claimed. Thank you!'];
const SLOTS=['8:00 AM','9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM'];
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
let S={view:'welcome',step:1,cal:null,id:null,otp:''},V={reg:{},rq:{},lg:{}};
const me=()=>DB.users.find(u=>u.mobile===DB.ses);
const mine=()=>DB.reqs.filter(r=>r.owner===DB.ses).sort((a,b)=>b.t-a.t);
const key=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const nice=k=>new Date(k+'T00:00').toLocaleDateString('en-PH',{weekday:'short',month:'long',day:'numeric',year:'numeric'});
const now=()=>new Date().toLocaleString('en-PH',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const hs=s=>[...s].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7);
const f=(o,k,l,t='text',ph='')=>`<label>${l}<input type="${t}" value="${esc(V[o][k])}" placeholder="${ph}" oninput="V.${o}.${k}=this.value"></label>`;
const sel=(o,k,l,opts)=>`<label>${l}<select onchange="V.${o}.${k}=this.value"><option value="">Select…</option>${opts.map(x=>`<option ${V[o][k]==x?'selected':''}>${x}</option>`).join('')}</select></label>`;
const hdr=(t,back)=>`<div class="top"><button aria-label="Back" onclick="${back}">←</button><h3 style="margin:0">${t}</h3></div>`;
const err=m=>{$('#err').textContent=m;return false};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),3800)}
function go(v,s=1){S.view=v;S.step=s;render();$('#scr').scrollTop=0}
function tab(v){if(v=='request'){V.rq={};S.cal=null}go(v)}

/* ---------- welcome / login ---------- */
function welcome(){return`<div class="hero"><span class="tag">Resident portal</span><h1>Barangay 138</h1><p>Balut, Tondo, Manila · Request documents, book your pickup and follow every step live.</p></div>
<h2>Welcome back</h2><p class="s">Log in with your mobile number.</p>
${f('lg','m','Mobile number','tel','09XX XXX XXXX')}${f('lg','p','Password','password')}
<div class="err" id="err"></div><button class="btn" onclick="login()">Log in</button>
<button class="btn g" onclick="V.reg={};go('register')">Create a resident account</button>`}
function login(){const u=DB.users.find(u=>u.mobile===(V.lg.m||'').replace(/\s/g,'')&&u.pw===V.lg.p);if(!u)return err('Mobile number or password is incorrect.');DB.ses=u.mobile;save();V.lg={};go('home');toast('Welcome back, '+u.first+'!')}

/* ---------- register ---------- */
function register(){const s=S.step,R=V.reg;const bar=`<div class="steps">${[1,2,3,4].map(i=>`<i class="${i<=s?'on':''}"></i>`).join('')}</div>`;let b='';
if(s==1)b=`<h2>About you</h2><p class="s">Use your full name exactly as on your valid ID.</p><div class="row">${f('reg','first','First name')}${f('reg','last','Last name')}</div>${f('reg','mid','Middle name (optional)')}<div class="row">${f('reg','bday','Birthdate','date')}${sel('reg','sex','Sex',['Female','Male'])}</div>${sel('reg','civil','Civil status',['Single','Married','Widowed','Separated'])}${f('reg','mobile','Mobile number','tel','09123456789')}`;
if(s==2)b=`<h2>Where you live</h2><p class="s">Only residents of Barangay 138 can be verified.</p><div class="row">${f('reg','house','House / Unit no.')}${f('reg','street','Street / Purok')}</div><label>Barangay<input value="Barangay 138, Balut, Tondo, Manila" disabled></label>${f('reg','years','Years living here','number','e.g. 5')}${sel('reg','idt','Valid ID',['PhilSys National ID','Driver’s License','Voter’s ID','Postal ID','Student ID','Senior Citizen ID'])}${f('reg','idn','ID number')}`;
if(s==3)b=`<h2>Secure your account</h2><p class="s">At least 8 characters with a number.</p>${f('reg','email','Email (optional)','email')}${f('reg','pw','Password','password')}${f('reg','pw2','Confirm password','password')}<label style="display:flex;gap:10px;align-items:flex-start;font-weight:400;color:var(--ink);margin-top:16px"><input type="checkbox" style="width:20px;margin:2px 0 0" ${R.agree?'checked':''} onchange="V.reg.agree=this.checked">I confirm the details are true and agree to the Data Privacy Notice (RA 10173).</label>`;
if(s==4)b=`<h2>Verify your number</h2><p class="s">We sent a 6-digit code to ${esc(R.mobile)}.</p>${f('reg','otp','Verification code','text','000000')}<button class="btn g" style="margin-top:10px" onclick="sendOtp()">Resend code</button>`;
return hdr('Create account',s>1?`S.step--;render()`:`go('welcome')`)+bar+b+`<div class="err" id="err"></div><button class="btn" onclick="regNext()">${s==4?'Verify & finish':'Continue'}</button>`}
function sendOtp(){S.otp=String(Math.floor(100000+Math.random()*900000));toast('Demo SMS: your Barangay 138 code is '+S.otp)}
function regNext(){const R=V.reg,s=S.step,e=(...k)=>k.some(x=>!(R[x]||'').toString().trim());
if(s==1){if(e('first','last','bday','sex','civil','mobile'))return err('Please fill in all required fields.');R.mobile=R.mobile.replace(/\s/g,'');if(!/^09\d{9}$/.test(R.mobile))return err('Enter a valid 11-digit mobile number starting with 09.');if(DB.users.some(u=>u.mobile===R.mobile))return err('This number is already registered. Try logging in.');if(new Date(R.bday)>new Date(Date.now()-410e9))return err('Residents must be at least 13 years old.')}
if(s==2&&e('house','street','years','idt','idn'))return err('Please complete your address and ID details.');
if(s==3){if((R.pw||'').length<8||!/\d/.test(R.pw))return err('Password needs 8+ characters and a number.');if(R.pw!==R.pw2)return err('Passwords do not match.');if(!R.agree)return err('Please accept the privacy notice to continue.');sendOtp()}
if(s==4){if((R.otp||'').trim()!==S.otp)return err('That code is not correct. Check the SMS and try again.');DB.users.push({...R,otp:'',pw2:'',agree:true,since:now()});DB.ses=R.mobile;save();V.reg={};go('home');return toast('Account verified. Welcome, '+DB.users.at(-1).first+'!')}
S.step++;render()}

/* ---------- home ---------- */
function home(){const u=me(),r=mine(),a=r.find(x=>x.st<4);
return`<div class="hero" style="padding-bottom:24px"><span class="tag">Brgy. 138 · Balut</span><h1 style="font-size:28px">Kumusta, ${esc(u.first)}!</h1><p>What do you need today?</p></div>
<button class="btn" style="margin:0" onclick="tab('request')">＋ Request a document</button>
<h3>Active request</h3>${a?card(a):`<div class="card empty"><big>📭</big>No active requests yet.<br>Start one and it will show up here.</div>`}
<h3>Popular documents</h3><div class="docs">${DOCS.slice(0,4).map((d,i)=>`<button class="doc" onclick="V.rq={doc:${i}};S.cal=null;go('request',2)"><b>${d[1]}</b>${d[0]}<br><span>Free · ${d[3]}</span></button>`).join('')}</div>
<div class="card"><b>Barangay hall hours</b><div class="kv"><span>Mon – Fri</span>8:00 AM – 4:00 PM</div><div class="kv"><span>Sat – Sun</span>Closed</div></div>`}
function card(r){const d=DOCS[r.doc];return`<div class="card" style="cursor:pointer" onclick="S.id='${r.id}';go('detail')"><div style="display:flex;justify-content:space-between;gap:8px"><b>${d[0]}</b><span class="pill ${r.st>=3?'ok':''}">${STAT[r.st]}</span></div><p class="s">${r.id} · ${nice(r.date)}, ${r.time}</p><div class="bar"><i style="width:${(r.st+1)*20}%"></i></div></div>`}

/* ---------- request flow ---------- */
function calUI(){const c=S.cal||(S.cal={y:new Date().getFullYear(),m:new Date().getMonth()}),R=V.rq,t0=new Date();t0.setHours(0,0,0,0);
const n=new Date(c.y,c.m+1,0).getDate();let g=['S','M','T','W','T','F','S'].map(x=>`<b>${x}</b>`).join('')+'<i></i>'.repeat(new Date(c.y,c.m,1).getDay());
for(let d=1;d<=n;d++){const dt=new Date(c.y,c.m,d),k=key(dt),off=dt<t0||dt.getDay()%6==0,full=!off&&(d*7+c.m)%5==0;
g+=`<button class="d ${k==R.date?'sel':''} ${+dt==+t0?'today':''}" ${off||full?'disabled':''} aria-label="${nice(k)}${full?' fully booked':''}" onclick="V.rq.date='${k}';V.rq.time='';render()">${d}${full?'<s></s>':''}</button>`}
const sl=R.date?`<h3 style="font-size:15px">Pick a time · ${nice(R.date)}</h3><div class="slots">${SLOTS.map(t=>{const tk=hs(R.date+t)%4==0;return`<button class="slot ${R.time==t?'sel':''}" ${tk?'disabled':''} onclick="V.rq.time='${t}';render()">${t}</button>`}).join('')}</div>`:`<p class="s" style="margin-top:12px">Select an available date. Dots mark fully booked days.</p>`;
return`<div class="card"><div class="mh"><button class="btn sm g" aria-label="Previous month" onclick="mo(-1)">‹</button><b>${MON[c.m]} ${c.y}</b><button class="btn sm g" aria-label="Next month" onclick="mo(1)">›</button></div><div class="cal">${g}</div></div>${sl}`}
function mo(x){const c=S.cal;c.m+=x;if(c.m>11){c.m=0;c.y++}if(c.m<0){c.m=11;c.y--}render()}
function request(){const s=S.step,R=V.rq,bar=`<div class="steps">${[1,2,3,4].map(i=>`<i class="${i<=s?'on':''}"></i>`).join('')}</div>`;let b='';
if(s==1)b=`<h2>Which document?</h2><p class="s">Choose what you need.</p><div class="docs" style="margin-top:14px">${DOCS.map((d,i)=>`<button class="doc ${R.doc===i?'sel':''}" onclick="V.rq.doc=${i};render()"><b>${d[1]}</b>${d[0]}<br><span>Free · ${d[3]}</span></button>`).join('')}</div>`;
if(s==2)b=`<h2>Details</h2><p class="s">${DOCS[R.doc][0]}</p><label>Purpose<select onchange="V.rq.purpose=this.value"><option value="">Select…</option>${['Employment','School enrollment','Bank / loan','Government transaction','Scholarship','Others'].map(x=>`<option ${R.purpose==x?'selected':''}>${x}</option>`).join('')}</select></label><label>Number of copies<input type="number" min="1" max="5" value="${R.copies||1}" oninput="V.rq.copies=Math.min(5,Math.max(1,+this.value||1))"></label><label>Notes (optional)<textarea rows="3" oninput="V.rq.note=this.value" placeholder="Anything we should know?">${esc(R.note)}</textarea></label>`;
if(s==3)b=`<h2>Book your pickup</h2><p class="s">Choose the day and time you’ll claim your document.</p>${calUI()}`;
if(s==4){const d=DOCS[R.doc],tot=d[2]*(R.copies||1);b=`<h2>Review</h2><div class="card"><div class="kv"><span>Document</span>${d[0]}</div><div class="kv"><span>Purpose</span>${R.purpose}</div><div class="kv"><span>Copies</span>${R.copies||1}</div><div class="kv"><span>Pickup</span>${nice(R.date)}</div><div class="kv"><span>Time</span>${R.time}</div><div class="kv"><span>Fee</span><b>${tot?'₱'+tot+'.00':'Free'}</b></div></div><p class="s" style="margin-top:12px">All barangay documents are free. Just bring one valid ID when you claim yours.</p>`}
return hdr('New request',s>1?`S.step--;render()`:`go('home')`)+bar+b+`<div class="err" id="err"></div><button class="btn" onclick="rqNext()">${s==4?'Submit request':'Continue'}</button>`}
function rqNext(){const R=V.rq,s=S.step;
if(s==1&&R.doc===undefined)return err('Please choose a document.');
if(s==2&&!R.purpose)return err('Please select a purpose.');
if(s==3){if(!R.date)return err('Pick an available date.');if(!R.time)return err('Pick a time slot.')}
if(s==4){const d=new Date(),id='B138-'+String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+Math.floor(1000+Math.random()*9000);
DB.reqs.push({id,owner:DB.ses,doc:R.doc,purpose:R.purpose,copies:R.copies||1,note:R.note||'',date:R.date,time:R.time,st:0,t:Date.now(),last:Date.now(),log:[now()]});save();S.id=id;return go('confirm')}
S.step++;render()}
function confirm_(){const r=DB.reqs.find(x=>x.id==S.id);return`<div style="text-align:center"><div class="ok-big">✓</div><h2>Request submitted</h2><p class="s">Keep your reference number to track progress.</p><div class="card" style="border:2px dashed var(--acc)"><p class="s">Reference number</p><h2 style="margin:4px 0;letter-spacing:.04em">${r.id}</h2></div><div class="card" style="text-align:left"><div class="kv"><span>Document</span>${DOCS[r.doc][0]}</div><div class="kv"><span>Pickup</span>${nice(r.date)}</div><div class="kv"><span>Time</span>${r.time}</div></div></div><button class="btn" onclick="go('detail')">Track this request</button><button class="btn g" onclick="go('home')">Back to home</button>`}

/* ---------- track ---------- */
function track(){const r=mine(),q=(V.lg.q||'').toUpperCase().trim(),list=q?r.filter(x=>x.id.includes(q)):r;
return`<h2>My requests</h2><p class="s">Statuses update automatically.</p><label>Find by reference number<input value="${esc(V.lg.q)}" placeholder="B138-…" oninput="V.lg.q=this.value;render(1)" id="q"></label>${list.length?list.map(card).join(''):`<div class="card empty"><big>🗂️</big>${q?'No request matches that number.':'You haven’t requested anything yet.'}<button class="btn" onclick="tab('request')">Request a document</button></div>`}`}
function detail(){const r=DB.reqs.find(x=>x.id==S.id);if(!r)return track();return hdr(r.id,`go('track')`)+`<div class="card" style="margin-top:0"><b>${DOCS[r.doc][0]}</b> <span class="pill ${r.st>=3?'ok':''}" style="float:right">${STAT[r.st]}</span><div class="bar"><i style="width:${(r.st+1)*20}%"></i></div></div>
<h3>Progress</h3><ul class="tl">${STAT.map((s,i)=>`<li class="${i<r.st?'done':i==r.st?'done cur':''}"><i></i><b>${s}</b><small>${i<=r.st?(r.log[i]||'')+' · '+SDESC[i]:'Pending'}</small></li>`).join('')}</ul>
<div class="card"><b>Pickup appointment</b><div class="kv"><span>Date</span>${nice(r.date)}</div><div class="kv"><span>Time</span>${r.time}</div><div class="kv"><span>Copies / Purpose</span>${r.copies} · ${r.purpose}</div></div>
${r.st<4?`<button class="btn" onclick="V.rq={date:'${r.date}',time:'${r.time}'};S.cal=null;go('resched')">Change appointment</button>`:''}
${r.st<2?`<button class="btn g" onclick="cancel('${r.id}')">Cancel request</button>`:''}
${r.st<3?`<button class="btn g" onclick="adv('${r.id}')">⏩ Demo: advance status now</button>`:''}`}
function resched(){return hdr('Change appointment',`go('detail')`)+`<p class="s">Pick a new date and time for ${esc(S.id)}.</p>${calUI()}<div class="err" id="err"></div><button class="btn" onclick="saveRes()">Confirm new schedule</button>`}
function saveRes(){const R=V.rq;if(!R.date||!R.time)return err('Choose a date and a time slot.');const r=DB.reqs.find(x=>x.id==S.id);r.date=R.date;r.time=R.time;save();toast('Appointment moved to '+nice(R.date)+', '+R.time);go('detail')}
function cancel(id){if(!window.confirm('Cancel this request?'))return;DB.reqs=DB.reqs.filter(x=>x.id!=id);save();toast('Request cancelled.');go('track')}
function adv(id){const r=DB.reqs.find(x=>x.id==id);if(r&&r.st<4){r.st++;r.log[r.st]=now();r.last=Date.now();save();toast(DOCS[r.doc][0]+': '+STAT[r.st]);render(1)}}
setInterval(()=>{DB.reqs.forEach(r=>{if(r.owner==DB.ses&&r.st<3&&Date.now()-r.last>12000)adv(r.id)})},4000);

/* ---------- profile ---------- */
function profile(){const u=me();return`<div class="card" style="text-align:center;margin-top:0"><div class="ok-big" style="background:var(--acc2);color:#17283f;font:800 30px Fraunces;animation:none">${esc(u.first[0]+u.last[0])}</div><h2>${esc(u.first+' '+u.last)}</h2><p class="s">Verified resident · Brgy. 138</p></div>
<div class="card"><div class="kv"><span>Mobile</span>${esc(u.mobile)}</div><div class="kv"><span>Address</span>${esc(u.house+' '+u.street)}</div><div class="kv"><span>Birthdate</span>${esc(u.bday)}</div><div class="kv"><span>ID on file</span>${esc(u.idt)}</div><div class="kv"><span>Requests</span>${mine().length}</div></div>
<button class="btn g" onclick="DB.ses=null;save();go('welcome');toast('Logged out.')">Log out</button>`}

function render(keep){if(DB.ses&&!me())DB.ses=null;const auth=!!DB.ses;if(!auth&&!['welcome','register'].includes(S.view))S.view='welcome';
const v={welcome,register,home,request,confirm:confirm_,track,detail,resched,profile}[S.view];
const y=$('#scr').scrollTop;$('#scr').innerHTML=v();if(keep)$('#scr').scrollTop=y;
if(keep&&$('#q')){const q=$('#q');q.focus();q.setSelectionRange(99,99)}
const tabs=[['home','🏠','Home'],['request','📝','Request'],['track','📍','Track'],['profile','👤','Profile']];
const on=({detail:'track',confirm:'track',resched:'track'})[S.view]||S.view;
$('#nav').hidden=!tabs.some(t=>t[0]==on)&&!['detail','confirm','resched'].includes(S.view)||!auth;
$('#nav').innerHTML=tabs.map(t=>`<button class="${t[0]==on?'on':''}" onclick="tab('${t[0]}')"><b>${t[1]}</b>${t[2]}</button>`).join('')}
S.view=DB.ses&&me()?'home':'welcome';render();
