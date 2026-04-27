
/* ═══════════════════════════════════════════════════════════
   COPY/RIGHT-CLICK PROTECTION — runs FIRST, isolated in IIFE
   so nothing else in this file can prevent it from executing.
═══════════════════════════════════════════════════════════ */
(function(){
  try {
    document.addEventListener('copy',function(e){e.preventDefault();if(typeof showToast==='function')showToast();});
    document.addEventListener('cut',function(e){e.preventDefault();if(typeof showToast==='function')showToast();});
    document.addEventListener('contextmenu',function(e){e.preventDefault();if(typeof showToast==='function')showToast('Right-click is disabled on this site.');});
    document.addEventListener('keydown',function(e){
      if(e.ctrlKey&&['c','x','u','s'].indexOf(e.key.toLowerCase())!==-1){
        e.preventDefault();
        if(e.key.toLowerCase()!=='s' && typeof showToast==='function') showToast();
      }
      if(e.key==='F12'){e.preventDefault();}
      if(e.ctrlKey&&e.shiftKey&&['i','j','c'].indexOf(e.key.toLowerCase())!==-1){e.preventDefault();}
    });
    var noSelect=document.createElement('style');
    noSelect.textContent='*{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;} input,textarea,.fi{-webkit-user-select:text!important;-moz-user-select:text!important;user-select:text!important;}';
    document.head.appendChild(noSelect);
  } catch(err) { console.warn('[Proassistanne] Copy protection setup failed:', err); }
})();

/* ═══════════════════════════════════════════════════════════
   DYNAMIC BLOGGER FEED, auto-loads posts from Blogspot
   No editing needed, just publish on Blogger and it updates!
═══════════════════════════════════════════════════════════ */
(function(){
  const BLOG_URL = 'https://proassistanne.blogspot.com';
  const FEED_BASE = BLOG_URL + '/feeds/posts/default?alt=json&max-results=9&callback=bloggerCallback';

  // Card gradient backgrounds (cycles through these for visual variety)
  const GRADIENTS = [
    'linear-gradient(135deg,#1a1820,#2c2838)',
    'linear-gradient(135deg,#1a2a4a,#1877f2)',
    'linear-gradient(135deg,#1c1410,#b5445a)',
    'linear-gradient(135deg,#0a1a10,#22c55e)',
    'linear-gradient(135deg,#1a0a0a,#ff4500)',
    'linear-gradient(135deg,#1a1810,#c8923a)',
    'linear-gradient(135deg,#14181a,#1e2c30)',
    'linear-gradient(135deg,#201418,#302028)',
    'linear-gradient(135deg,#1a1028,#2a1838)',
  ];

  // Pick a category label from the post's labels array
  function getCategory(entry){
    if(entry.category && entry.category.length > 0){
      return entry.category[0].term;
    }
    return 'Blog';
  }

  // Strip HTML tags from content for excerpt
  function stripHTML(html){
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  // Get post thumbnail, try media:thumbnail, then first <img> in content
  function getThumbnail(entry){
    if(entry['media$thumbnail']){
      let url = entry['media$thumbnail'].url;
      // Upgrade to larger size if it's a small blogspot image
      url = url.replace('/s72-c/', '/s400-c/');
      return url;
    }
    // Try to pull first image from content
    if(entry.content && entry.content.$t){
      const match = entry.content.$t.match(/<img[^>]+src=["']([^"']+)["']/i);
      if(match) return match[1];
    }
    return null;
  }

  // Get the post URL
  function getPostURL(entry){
    const links = entry.link || [];
    for(const link of links){
      if(link.rel === 'alternate') return link.href;
    }
    return BLOG_URL;
  }

  // Format date nicely
  function formatDate(dateStr){
    try{
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
    } catch(e){ return ''; }
  }

  function buildCard(entry, index){
    const title = entry.title.$t;
    const url = getPostURL(entry);
    const category = getCategory(entry);
    const dateStr = formatDate(entry.published.$t);
    const rawContent = entry.content ? entry.content.$t : (entry.summary ? entry.summary.$t : '');
    const excerpt = stripHTML(rawContent).slice(0,160).trim() + '...';
    const thumb = getThumbnail(entry);
    const gradient = GRADIENTS[index % GRADIENTS.length];

    const imgHTML = thumb
      ? `<img src="${thumb}" alt="${title}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const iconHTML = `<div style="position:absolute;inset:0;display:${thumb?'none':'flex'};align-items:center;justify-content:center;font-size:42px;">📝</div>`;

    return `<a href="${url}" target="_blank" rel="noopener" class="blog-card">
      <div class="blog-card-img" style="background:${gradient};height:190px;position:relative;overflow:hidden;">
        ${imgHTML}
        ${iconHTML}
      </div>
      <div class="blog-card-body">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <div class="blog-card-cat">${category}</div>
          ${dateStr ? `<span style="font-size:10px;color:var(--mist);">${dateStr}</span>` : ''}
        </div>
        <div class="blog-card-title">${title}</div>
        <p class="blog-card-excerpt">${excerpt}</p>
        <div class="blog-card-read">Read on Blogspot →</div>
      </div>
    </a>`;
  }

  function processData(data){
    const grid   = document.getElementById('blogGrid');
    const status = document.getElementById('blogStatus');
    const fallback = document.getElementById('blogFallback');
    const viewAll = document.getElementById('blogViewAll');
    if(!grid) return;
    try {
      const entries = data.feed.entry || [];
      if(entries.length === 0){
        status.textContent = 'No posts found yet, check back soon!';
        fallback.style.display = 'block';
        return;
      }
      status.textContent = entries.length + ' posts loaded from Blogspot';
      status.style.color = '#22c55e';
      grid.innerHTML = entries.map((e,i) => buildCard(e,i)).join('');
      if(viewAll) viewAll.style.display = 'block';
      if(typeof checkReveal === 'function') setTimeout(checkReveal, 100);
    } catch(err){
      showBlogFallback();
    }
  }

  function showBlogFallback(){
    const grid = document.getElementById('blogGrid');
    const status = document.getElementById('blogStatus');
    const fallback = document.getElementById('blogFallback');
    if(status) status.textContent = 'Could not load posts, visit Blogspot directly.';
    if(grid) grid.style.display = 'none';
    if(fallback) fallback.style.display = 'block';
  }

  // Use JSONP to bypass CORS restrictions on Blogger feed
  function loadBlogFeed(){
    const grid = document.getElementById('blogGrid');
    const status = document.getElementById('blogStatus');
    if(!grid) return;

    // Remove any old callback script
    const old = document.getElementById('bloggerScript');
    if(old) old.remove();

    // Create global callback for JSONP
    window.bloggerCallback = function(data){
      processData(data);
      // Cleanup
      delete window.bloggerCallback;
      const s = document.getElementById('bloggerScript');
      if(s) s.remove();
    };

    // Set a timeout in case script fails silently
    const timeout = setTimeout(function(){
      if(window.bloggerCallback){
        delete window.bloggerCallback;
        showBlogFallback();
      }
    }, 8000);

    // Also clear timeout on success
    const origCallback = window.bloggerCallback;
    window.bloggerCallback = function(data){
      clearTimeout(timeout);
      origCallback(data);
    };

    const script = document.createElement('script');
    script.id = 'bloggerScript';
    script.src = FEED_BASE;
    script.onerror = function(){
      clearTimeout(timeout);
      delete window.bloggerCallback;
      showBlogFallback();
    };
    document.head.appendChild(script);
  }

  // Load feed when blog page becomes visible
  document.addEventListener('DOMContentLoaded', function(){
    if(document.getElementById('page-blog') && document.getElementById('page-blog').classList.contains('active')){
      loadBlogFeed();
    }
  });

  // Expose so P() can call it
  window.loadBlogFeed = loadBlogFeed;
  window._blogLoaded = false;
})();

function connectCalLoaded(){
  const f=document.getElementById('connectCalFallback');
  if(f)f.style.display='none';
}
function connectCalFailed(){
  const f=document.getElementById('connectCalFallback');
  const fr=document.getElementById('connectCalFrame');
  if(f)f.style.display='block';
  if(fr)fr.style.display='none';
}
/* ═══════════════════════════════════════════════════════════
   PAGE NAVIGATION — multi-file version
   Maps the old short ID (e.g. 'about') to the new HTML filename.
   This keeps every existing onclick="P('xxx')" call working.
═══════════════════════════════════════════════════════════ */
var PAGE_MAP = {
  'home':          'index.html',
  'about':         'about.html',
  'hire':          'hire-me.html',
  'port':          'portfolio.html',
  'smm-portfolio': 'social-media-work.html',
  'designs':       'design-feed.html',
  'blog':          'blog.html',
  'connect':       'connect.html',
  'resources':     'resources.html',
  'contact':       'contact.html'
};
function P(id){
  var file = PAGE_MAP[id];
  if(file){ window.location.href = file; }
}
function TM(){document.getElementById('mn').classList.toggle('open');}
function ST(id,btn){document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('on'));document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('on'));btn.classList.add('on');document.getElementById('t-'+id).classList.add('on');}
function SH(h,btn){
  document.querySelectorAll('.htog').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('s-t').textContent='$'+(5*h)+' total · '+h+' hrs';
  document.getElementById('p-t').textContent='$'+(8*h)+' total · '+h+' hrs';
  document.getElementById('e-t').textContent='$'+(12*h)+' total · '+h+' hrs';
  document.getElementById('e-av').textContent=h===10?'Monday to Saturday':'Monday to Friday';
  document.getElementById('e-note').textContent=h===10?'10 hr block · Saturday included':'Saturday available · No Sundays';
}
function TF(btn){const a=btn.nextElementSibling,i=btn.querySelector('.faq-ico');a.classList.toggle('open');i.classList.toggle('spin');}
function FP(cat,btn){
  document.querySelectorAll('#page-port .fil').forEach(b=>{
    b.classList.remove('on');
    b.style.background='transparent';
    b.style.color='var(--stone)';
    b.style.borderColor='var(--border)';
  });
  btn.classList.add('on');
  btn.style.background='var(--ink)';
  btn.style.color='#fff';
  btn.style.borderColor='var(--ink)';
  document.querySelectorAll('#page-port .port-card').forEach(c=>{
    c.classList.toggle('hide', cat!=='all' && c.dataset.c!==cat);
  });
}

/* DESIGN FEED FILTER */
function filterDF(cat,btn){
  document.querySelectorAll('.dfcat').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('.df-card').forEach(c=>{
    const show=cat==='all'||c.dataset.df===cat;
    c.classList.toggle('df-hidden',!show);
    c.style.opacity=show?'1':'0';
    if(show)setTimeout(()=>{c.style.opacity='1';},50);
  });
}
/* SMM PORTFOLIO FILTER */
function filterSMM(cat,btn){
  document.querySelectorAll('#smmGrid .smm-card').forEach(c=>{
    const show=cat==='all'||c.dataset.smm===cat;
    c.style.display=show?'flex':'none';
  });
  document.querySelectorAll('#page-smm-portfolio .fil').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
}

async function handleForm(e,formId,successId,btnId){
  e.preventDefault();
  const btn=document.getElementById(btnId);
  const span=btn.querySelector('span')||btn;
  span.textContent='Sending...';btn.disabled=true;
  try{
    const res=await fetch(e.target.action,{method:'POST',body:new FormData(e.target),headers:{Accept:'application/json'}});
    if(res.ok){document.getElementById(formId).style.display='none';document.getElementById(successId).style.display='block';}
    else{span.textContent='Send Message';btn.disabled=false;alert('Please email me at ajtmendoza123@gmail.com');}
  }catch{span.textContent='Send Message';btn.disabled=false;alert('Please email me at ajtmendoza123@gmail.com');}
}
/* CAROUSEL — only runs if carousel elements exist on the current page */
var carIdx=0,carTotal=document.querySelectorAll('.testi-slide').length,carTimer,carProgressTimer,carProgress=0;
function buildDots(){const d=document.getElementById('carDots');if(!d)return;d.innerHTML='';for(let i=0;i<carTotal;i++){const dot=document.createElement('button');dot.className='car-dot'+(i===0?' on':'');dot.onclick=()=>{goCar(i);resetAuto();};d.appendChild(dot);}}
function updateCar(){const tr=document.getElementById('carTrack');if(!tr)return;tr.style.transform='translateX(-'+carIdx+'00%)';document.querySelectorAll('.car-dot').forEach((d,i)=>d.classList.toggle('on',i===carIdx));const cc=document.getElementById('carCount');if(cc)cc.textContent=(carIdx+1)+' / '+carTotal;}
function moveCar(dir){if(!carTotal)return;carIdx=(carIdx+dir+carTotal)%carTotal;updateCar();resetAuto();}
function goCar(i){carIdx=i;updateCar();}
function resetAuto(){clearInterval(carTimer);clearInterval(carProgressTimer);carProgress=0;const bar=document.getElementById('carBar');if(bar){bar.style.transition='none';bar.style.width='0%';}startAuto();}
function startAuto(){if(!carTotal)return;carTimer=setInterval(()=>{carIdx=(carIdx+1)%carTotal;updateCar();carProgress=0;},5500);carProgressTimer=setInterval(()=>{carProgress+=100/(5500/100);if(carProgress>100)carProgress=0;const bar=document.getElementById('carBar');if(bar){bar.style.transition='width 0.1s linear';bar.style.width=carProgress+'%';}},100);}
/* Only initialize the carousel if it exists on this page */
if(carTotal>0 && document.getElementById('carDots')){buildDots();updateCar();startAuto();}
const cw=document.querySelector('.carousel-wrap');
if(cw){cw.addEventListener('mouseenter',()=>{clearInterval(carTimer);clearInterval(carProgressTimer);});cw.addEventListener('mouseleave',()=>{resetAuto();});}
let tX=0;const ct=document.querySelector('.carousel-track');
if(ct){ct.addEventListener('touchstart',e=>{tX=e.touches[0].clientX;},{passive:true});ct.addEventListener('touchend',e=>{const diff=tX-e.changedTouches[0].clientX;if(Math.abs(diff)>50)moveCar(diff>0?1:-1);},{passive:true});}
/* SCROLL REVEAL */
function checkReveal(){document.querySelectorAll('.reveal,.reveal-left,.reveal-scale').forEach(el=>{if(el.getBoundingClientRect().top<window.innerHeight-60)el.classList.add('visible');});}
window.addEventListener('scroll',checkReveal,{passive:true});
window.addEventListener('resize',checkReveal,{passive:true});
/* Run multiple times so above-the-fold reveals always trigger on page load */
checkReveal();
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',checkReveal);
}
window.addEventListener('load',function(){
  checkReveal();
  /* Safety net: force-show any remaining reveal elements after 500ms */
  setTimeout(function(){
    document.querySelectorAll('.reveal,.reveal-left,.reveal-scale').forEach(el=>el.classList.add('visible'));
  },500);
});
/* NAV SHADOW */
window.addEventListener('scroll',()=>{document.getElementById('mainNav').classList.toggle('scrolled',window.scrollY>20);},{passive:true});
/* INSTAGRAM auto-load */
const instaGrid=document.getElementById('instaGrid');
if(instaGrid){['insta1.jpg','insta2.jpg','insta3.jpg','insta4.jpg'].forEach((src,i)=>{const item=instaGrid.children[i];if(!item)return;const img=new Image();img.onload=()=>{item.innerHTML='<img src="images/'+src+'" style="width:100%;height:100%;object-fit:cover;"><div class="insta-overlay"><span class="insta-icon">📷</span></div>';item.className='insta-item';};img.src='images/'+src;});}
window.addEventListener('resize',()=>{if(window.innerWidth>768)document.getElementById('mn').classList.remove('open');},{passive:true});

/* ── PROJECT MODAL ── */
const PROJECTS = {
  exec1:{cat:'Executive VA',title:'Client Portal Setup',img:'images/project1.jpg',icon:'📁',desc:'Built a comprehensive ClickUp workspace for a US based entrepreneur, including custom task lists, automated status updates, team onboarding documentation, and recurring workflow templates. The client saved 8+ hours per week from manual task tracking.',tags:['ClickUp','Automation','Project Management','Onboarding','SOPs'],
    samples:null},
  social1:{cat:'Social Media',title:'Instagram Growth Strategy',img:'images/project2.jpg',icon:'📱',desc:'Developed and executed a full Instagram growth strategy including content planning, caption writing, hashtag research, story scheduling, and community engagement. The account saw consistent monthly follower growth and a 3x increase in engagement rate within 60 days.',tags:['Instagram','Canva','Content Calendar','Community Management','Analytics'],
    samples:null},
  email2:{cat:'Email Management',title:'Inbox & Email Management',img:'images/project3.jpg',icon:'📬',desc:'Set up a complete inbox management system for a busy CEO, including folder structure, filter rules, canned response templates, priority labeling, and a zero inbox workflow. Reduced email response time from 3 days to under 4 hours.',tags:['Gmail','Inbox Zero','Email Templates','Filters','Executive Support'],
    samples:'INBOX_DATA'},
  email1:{cat:'Email Marketing',title:'Mailchimp Welcome Sequence',img:'images/project4.jpg',icon:'✉',desc:'Designed and launched a 5 email welcome sequence for a wellness brand, including copywriting, design using brand guidelines, list segmentation, AB subject line testing, and performance tracking. Achieved a 42% average open rate against the industry benchmark of 21%.',tags:['Mailchimp','Email Copywriting','Automation','Segmentation','AB Testing'],
    samples:'MAILCHIMP_DATA'},
  exec2:{cat:'Executive VA',title:'GoHighLevel Sales Funnel',img:'images/project5.jpg',icon:'⚙',desc:'Built a complete lead generation funnel in GoHighLevel, landing page, opt-in form, automated SMS and email follow up sequences, CRM pipeline stages, and appointment booking integration. The client converted 18% of leads into discovery calls within the first month.',tags:['GoHighLevel','CRM','Funnel Builder','Email Automation','Lead Generation'],
    samples:'GHL_DATA'},
  social2:{cat:'Social Media',title:'Content Calendar System',img:'images/project6.jpg',icon:'📅',desc:'Created a 3 month editorial content calendar with 90 post ideas, platform-specific captions, 30 reusable Canva templates, and a scheduling system via Buffer. The brand maintained a consistent daily posting rhythm across Instagram, Facebook, and LinkedIn.',tags:['Canva','Buffer','Content Strategy','Editorial Calendar','Brand Design'],
    samples:'CALENDAR_DATA'},
  exec3:{cat:'Executive VA',title:'Trello Board Setup',img:'images/project7.jpg',icon:'📋',desc:'Designed a custom Trello project management system for a remote team of 6, including department-specific boards, card templates with checklists, due date Power Ups, and a master overview dashboard. Team task completion rate improved by 40% within the first month of use.',tags:['Trello','Remote Team','Project Management','Workflows','Power Ups'],
    samples:null},
  exec4:{cat:'Executive VA',title:'Notion Workspace Setup',img:'images/project8.jpg',icon:'🗂',desc:'Built a fully customized Notion OS for a solopreneur, including a client CRM database, active project tracker, linked SOP library, weekly planner template, and content ideas vault. Everything connected with relations and rollups for a single source of truth.',tags:['Notion','Database','SOP Library','Client CRM','Productivity System'],
    samples:null},
  books1:{cat:'Organization & Systems',title:'Google Sheets Master Tracker',img:'images/project9.jpg',icon:'📊',desc:'Built a clean, all in one Google Sheets tracker to keep everything organized, active tasks with status tags, client notes and follow up reminders, project deadlines with color coded priority levels, and a weekly progress overview. One well structured sheet that shows exactly where everything stands at a glance, no extra tools needed.',tags:['Google Sheets','Task Tracking','Organization','Status Tags','Color Coding'],
    samples:'SHEETS_DATA'},
  gdrive1:{cat:'Organization & Systems',title:'Google Drive Organization',img:'images/project10.jpg',icon:'📂',desc:'Took a messy, years-old Google Drive and rebuilt it from scratch, with a clear top level folder structure, consistent naming conventions, color coded folders by client or department, a master index document pinned at the top, and shared permissions set correctly per person. The client went from "I can never find anything" to locating any file in under 10 seconds.',tags:['Google Drive','Folder Structure','Naming Conventions','Permissions','File Organization'],
    samples:'GDRIVE_DATA'},
  sop1:{cat:'Executive VA',title:'SOP & Documentation Library',img:'images/project11.jpg',icon:'📝',desc:'Documented a full set of Standard Operating Procedures for a client\'s most common recurring tasks, client onboarding, weekly reporting, social media posting, and inbox triage. Each SOP includes step by step instructions with screenshots, a "who does what" section, and a checklist version for quick reference. The library is stored in Notion so the team can search, update, and access it anytime.',tags:['SOPs','Notion','Documentation','Process Design','Team Enablement'],
    samples:null},
  crm1:{cat:'Executive VA',title:'CRM Pipeline Setup',img:'images/project12.jpg',icon:'🗃',desc:'Set up a complete CRM pipeline in HubSpot for a service-based business starting from scratch, defined custom deal stages matching their real sales process, created contact and company properties for tracking key details, set up task reminders and email sequences for follow ups, and built an automated onboarding workflow triggered when a deal is marked "Won." The client closed 30% more deals simply by having a clear system to follow.',tags:['HubSpot','CRM','Pipeline','Automation','Lead Management'],
    samples:'CRM_DATA'},
  blog1:{cat:'Blog & Articles',title:'Blog & Article Writing',img:'images/projectblog1.jpg',icon:'✍️',desc:'Crafted keyword rich blog articles, SEO content, and newsletter copy for clients across wellness, real estate, and business coaching. Every piece was researched thoroughly, written in the client brand voice, and optimized for organic reach. Newsletter campaigns consistently boosted open rates and positioned clients as go-to authorities in their space.',tags:['Blog Writing','SEO','Newsletter','Copywriting','Content Strategy'],
    samples:'BLOG_DATA'},
  blog3:{cat:'Blog & Articles',title:'SEO Content Strategy',img:'images/projectblog3.jpg',icon:'🔍',desc:'Developed a complete SEO content strategy for a B2B coaching brand, keyword research using Semrush, competitor gap analysis, pillar page planning, and a 3-month editorial calendar with 36 optimized articles. Organic search traffic grew by 60% within the first quarter. Each article was written in the client\'s exact brand voice and formatted for both readability and search ranking.',tags:['SEO Writing','Keyword Research','Content Strategy','Semrush','Editorial Calendar'],
    samples:'SEO_DATA'},
  blog2:{cat:'Blog & Articles',title:'Newsletter & Long-Form Content',img:'images/projectblog2.jpg',icon:'📝',desc:'Wrote compelling newsletter copy and long form articles that kept subscribers engaged, boosted open rates, and positioned clients as thought leaders. Covered topics ranging from business tips to lifestyle content, always tailored to the specific audience and brand voice. Newsletters consistently performed above industry averages.',tags:['Newsletter','Copywriting','Long Form Content','Email','Thought Leadership'],
    samples:'NEWSLETTER_DATA'},
  web1:{cat:'Web Design',title:'Personal Portfolio Site',img:'images/web1.jpg',icon:'🌐',desc:'Designed and built a clean, elegant personal portfolio website from scratch, no templates used. The site showcases the client\'s services, case studies, testimonials, and contact details in a professional, mobile-responsive layout. Built using HTML, CSS, and light JavaScript. The client received their first inquiry within a week of going live.',tags:['HTML/CSS','Web Design','Portfolio','Mobile-Responsive','WordPress'],
    samples:null},
  web2:{cat:'Web Design',title:'Business Landing Page',img:'images/web2.jpg',icon:'🌐',desc:'Designed a conversion-focused landing page for a small service-based business. The page highlights core services with compelling copy, features a social proof section with real client testimonials, and ends with a clear, action-driving call-to-action. The client reported a 35% increase in inquiry messages within the first month of the new page going live.',tags:['Landing Page','Web Design','Conversion Optimization','Copywriting','Canva/Elementor'],
    samples:null},
  web3:{cat:'Web Design',title:'VA Services Page',img:'images/web3.jpg',icon:'🌐',desc:'Built a simple and elegant virtual assistant services page from the ground up, no pre-made templates. Includes a personalized about section, a services breakdown with pricing indicators, a featured testimonials block, and a contact form integrated directly into the page. Clean, professional, and easy to update by the client after handover.',tags:['Web Design','HTML/CSS','Services Page','VA Portfolio','WordPress/Wix'],
    samples:null},
  email3:{cat:'Email Marketing',title:'ActiveCampaign Automation System',img:'images/projectemail3.jpg',icon:'🔄',desc:'Built a complete email automation ecosystem in ActiveCampaign for a business coach, welcome drip sequence, post-purchase onboarding flow, re-engagement campaign for cold subscribers, and a referral nurture sequence. Set up subscriber tagging, lead scoring, and a weekly performance dashboard tracking open rates, click rates, and revenue per email. The system runs fully on autopilot with zero manual sending required.',tags:['ActiveCampaign','Email Automation','Drip Sequence','Subscriber Tagging','Analytics'],
    samples:'ACTIVECAMPAIGN_DATA'},
  yt1:{cat:'YouTube & TikTok',title:'YouTube Channel Management',img:'images/projectyt1.jpg',icon:'▶️',desc:'Managed full YouTube channel operations for a personal brand, including writing SEO optimized titles and descriptions, coordinating thumbnail creation, scheduling uploads, moderating comments, and tracking analytics weekly. The channel saw consistent subscriber growth and improved watch time over a 3 month period.',tags:['YouTube','SEO','Video Management','Analytics','Content Scheduling'],
    samples:null},
  tt1:{cat:'YouTube & TikTok',title:'TikTok Content Strategy',img:'images/projecttt1.jpg',icon:'♪',desc:'Built a TikTok content strategy from the ground up for a lifestyle brand. Researched trending audio, wrote punchy captions, developed a hashtag strategy, and created a weekly posting schedule. The account grew organically through consistent, strategic posting and community engagement.',tags:['TikTok','Content Strategy','Trending Audio','Hashtags','Social Growth'],
    samples:null}
};

/* PROJECT CAROUSEL */
var projKeys=Object.keys(PROJECTS);
var projIdx=0;
/* Map of sample data string names to actual arrays, resolved at render time */
var SAMPLE_MAP = {
  INBOX_DATA:null, MAILCHIMP_DATA:null, GHL_DATA:null, CALENDAR_DATA:null,
  SHEETS_DATA:null, GDRIVE_DATA:null, CRM_DATA:null, BLOG_DATA:null,
  SEO_DATA:null, NEWSLETTER_DATA:null, ACTIVECAMPAIGN_DATA:null
};
/* Populate SAMPLE_MAP after arrays are defined (they are defined below) */
function initSampleMap(){
  SAMPLE_MAP.INBOX_DATA=typeof INBOX_DATA!=='undefined'?INBOX_DATA:null;
  SAMPLE_MAP.MAILCHIMP_DATA=typeof MAILCHIMP_DATA!=='undefined'?MAILCHIMP_DATA:null;
  SAMPLE_MAP.GHL_DATA=typeof GHL_DATA!=='undefined'?GHL_DATA:null;
  SAMPLE_MAP.CALENDAR_DATA=typeof CALENDAR_DATA!=='undefined'?CALENDAR_DATA:null;
  SAMPLE_MAP.SHEETS_DATA=typeof SHEETS_DATA!=='undefined'?SHEETS_DATA:null;
  SAMPLE_MAP.GDRIVE_DATA=typeof GDRIVE_DATA!=='undefined'?GDRIVE_DATA:null;
  SAMPLE_MAP.CRM_DATA=typeof CRM_DATA!=='undefined'?CRM_DATA:null;
  SAMPLE_MAP.BLOG_DATA=typeof BLOG_DATA!=='undefined'?BLOG_DATA:null;
  SAMPLE_MAP.SEO_DATA=typeof SEO_DATA!=='undefined'?SEO_DATA:null;
  SAMPLE_MAP.NEWSLETTER_DATA=typeof NEWSLETTER_DATA!=='undefined'?NEWSLETTER_DATA:null;
  SAMPLE_MAP.ACTIVECAMPAIGN_DATA=typeof ACTIVECAMPAIGN_DATA!=='undefined'?ACTIVECAMPAIGN_DATA:null;
}
function openProject(id){
  projIdx=projKeys.indexOf(id);
  if(projIdx<0)projIdx=0;
  renderProject();
  document.getElementById('projModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function renderProject(){
  const id=projKeys[projIdx];
  const p=PROJECTS[id];if(!p)return;

  // Banner gradient per category
  const bannerGradients={
    'Executive VA':'linear-gradient(135deg,#1a1820,#2a2040)',
    'Email Marketing':'linear-gradient(135deg,#251410,#422010)',
    'Blog & Articles':'linear-gradient(135deg,#1a1820,#2c2838)',
    'Organization & Systems':'linear-gradient(135deg,#14181a,#1e2c30)',
    'Social Media':'linear-gradient(135deg,#201a14,#302a1c)',
    'Web Design':'linear-gradient(135deg,#18201c,#223028)',
    'YouTube & TikTok':'linear-gradient(135deg,#1c0a0a,#300a0a)'
  };
  const bg = bannerGradients[p.cat] || 'linear-gradient(135deg,#1a1410,#2c2018)';

  const banner=document.getElementById('projModalBanner');
  if(banner){ banner.style.background=bg; }
  const iconEl=document.getElementById('projModalIcon');
  if(iconEl){ iconEl.textContent=p.icon||'📋'; }
  const bannerCat=document.getElementById('projModalBannerCat');
  if(bannerCat){ bannerCat.textContent=p.cat; }

  document.getElementById('projModalCat').textContent=p.cat;
  document.getElementById('projModalTitle').textContent=p.title;
  document.getElementById('projModalDesc').textContent=p.desc;
  const tagsEl=document.getElementById('projModalTags');
  tagsEl.innerHTML=p.tags.map(t=>'<span class="proj-modal-tag">'+t+'</span>').join('');

  /* Work Samples */
  const samplesWrap=document.getElementById('projModalSamplesWrap');
  const samplesGrid=document.getElementById('projModalSamplesGrid');
  if(samplesWrap && samplesGrid){
    const sData = p.samples ? (SAMPLE_MAP[p.samples]||null) : null;
    if(sData && sData.length){
      samplesWrap.style.display='block';
      samplesGrid.innerHTML='';
      renderSampleCards(sData,'projModalSamplesGrid');
    } else {
      samplesWrap.style.display='none';
    }
  }

  const counter=document.getElementById('projCounter');
  if(counter)counter.textContent=(projIdx+1)+' / '+projKeys.length;
  const box=document.getElementById('projModalBox');
  box.style.transition='none';box.style.opacity='0';
  setTimeout(()=>{box.style.transition='opacity 0.25s ease';box.style.opacity='1';},10);
}
function navProject(dir){
  projIdx=(projIdx+dir+projKeys.length)%projKeys.length;
  renderProject();
  document.getElementById('projModalBox').scrollTop=0;
}
function closeProject(e){if(e.target===document.getElementById('projModal'))closeProjectDirect();}
function closeProjectDirect(){document.getElementById('projModal').classList.remove('open');document.body.style.overflow='';}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeProjectDirect();
  if(document.getElementById('projModal').classList.contains('open')){
    if(e.key==='ArrowLeft')navProject(-1);
    if(e.key==='ArrowRight')navProject(1);
  }
});

/* ── COPY PROTECTION (early + bulletproof) ── */
(function(){
  try {
    document.addEventListener('copy',function(e){e.preventDefault();if(typeof showToast==='function')showToast();});
    document.addEventListener('cut',function(e){e.preventDefault();if(typeof showToast==='function')showToast();});
    document.addEventListener('contextmenu',function(e){e.preventDefault();if(typeof showToast==='function')showToast('Right-click is disabled on this site.');});
    document.addEventListener('keydown',function(e){
      // Disable Ctrl+C, Ctrl+X, Ctrl+U (view source), Ctrl+S, F12, Ctrl+Shift+I/J/C
      if(e.ctrlKey&&['c','x','u','s'].indexOf(e.key.toLowerCase())!==-1){
        e.preventDefault();
        if(e.key.toLowerCase()!=='s' && typeof showToast==='function') showToast();
      }
      if(e.key==='F12'){e.preventDefault();}
      if(e.ctrlKey&&e.shiftKey&&['i','j','c'].indexOf(e.key.toLowerCase())!==-1){e.preventDefault();}
    });
    // Disable text selection via CSS injection
    var noSelect=document.createElement('style');
    noSelect.textContent='*{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;} input,textarea,.fi{-webkit-user-select:text!important;-moz-user-select:text!important;user-select:text!important;}';
    document.head.appendChild(noSelect);
  } catch(err) { console.warn('[Proassistanne] Copy protection setup failed:', err); }
})();

// Toast notification
function showToast(msg){
  const existing=document.getElementById('copyToast');
  if(existing)existing.remove();
  const toast=document.createElement('div');
  toast.id='copyToast';
  toast.innerHTML='<div style="display:flex;align-items:center;gap:12px;"><span style="font-size:20px;">🔒</span><div><div style="font-weight:600;font-size:13px;margin-bottom:2px;">Content Protected</div><div style="font-size:12px;opacity:0.8;">'+(msg||'This content is protected by Proassistanne. Please respect intellectual property.')+'</div></div></div>';
  toast.style.cssText='position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1a1410;color:#fff;padding:18px 26px;border-radius:4px;z-index:9999;font-family:"Poppins",sans-serif;max-width:420px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.3);animation:toastIn 0.35s ease forwards;border-left:3px solid #b5445a;';
  const style=document.createElement('style');
  style.textContent='@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}@keyframes toastOut{from{opacity:1;}to{opacity:0;}}';
  document.head.appendChild(style);
  document.body.appendChild(toast);
  setTimeout(()=>{toast.style.animation='toastOut 0.3s ease forwards';setTimeout(()=>toast.remove(),300);},3500);
}

/* ── FLOATING AVAILABILITY BADGE ── */
setTimeout(()=>{
  const badge=document.getElementById('floatBadge');
  if(badge){badge.classList.add('show');badge.style.pointerEvents='auto';}
},2000);

/* ── BACK TO TOP BUTTON ── */
const backTop=document.createElement('button');
backTop.innerHTML='↑';
backTop.id='backTop';
backTop.style.cssText='position:fixed;bottom:28px;right:28px;width:44px;height:44px;background:#1a1410;color:#fff;border:none;font-size:18px;font-family:"Poppins",sans-serif;cursor:pointer;opacity:0;transition:opacity 0.3s,background 0.2s;z-index:400;display:flex;align-items:center;justify-content:center;border-radius:2px;';
backTop.title='Back to top';
backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
backTop.addEventListener('mouseenter',()=>backTop.style.background='#b5445a');
backTop.addEventListener('mouseleave',()=>backTop.style.background='#1a1410');
document.body.appendChild(backTop);
window.addEventListener('scroll',()=>{backTop.style.opacity=window.scrollY>300?'1':'0';},{passive:true});

/* ── READING PROGRESS BAR ── */
const prog=document.createElement('div');
prog.style.cssText='position:fixed;top:66px;left:0;height:2px;background:#b5445a;width:0%;z-index:499;transition:width 0.1s;';
prog.id='readProg';
document.body.appendChild(prog);
window.addEventListener('scroll',()=>{
  const page=document.querySelector('.page.active');
  if(!page)return;
  const h=document.documentElement.scrollHeight-window.innerHeight;
  prog.style.width=(h>0?Math.min(100,(window.scrollY/h)*100):0)+'%';
},{passive:true});

/* ── HERO TYPING ANIMATION ── */
// Subtly animate the tagline on first load
setTimeout(()=>{
  const tagline=document.querySelector('.hero-tagline');
  if(tagline&&!tagline.dataset.typed){
    tagline.dataset.typed='1';
    const text=tagline.textContent;
    tagline.textContent='';
    tagline.style.borderRight='1px solid #8a7a72';
    let i=0;
    const type=()=>{
      if(i<text.length){tagline.textContent+=text[i];i++;setTimeout(type,28);}
      else{setTimeout(()=>{tagline.style.borderRight='none';},1000);}
    };
    setTimeout(type,1200);
  }
},100);

/* ── PAGE TRANSITION LOADING DOT ── */
const loadDot=document.createElement('div');
loadDot.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:8px;height:8px;border-radius:50%;background:#b5445a;z-index:9998;opacity:0;pointer-events:none;transition:opacity 0.15s;';
document.body.appendChild(loadDot);
const origP=P;
window.P=function(id){
  loadDot.style.opacity='1';
  setTimeout(()=>{origP(id);loadDot.style.opacity='0';},80);
};


/* SMM PLATFORM MODAL */
const SMM_DATA = {
  instagram: {
    cat:'Instagram Management',title:'Instagram Growth & Content Strategy',
    bg:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',icon:'📸',
    desc:'Full Instagram account management from strategy to execution. I handle everything from grid planning and content creation to community engagement and monthly performance reporting, helping brands grow their audience and deepen engagement consistently.',
    services:['Grid planning and aesthetic consistency','Caption writing with targeted hashtags','Stories, Reels, and carousel content','Community management and comment replies','Monthly analytics and growth reporting','Influencer collaboration coordination'],
    tools:'Canva · CapCut · Buffer · Planable · Meta Business Suite',
    confidential: false,
    samples:[
      {type:'img', src:'images/iggrid1.jpg', label:'IG Grid Layout Sample', mockBg:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', mockIcon:'📸', mockLines:['9-grid aesthetic plan','Consistent color palette','Branded templates']},
      {type:'img', src:'images/iganalytics1.jpg', label:'Monthly Analytics Report', mockBg:'linear-gradient(135deg,#1a1410,#3a2820)', mockIcon:'📊', mockLines:['Reach: +42% MoM','Followers: +318','Engagement rate: 6.2%']},
      /* ➕ ADD MORE SAMPLES: Copy the line above and change src, label, mockBg, mockIcon, mockLines */
      {type:'img', src:'images/igcaption1.jpg', label:'Caption & Hashtag Strategy', mockBg:'linear-gradient(135deg,#4a1a6a,#c0392b)', mockIcon:'✍️', mockLines:['30 caption templates','Niche hashtag sets','CTAs per post type']}
    ]
  },
  facebook: {
    cat:'Facebook Page Management',title:'Facebook Page Strategy & Management',
    bg:'linear-gradient(135deg,#1a2a4a,#1877f2)',icon:'👍',
    desc:'Complete Facebook page management for businesses and personal brands. From crafting your bio and cover visuals to planning a posting schedule and handling your inbox, I make sure your Facebook presence is polished, active, and converting.',
    services:['Page optimization and bio copywriting','Content planning and scheduled posting','Inbox and comment management','Ad creative support and boosted posts','Page insights and engagement reporting','Facebook Live coordination'],
    tools:'Meta Business Suite · Canva · Buffer · Facebook Ads Manager',
    confidential: false,
    samples:[
      {type:'img', src:'images/fb1.jpg', label:'Facebook Content Calendar', mockBg:'linear-gradient(135deg,#1a2a4a,#1877f2)', mockIcon:'📅', mockLines:['30-day posting plan','Platform-specific captions','Scheduled + boosted posts']},
      {type:'img', src:'images/fbanalytics1.jpg', label:'Page Insights Report', mockBg:'linear-gradient(135deg,#0d1b3e,#1565c0)', mockIcon:'📊', mockLines:['Page reach: 12.4K','Post engagement: 8.7%','Inbox response: 100%']},
      {type:'img', src:'images/fbad1.jpg', label:'Ad Creative Sample', mockBg:'linear-gradient(135deg,#0a1830,#0d47a1)', mockIcon:'🎯', mockLines:['Boosted post creative','Target audience setup','A/B test results']}
    ]
  },
  tiktok: {
    cat:'TikTok Management',title:'TikTok Content Strategy & Growth',
    bg:'linear-gradient(135deg,#0a0a0a,#ff0050)',icon:'♪',
    desc:'TikTok is fast-moving and trend-driven, and I stay on top of it so you do not have to. I research trending sounds and formats, write punchy captions, build weekly posting schedules, and track performance to keep your content growing organically.',
    services:['Trend research and sound selection','Script and caption writing','Hashtag and niche targeting','Weekly content calendar management','TikTok analytics review','Collaboration and duet strategy'],
    tools:'CapCut · TikTok Creator Studio · Canva · Buffer',
    confidential: false,
    samples:[
      {type:'img', src:'images/tiktok1.jpg', label:'TikTok Content Plan', mockBg:'linear-gradient(135deg,#0a0a0a,#ff0050)', mockIcon:'♪', mockLines:['Weekly video scripts','Trending sound research','Hook + CTA structure']},
      {type:'img', src:'images/tiktokanalytics1.jpg', label:'TikTok Growth Report', mockBg:'linear-gradient(135deg,#1a0010,#cc003d)', mockIcon:'📈', mockLines:['Views: 48K this month','Followers: +620','Avg watch time: 74%']},
      {type:'img', src:'images/tiktokhooks1.jpg', label:'Hook & Script Templates', mockBg:'linear-gradient(135deg,#0d0d0d,#69C9D0)', mockIcon:'🎥', mockLines:['10 hook formulas','POV & trend formats','Engagement prompts']}
    ]
  },
  youtube: {
    cat:'YouTube Management',title:'YouTube Channel Management',
    bg:'linear-gradient(135deg,#1c0a0a,#ff0000)',icon:'▶️',
    desc:'A well-managed YouTube channel builds long-term authority and searchability. I handle SEO-optimized titles, descriptions, and tags; coordinate thumbnails; manage upload schedules; moderate comments; and deliver weekly performance analytics to keep the channel growing.',
    services:['SEO-optimized titles and descriptions','Thumbnail coordination and brief','Upload scheduling and playlist management','Community tab posts and pinned comments','Comment moderation and engagement','Weekly analytics reporting'],
    tools:'YouTube Studio · TubeBuddy · Canva · Google Sheets',
    confidential: false,
    samples:[
      {type:'img', src:'images/yt1.jpg', label:'YouTube SEO Sheet', mockBg:'linear-gradient(135deg,#1c0a0a,#cc0000)', mockIcon:'▶️', mockLines:['Title + description copy','Tag research per video','Thumbnail brief']},
      {type:'img', src:'images/ytanalytics1.jpg', label:'Channel Analytics Report', mockBg:'linear-gradient(135deg,#2a0808,#ff0000)', mockIcon:'📊', mockLines:['Watch hours: 1,240','Subscribers: +88','CTR: 9.3%']},
      {type:'img', src:'images/ytthumbnail1.jpg', label:'Thumbnail Brief & Template', mockBg:'linear-gradient(135deg,#1a0505,#e53935)', mockIcon:'🖼️', mockLines:['Thumbnail design brief','Consistent style guide','A/B test variants']}
    ]
  },
  pinterest: {
    cat:'Pinterest Management',title:'Pinterest Traffic Strategy',
    bg:'linear-gradient(135deg,#2a0a0a,#e60023)',icon:'📌',
    desc:'Pinterest is a long-game traffic engine, and it rewards consistency. I create keyword-rich pins, organize boards strategically, and schedule with Tailwind to drive a steady stream of visitors to your blog, shop, or landing pages month after month.',
    services:['Pin design and keyword-optimized descriptions','Board organization and naming strategy','Tailwind scheduling for consistent pinning','Rich Pin setup and verification','Pinterest analytics and growth reporting','Seasonal content planning'],
    tools:'Canva · Tailwind · Pinterest Business Analytics · Google Sheets',
    confidential: false,
    samples:[
      {type:'img', src:'images/pinterest1.jpg', label:'Pinterest Board Strategy', mockBg:'linear-gradient(135deg,#2a0a0a,#e60023)', mockIcon:'📌', mockLines:['Board naming & SEO','Pin scheduling plan','Seasonal content map']},
      {type:'img', src:'images/pinterestanalytics1.jpg', label:'Pinterest Analytics Report', mockBg:'linear-gradient(135deg,#1a0505,#b5001a)', mockIcon:'📊', mockLines:['Monthly impressions: 94K','Outbound clicks: +38%','Top pin performance']},
      {type:'img', src:'images/pinterestpin1.jpg', label:'Pin Design Samples', mockBg:'linear-gradient(135deg,#3a0a0a,#ff1744)', mockIcon:'🖼️', mockLines:['Branded pin templates','Keyword-rich titles','Vertical format designs']}
    ]
  },
  reddit: {
    cat:'Reddit Management',title:'Reddit Community Management',
    bg:'linear-gradient(135deg,#1a1010,#ff4500)',icon:'🤖',
    desc:'Reddit rewards genuine participation, not spam. I monitor relevant subreddits, engage authentically with communities, and help position your brand as a trusted, helpful voice. Reputation building on Reddit takes patience and strategy, and that is exactly what I bring.',
    services:['Subreddit research and community mapping','Authentic post creation and engagement','Brand reputation monitoring','Scheduled community value posts','Comment and thread management','Monthly Reddit activity report'],
    tools:'Reddit · Later · Google Sheets · Brand24',
    confidential: false,
    samples:[
      {type:'img', src:'images/reddit1.jpg', label:'Reddit Subreddit Map', mockBg:'linear-gradient(135deg,#1a1010,#cc3700)', mockIcon:'🗺️', mockLines:['15 target subreddits','Post frequency plan','Tone & voice guide']},
      {type:'img', src:'images/redditanalytics1.jpg', label:'Reddit Activity Report', mockBg:'linear-gradient(135deg,#0f0a08,#ff4500)', mockIcon:'📊', mockLines:['Posts: 24 this month','Avg upvote ratio: 91%','Brand mentions tracked']},
      {type:'img', src:'images/redditpost1.jpg', label:'Sample Community Post', mockBg:'linear-gradient(135deg,#180e08,#e53d00)', mockIcon:'✍️', mockLines:['Value-first post format','Authentic brand voice','No-spam approach']}
    ]
  },
  fbgroup: {
    cat:'Facebook Group Management',title:'Facebook Group Community Management',
    bg:'linear-gradient(135deg,#0a1a2a,#0d6efd)',icon:'👥',
    desc:'A thriving Facebook Group is one of the most powerful free assets a business can have. I handle moderation, daily engagement posts, member welcome messages, weekly themed content, and growth initiatives, turning your group into a loyal, active community.',
    services:['New member welcome sequences','Daily engagement and discussion posts','Moderation and spam removal','Weekly themed content (polls, Q&As, tips)','Member onboarding and pinned post setup','Growth and event promotion strategy'],
    tools:'Meta Business Suite · Canva · Notion · Google Sheets',
    confidential: false,
    samples:[
      {type:'img', src:'images/fbgroup1.jpg', label:'Group Content Schedule', mockBg:'linear-gradient(135deg,#0a1a2a,#0d6efd)', mockIcon:'📅', mockLines:['Weekly theme calendar','Poll + Q&A templates','Welcome message flow']},
      {type:'img', src:'images/fbgroupanalytics1.jpg', label:'Community Growth Report', mockBg:'linear-gradient(135deg,#060f1a,#0b55d4)', mockIcon:'📊', mockLines:['New members: +214','Engagement posts: 28','Moderation log: clean']},
      {type:'img', src:'images/fbgroupwelcome1.jpg', label:'Member Welcome Sequence', mockBg:'linear-gradient(135deg,#04080f,#1565c0)', mockIcon:'👋', mockLines:['Auto welcome message','Pinned rules post','Onboarding checklist']}
    ]
  }
};

function openSMMModal(platform){
  const d=SMM_DATA[platform];if(!d)return;

  // Banner
  document.getElementById('smmModalBanner').style.background=d.bg;
  document.getElementById('smmModalBanner').innerHTML='<div style="font-size:60px;">'+d.icon+'</div><div style="font-size:12px;color:rgba(255,255,255,0.8);letter-spacing:0.2em;text-transform:uppercase;font-weight:600;">'+d.cat+'</div>';

  // Text content
  document.getElementById('smmModalCat').textContent=d.cat;
  document.getElementById('smmModalTitle').textContent=d.title;
  document.getElementById('smmModalDesc').textContent=d.desc;
  const ul=document.getElementById('smmModalServices');ul.innerHTML='';
  d.services.forEach(s=>{const li=document.createElement('li');li.textContent=s;ul.appendChild(li);});
  document.getElementById('smmModalTools').innerHTML='<div style="font-size:11px;color:var(--accent);letter-spacing:0.18em;text-transform:uppercase;font-weight:600;margin-bottom:8px;">Tools Used</div><div style="font-size:14px;color:var(--stone);">'+d.tools+'</div>';

  // Work Samples — use shared renderSampleCards for full multi-format support
  const samplesWrap=document.getElementById('smmModalSamples');
  const samplesGrid=document.getElementById('smmSamplesGrid');
  if(samplesWrap && samplesGrid){
    samplesWrap.style.display='block';
    renderSampleCards(d.samples||[], 'smmSamplesGrid');
  }

  document.getElementById('smmModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeSMMModal(e){if(e.target===document.getElementById('smmModal'))closeSMMModalDirect();}
function closeSMMModalDirect(){document.getElementById('smmModal').classList.remove('open');document.body.style.overflow='';}

/* DESIGN DETAIL MODAL */
const DESIGN_DATA = {
  social:['Social Media Design','Instagram Post & Story Designs','Complete set of branded Instagram post templates and story frames, consistent colors, fonts, and layout. Ready to plug in your content and post immediately.','Canva · Photoshop · Brand Guidelines'],
  branding:['Branding','Brand Kit & Identity Design','Full brand identity package including logo concepts, color palette, typography guide, and brand asset library, everything needed to present a cohesive, professional brand across all platforms.','Canva · Adobe Photoshop · Brand Guidelines'],
  email:['Email Design','Email Newsletter Templates','Clean, mobile-responsive email templates designed in Canva and coded for Mailchimp, headers, body sections, CTAs, and footers all on-brand and ready to customize for every send.','Canva · Mailchimp · ActiveCampaign'],
  content:['Content Design','Content Calendars & Infographics','Visual content pieces including branded infographics, content calendar layouts, and shareable graphics, all designed to communicate clearly and look great across platforms.','Canva · Google Slides · Notion']
};

function openDesignModal(type){
  const d=DESIGN_DATA[type];if(!d)return;
  document.getElementById('designModalBanner').style.cssText='width:100%;height:200px;overflow:hidden;position:relative;background:linear-gradient(135deg,#1a1410,#b5445a);display:flex;align-items:center;justify-content:center;font-size:72px;';
  const icons={social:'📱',branding:'🏷',email:'✉',content:'📄'};
  document.getElementById('designModalBanner').textContent=icons[type]||'🎨';
  document.getElementById('designModalCat').textContent=d[0];
  document.getElementById('designModalTitle').textContent=d[1];
  document.getElementById('designModalDesc').textContent=d[2];
  document.getElementById('designModalTags').innerHTML=d[3].split(' · ').map(t=>'<span class="proj-modal-tag">'+t+'</span>').join('');
  document.getElementById('designModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeDesignModal(e){if(e.target===document.getElementById('designModal'))closeDesignModalDirect();}
function closeDesignModalDirect(){document.getElementById('designModal').classList.remove('open');document.body.style.overflow='';}


function openSOPModal(){
  renderSampleCards(SOP_DATA, 'sopSamplesGrid');
  document.getElementById('sopModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeSOPModal(e){if(e.target===document.getElementById('sopModal'))closeSOPModalDirect();}
function closeSOPModalDirect(){document.getElementById('sopModal').classList.remove('open');document.body.style.overflow='';}

/* ══════════════════════════════════════════════════════════
   SHARED SAMPLE-CARD RENDERER
   To add a sample: copy any object in the arrays below and update
   src, label, mockBg, mockIcon, mockLines.
   Set confidential:true to show a blur/lock overlay instead.
   ══════════════════════════════════════════════════════════ */

const PM_DATA = [
  /* ➕ ADD MORE: copy a block below, update src/label/mockBg/mockIcon/mockLines */
  {src:'images/project7.jpg', label:'Trello Board Setup', mockBg:'linear-gradient(135deg,#1c1828,#2a2438)', mockIcon:'📋', mockLines:['Department boards','Card templates & checklists','Power Ups enabled'], confidential:false},
  {src:'images/project1.jpg', label:'ClickUp Workspace Setup', mockBg:'linear-gradient(135deg,#1a1410,#2c1f18)', mockIcon:'📁', mockLines:['Custom task lists','Automated status updates','Recurring templates'], confidential:false},
  {src:'images/project8.jpg', label:'Notion Workspace Setup', mockBg:'linear-gradient(135deg,#181c18,#222e22)', mockIcon:'🗂', mockLines:['CRM database','Project tracker','SOP library'], confidential:false}
];

const SOP_DATA = [
  /* ➕ ADD MORE: copy a block below, update src/label/mockBg/mockIcon/mockLines */
  {src:'images/project11.jpg', label:'Client Onboarding SOP', mockBg:'linear-gradient(135deg,#201820,#301a28)', mockIcon:'📝', mockLines:['Welcome email sequence','Tool access setup','First-week checklist'], confidential:false},
  {src:'images/sop2.jpg', label:'Social Media Posting SOP', mockBg:'linear-gradient(135deg,#1a1410,#2c2018)', mockIcon:'📱', mockLines:['Create → review → schedule','Platform-specific steps','Weekly content reporting'], confidential:false},
  {src:'images/sop3.jpg', label:'Weekly Reporting SOP', mockBg:'linear-gradient(135deg,#141820,#1e2838)', mockIcon:'📊', mockLines:['KPIs to pull','Report format guide','Stored in Notion'], confidential:false}
];

const WEB_DATA = [
  /* ➕ ADD MORE: copy a block below, update src/label/mockBg/mockIcon/mockLines */
  {src:'images/web1.jpg', label:'Portfolio Site', mockBg:'linear-gradient(135deg,#18201c,#223028)', mockIcon:'🌐', mockLines:['Skills & services layout','Work samples section','Clean elegant design'], confidential:false},
  {src:'images/web2.jpg', label:'Business Landing Page', mockBg:'linear-gradient(135deg,#201820,#301a28)', mockIcon:'🌐', mockLines:['Conversion-focused','Services + testimonials','Clear CTA sections'], confidential:false},
  {src:'images/web3.jpg', label:'Service Business Website', mockBg:'linear-gradient(135deg,#1a1820,#252038)', mockIcon:'🌐', mockLines:['About + services pages','Contact form integrated','Built from scratch'], confidential:false}
];

/* ═══ WATERMARK HELPER ═══ */
function _buildWatermarkDiv(opacity){
  var wm = document.createElement('div');
  wm.setAttribute('aria-hidden','true');
  wm.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:10;overflow:hidden;';

  // One repeating stamp: 🤍 Proassistanne
  var stamp = '🤍 Proassistanne';
  var spanStyle = 'font-size:10px;font-family:Inter,Helvetica Neue,Arial,sans-serif;font-style:normal;font-weight:400;'
    + 'color:rgba(255,255,255,' + opacity + ');'
    + 'letter-spacing:0.30em;user-select:none;white-space:nowrap;text-transform:uppercase;'
    + 'padding:0 20px;';

  var rows = '';
  for(var i = 0; i < 50; i++){
    // Alternate rows are offset so the grid tiles neatly
    var offset = (i % 2 === 0) ? '0' : '-80px';
    rows += '<div style="white-space:nowrap;line-height:1;padding:10px 0;margin-left:' + offset + ';">'
      + '<span style="' + spanStyle + '">' + stamp + '</span>'
      + '<span style="' + spanStyle + '">' + stamp + '</span>'
      + '<span style="' + spanStyle + '">' + stamp + '</span>'
      + '<span style="' + spanStyle + '">' + stamp + '</span>'
      + '<span style="' + spanStyle + '">' + stamp + '</span>'
      + '</div>';
  }

  wm.innerHTML = '<div style="'
    + 'width:200%;height:200%;'
    + 'position:absolute;top:-50%;left:-50%;'
    + 'display:flex;flex-direction:column;'
    + 'transform:rotate(-30deg);'
    + 'pointer-events:none;">'
    + rows
    + '</div>';

  return wm;
}

function addWatermark(container){
  container.style.position = 'relative';
  container.appendChild(_buildWatermarkDiv(0.28));
}

function addStrongWatermark(container){
  container.style.position = 'relative';
  container.appendChild(_buildWatermarkDiv(0.35));
}

/* Watermark that sits ABOVE video/image (z-index:30) — use for sample media blocks */
function addMediaWatermark(container){
  container.style.position = 'relative';
  var wm = _buildWatermarkDiv(0.32);
  wm.style.zIndex = '30';
  wm.style.pointerEvents = 'none';
  container.appendChild(wm);
}

/* ═══════════════════════════════════════════════════════════
   SAMPLE CARD LAYOUT — editorial horizontal list, no cover photo
═══════════════════════════════════════════════════════════ */
(function _injectBentoStyles(){
  if(document.getElementById('_bentoCardStyles')) return;
  var s = document.createElement('style');
  s.id = '_bentoCardStyles';
  s.textContent = [
    /* Grid: single column list */
    '.sc-grid{display:flex;flex-direction:column;gap:0;padding:4px 0;}',

    /* Card: horizontal row, full-width, ruled lines */
    '.sc-card{position:relative;display:flex;align-items:center;gap:0;background:#fff;border-bottom:1px solid #ede8e2;border-left:3px solid transparent;cursor:pointer;transition:background 0.22s ease,border-left-color 0.22s ease;overflow:hidden;}',
    '.sc-card:first-child{border-top:1px solid #ede8e2;}',
    '.sc-card:hover{background:#faf7f4;border-left-color:var(--accent,#d4859a);}',

    /* Index number column */
    '.sc-card .bc-idx{width:44px;min-width:44px;display:flex;align-items:center;justify-content:center;font-family:"DM Serif Display",serif;font-style:italic;font-size:15px;font-weight:600;color:#e0d5cc;padding:0 0 0 16px;flex-shrink:0;transition:color 0.22s;}',
    '.sc-card:hover .bc-idx{color:var(--accent,#d4859a);}',

    /* Icon bubble */
    '.sc-card .bc-ico{width:42px;height:42px;min-width:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;margin:0 16px;flex-shrink:0;transition:transform 0.25s cubic-bezier(.22,.68,0,1.2);}',
    '.sc-card:hover .bc-ico{transform:scale(1.12);}',

    /* Main content area */
    '.sc-card .bc-content{flex:1;padding:16px 12px 16px 0;min-width:0;}',
    '.sc-card .bc-label{font-size:13px;font-weight:700;color:#1a1410;line-height:1.3;margin-bottom:5px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}',
    '.bc-conf-badge{font-size:8px;font-weight:800;background:#1a1410;color:#fff;padding:2px 6px;letter-spacing:0.12em;text-transform:uppercase;border-radius:2px;flex-shrink:0;}',
    '.sc-card .bc-chips{display:flex;flex-wrap:wrap;gap:4px;}',
    '.sc-card .bc-chip{font-size:9px;color:#9a8a7a;background:#f5f0eb;padding:2px 8px;border-radius:2px;letter-spacing:0.06em;font-weight:500;}',

    /* Media flag (for video/pdf) */
    '.sc-card .bc-mflag{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent,#d4859a);background:#fdeef2;padding:2px 7px;border-radius:2px;flex-shrink:0;}',

    /* Details button */
    '.sc-card .bc-details-btn{flex-shrink:0;padding:0 20px;height:100%;min-height:64px;font-size:9px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;border:none;border-left:1px solid #ede8e2;background:transparent;color:#9a8a7a;cursor:pointer;transition:background 0.2s,color 0.2s;white-space:nowrap;display:flex;align-items:center;gap:5px;margin-left:auto;}',
    '.sc-card .bc-details-btn:hover{background:#1a1410;color:#fff;}',
    '.bc-details-btn .bc-arrow{display:inline-block;transition:transform 0.2s;}',
    '.sc-card .bc-details-btn:hover .bc-arrow{transform:translateX(3px);}',

    /* Confidential row style */
    '.sc-card.sc-conf{opacity:0.72;}',
    '.sc-card.sc-conf .bc-ico{filter:grayscale(1);}',

    /* Confidential panel (replaces details btn) */
    '.bc-conf-panel{flex-shrink:0;display:flex;align-items:center;gap:8px;padding:0 16px;border-left:1px solid #ede8e2;min-height:64px;}',
    '.bc-conf-panel a{font-size:9px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;background:#1a1410;color:#fff;padding:6px 12px;text-decoration:none;white-space:nowrap;}',

    /* Hover accent line animation */
    '.sc-card::after{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accent,#d4859a);transform:scaleY(0);transform-origin:bottom;transition:transform 0.22s cubic-bezier(.22,.68,0,1.2);}',
    '.sc-card:hover::after{transform:scaleY(1);}',

    /* legacy stubs — kept so video/pdf inline logic still works */
    '.bc-media{display:none;}',
    '.bc-overlay{display:none;}',
    '.bc-overlay-chips{display:none;}',
    '.bc-overlay-chip{display:none;}',
    '.bc-footer{display:none;}',
    '.bc-type-pill{display:none;}',
    '.bc-playing-badge{display:none;}',
    '.bc-play-btn{display:none;}',
    '.bc-mock{display:none;}',
    '.bc-mock-chip{display:none;}',
    '.bc-open-hint{display:none;}',
    '.bc-conf-blur{display:none;}',
    '.bc-conf-box{display:none;}'
  ].join('');
  document.head.appendChild(s);
})();

function renderSampleCards(data, gridId){
  const grid = document.getElementById(gridId);
  if(!grid) return;
  grid.innerHTML = '';

  /* Switch the container to sc-grid list layout */
  grid.className = (grid.className || '') + ' sc-grid';
  grid.style.cssText = (grid.style.cssText || '').replace(/display:[^;]+;?/g,'');

  /* Accent colours cycling — pulled from mockBg gradients or fallback palette */
  var PALETTE = [
    {bg:'#fdeef2',color:'#d4859a'},
    {bg:'#eef4fd',color:'#5a8aaa'},
    {bg:'#f0f9f1',color:'#3a8a5a'},
    {bg:'#fdf5ea',color:'#c8923a'},
    {bg:'#f4f0fd',color:'#7a5ab5'},
    {bg:'#fdf2ee',color:'#c87a5a'},
    {bg:'#eefaf7',color:'#3a9a8a'},
    {bg:'#fdf4ee',color:'#b5845a'}
  ];

  data.forEach(function(s, idx){
    /* ── Detect media type ── */
    var detectedType = s.type || 'img';
    if(s.src){
      var ext = s.src.split('?')[0].split('.').pop().toLowerCase();
      if(ext==='mp4'||ext==='mov'||ext==='webm'||ext==='mkv') detectedType='video';
      else if(ext==='mp3'||ext==='wav'||ext==='ogg'||ext==='m4a') detectedType='audio';
      else if(ext==='gif') detectedType='gif';
      else if(ext==='pdf') detectedType='pdf';
    }
    if(s.src && (s.src.indexOf('docs.google.com')!==-1||s.src.indexOf('drive.google.com')!==-1)) detectedType='gdoc';

    var isPdf  = detectedType==='pdf';
    var isDoc  = detectedType==='doc'||detectedType==='sheet'||detectedType==='gdoc';
    var isVideo= detectedType==='video';
    var isGif  = detectedType==='gif';
    var isFile = isPdf||isDoc;

    /* Palette for icon bubble */
    var pal = PALETTE[idx % PALETTE.length];

    /* Media type flag text */
    var mflagText = isVideo ? '▶ Video' : isGif ? '🎞 GIF' : isPdf ? '📄 PDF' : isDoc ? '↗ Doc' : '';

    /* ── Card shell ── */
    var card = document.createElement('div');
    card.className = 'sc-card' + (s.confidential ? ' sc-conf' : '');

    /* Index number */
    var idx_el = document.createElement('div');
    idx_el.className = 'bc-idx';
    idx_el.textContent = String(idx + 1).padStart(2,'0');
    card.appendChild(idx_el);

    /* Icon bubble */
    var ico = document.createElement('div');
    ico.className = 'bc-ico';
    ico.style.background = pal.bg;
    ico.textContent = s.mockIcon || '📄';
    card.appendChild(ico);

    /* Main content */
    var content = document.createElement('div');
    content.className = 'bc-content';

    var lbl = document.createElement('div');
    lbl.className = 'bc-label';
    if(s.confidential) lbl.innerHTML = '<span class="bc-conf-badge">🔒 Confidential</span>';
    lbl.innerHTML += '<span>'+s.label+'</span>';
    if(mflagText){
      var mf = document.createElement('span');
      mf.className = 'bc-mflag';
      mf.textContent = mflagText;
      lbl.appendChild(mf);
    }
    content.appendChild(lbl);

    if(s.mockLines && s.mockLines.length){
      var chipsWrap = document.createElement('div');
      chipsWrap.className = 'bc-chips';
      s.mockLines.forEach(function(l){
        var chip = document.createElement('span');
        chip.className = 'bc-chip';
        chip.textContent = l;
        chipsWrap.appendChild(chip);
      });
      content.appendChild(chipsWrap);
    }
    card.appendChild(content);

    /* Action button / panel */
    if(s.confidential){
      var confPanel = document.createElement('div');
      confPanel.className = 'bc-conf-panel';
      confPanel.innerHTML = '<a href="#" onclick="P(\'contact\');return false;" style="font-size:9px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;background:#1a1410;color:#fff;padding:6px 12px;text-decoration:none;white-space:nowrap;">Request Access →</a>';
      card.appendChild(confPanel);
    } else {
      var detailsBtn = document.createElement('button');
      detailsBtn.className = 'bc-details-btn';
      detailsBtn.innerHTML = 'Details <span class="bc-arrow">→</span>';
      detailsBtn.onclick = function(e){ e.stopPropagation(); openSidePanel(s); };

      /* If it's a clickable file, clicking the card opens it */
      if(isFile && s.src){
        card.style.cursor = 'pointer';
        card.onclick = function(e){
          if(e.target === detailsBtn || detailsBtn.contains(e.target)) return;
          if(isPdf){ openLightbox({src:s.src,title:s.label,cat:'',desc:''}); }
          else { window.open(s.src,'_blank'); }
        };
      }

      card.appendChild(detailsBtn);
    }

    grid.appendChild(card);
  });
}

/* ═══ SIDE PANEL functions ═══ */
function openSidePanel(sample){
  const panel = document.getElementById('sidePanel');
  const overlay = document.getElementById('sidePanelOverlay');
  if(!panel || !overlay) return;

  // ── Detect media type ──
  var spType = sample.type || 'img';
  if(sample.src){
    var spExt = sample.src.split('?')[0].split('.').pop().toLowerCase();
    if(spExt==='mp4'||spExt==='mov'||spExt==='webm'||spExt==='mkv') spType='video';
    else if(spExt==='mp3'||spExt==='wav'||spExt==='ogg'||spExt==='m4a') spType='audio';
    else if(spExt==='gif') spType='gif';
    else if(!sample.type && (spExt==='jpg'||spExt==='jpeg'||spExt==='png'||spExt==='webp'||spExt==='svg')) spType='img';
  }
  if(sample.src && (sample.src.indexOf('docs.google.com')!==-1||sample.src.indexOf('drive.google.com')!==-1)) spType='gdoc';
  var isVideo = spType==='video';
  var isAudio = spType==='audio';
  var isGif   = spType==='gif';
  var isFile  = spType==='doc'||spType==='sheet'||spType==='gdoc';

  // ── 1. COVER BANNER (always at the top) ──
  var imgArea = document.getElementById('sidePanelImg');
  var oldVid = imgArea.querySelector('video');
  if(oldVid){ oldVid.pause(); oldVid.src = ''; oldVid.load(); }
  imgArea.innerHTML = '';
  imgArea.style.cssText = 'width:100%;height:200px;position:relative;overflow:hidden;background:' + (sample.mockBg||'#1a1410') + ';flex-shrink:0;';

  if(!sample.confidential && sample.src && (spType==='img'||spType==='gif')){
    var coverImg = document.createElement('img');
    coverImg.alt = sample.label||'';
    coverImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center;display:block;z-index:1;';
    coverImg.onerror = function(){
      this.style.display = 'none';
      var fb = document.createElement('div');
      fb.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px;z-index:1;';
      fb.innerHTML = '<div style="font-size:48px;">'+(sample.mockIcon||'📄')+'</div>'
        +'<div style="font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;font-weight:600;">'+(sample.label||'Sample')+'</div>';
      imgArea.appendChild(fb);
    };
    coverImg.src = sample.src;
    imgArea.appendChild(coverImg);

  } else if(!sample.confidential && isVideo && sample.src){
    // Cover banner for video: static preview with play icon (video plays in Sample Media below)
    var coverVidBanner = document.createElement('div');
    coverVidBanner.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px;z-index:1;';
    coverVidBanner.innerHTML = '<div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;">'
      + '<span style="font-size:20px;margin-left:4px;">▶</span></div>'
      + '<div style="font-size:10px;color:rgba(255,255,255,0.7);letter-spacing:0.16em;text-transform:uppercase;font-weight:600;">' + (sample.label||'Video Sample') + '</div>';
    imgArea.appendChild(coverVidBanner);

  } else {
    var bannerInner = document.createElement('div');
    bannerInner.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px;z-index:1;';
    bannerInner.innerHTML = '<div style="font-size:48px;">'+(sample.mockIcon||'📄')+'</div>'
      +'<div style="font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;font-weight:600;">'+(sample.label||'Portfolio Sample')+'</div>';
    imgArea.appendChild(bannerInner);
  }
  // Category label overlay — z-index:5 so it's always on top
  var coverLabel = document.createElement('div');
  coverLabel.style.cssText = 'position:absolute;bottom:0;left:0;right:0;z-index:5;'
    + 'padding:12px 20px;background:linear-gradient(to top,rgba(15,15,15,0.72),transparent);'
    + 'display:flex;align-items:flex-end;justify-content:space-between;pointer-events:none;';
  coverLabel.innerHTML = '<span style="font-size:9px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.9);">'
    + (sample.cat||sample.category||'Portfolio Sample') + '</span>';
  imgArea.appendChild(coverLabel);
  // Watermark on cover — z-index:4 (above video z-index:2, below label z-index:5)
  var coverWm = _buildWatermarkDiv(0.22);
  coverWm.style.zIndex = '4';
  coverWm.style.pointerEvents = 'none';
  imgArea.appendChild(coverWm);

  // ── 2. REBUILD the panel body with new two-column layout ──
  // Clear everything inside sidePanelBody, then rebuild
  var body = panel.querySelector('.side-panel-body');
  if(!body) body = panel;

  // Remove old dynamically injected media block if present
  var existingMedia = document.getElementById('sidePanelSampleMedia');
  if(existingMedia) existingMedia.remove();

  // Clear current body content and replace
  body.innerHTML = '';
  body.style.cssText = 'padding:28px 28px 28px;flex:1;display:flex;flex-direction:column;gap:0;overflow-y:auto;';

  // ── Two-column row: Details (left) + Sample Media (right) ──
  var twoCol = document.createElement('div');
  twoCol.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;margin-bottom:24px;';

  // ── LEFT: Details ──
  var detailsCol = document.createElement('div');
  detailsCol.style.cssText = 'display:flex;flex-direction:column;gap:0;';

  var catEl = document.createElement('div');
  catEl.style.cssText = 'font-size:9px;color:var(--accent);letter-spacing:0.26em;text-transform:uppercase;font-weight:700;margin-bottom:8px;';
  catEl.textContent = sample.cat || sample.category || 'Portfolio Sample';

  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-family:var(--serif);font-size:20px;font-style:italic;color:var(--ink);margin-bottom:12px;line-height:1.25;font-weight:600;';
  titleEl.textContent = sample.label || 'Sample';

  var descEl = document.createElement('p');
  descEl.style.cssText = 'font-size:13px;color:var(--stone);line-height:1.85;margin-bottom:16px;font-weight:300;';
  var _desc = sample.desc || sample.description || '';
  if(!_desc){
    _desc = sample.confidential
      ? 'Confidential client work. Details available upon request.'
      : 'A real client deliverable from my portfolio, built with care and a focus on results.';
  }
  descEl.textContent = _desc;

  detailsCol.appendChild(catEl);
  detailsCol.appendChild(titleEl);
  detailsCol.appendChild(descEl);

  // Mock lines as detail bullets (if present)
  if(sample.mockLines && sample.mockLines.length){
    var bulletWrap = document.createElement('div');
    bulletWrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-top:4px;';
    sample.mockLines.forEach(function(line){
      var b = document.createElement('div');
      b.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:12px;color:var(--stone);font-weight:300;';
      b.innerHTML = '<span style="width:5px;height:5px;border-radius:50%;background:var(--accent);flex-shrink:0;display:inline-block;"></span>'
        + '<span>' + line + '</span>';
      bulletWrap.appendChild(b);
    });
    detailsCol.appendChild(bulletWrap);
  }

  // ── RIGHT: Sample Media Block ──
  var mediaCol = document.createElement('div');
  mediaCol.style.cssText = 'display:flex;flex-direction:column;gap:0;';

  var mediaLabel = document.createElement('div');
  mediaLabel.style.cssText = 'font-size:9px;color:var(--stone);letter-spacing:0.22em;text-transform:uppercase;font-weight:700;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border);';
  mediaLabel.textContent = 'Sample Media';
  mediaCol.appendChild(mediaLabel);

  var mediaBlock = document.createElement('div');
  mediaBlock.id = 'sidePanelSampleMedia';
  mediaBlock.style.cssText = 'width:100%;overflow:hidden;position:relative;background:'+(sample.mockBg||'#1a1410')+';border:1px solid var(--border);';

  if(sample.confidential){
    mediaBlock.style.height = '180px';
    var confOverlay = document.createElement('div');
    confOverlay.style.cssText = 'position:absolute;inset:0;backdrop-filter:blur(10px);background:rgba(26,20,16,0.6);display:flex;align-items:center;justify-content:center;padding:16px;z-index:2;';
    confOverlay.innerHTML = '<div style="background:#fff;border:1px solid var(--border);padding:16px 18px;text-align:center;max-width:180px;"><div style="font-size:20px;margin-bottom:8px;">🔒</div><div style="font-size:10px;font-weight:700;color:var(--ink);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">Confidential</div><div style="font-size:10px;color:var(--stone);line-height:1.6;">Available upon request.</div></div>';
    var blurBg = document.createElement('div');
    blurBg.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:1;';
    blurBg.innerHTML = '<div style="font-size:36px;opacity:0.25;">'+(sample.mockIcon||'📄')+'</div>';
    mediaBlock.appendChild(blurBg);
    mediaBlock.appendChild(confOverlay);
    addWatermark(mediaBlock);

  } else if(isVideo && sample.src){
    var vidWrapper = document.createElement('div');
    vidWrapper.style.cssText = 'position:relative;width:100%;aspect-ratio:9/16;overflow:hidden;background:#000;';
    var vid = document.createElement('video');
    vid.src=sample.src; vid.muted=true; vid.playsInline=true; vid.loop=true; vid.controls=true; vid.preload='metadata';
    vid.style.cssText = 'position:relative;z-index:20;width:100%;height:100%;object-fit:cover;display:block;';
    vidWrapper.appendChild(vid);
    addMediaWatermark(vidWrapper);
    mediaBlock.style.background = 'transparent';
    mediaBlock.style.border = 'none';
    mediaBlock.appendChild(vidWrapper);

  } else if((isGif||spType==='img') && sample.src){
    var mediaWrapper = document.createElement('div');
    mediaWrapper.style.cssText = 'position:relative;overflow:hidden;width:100%;background:'+(sample.mockBg||'#1a1410')+';';
    var mediaImg = document.createElement('img');
    mediaImg.alt = sample.label||'';
    mediaImg.src = sample.src;
    mediaImg.style.cssText = 'display:block;width:100%;height:auto;position:relative;z-index:20;';
    mediaWrapper.appendChild(mediaImg);
    addMediaWatermark(mediaWrapper); // added AFTER img so watermark z-index:30 shows on top
    mediaBlock.style.background = 'transparent';
    mediaBlock.style.border = 'none';
    mediaBlock.appendChild(mediaWrapper);

  } else if(isAudio && sample.src){
    var audioWrapper = document.createElement('div');
    audioWrapper.style.cssText = 'position:relative;width:100%;padding:24px 16px;background:'+(sample.mockBg||'#1a1410')+';display:flex;flex-direction:column;align-items:center;gap:12px;';
    var audioIcon = document.createElement('div');
    audioIcon.style.cssText = 'font-size:28px;';
    audioIcon.textContent = '🎵';
    var audioLabel2 = document.createElement('div');
    audioLabel2.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.7);letter-spacing:0.1em;text-transform:uppercase;';
    audioLabel2.textContent = sample.label || 'Audio Sample';
    var audioEl = document.createElement('audio');
    audioEl.src = sample.src; audioEl.controls = true; audioEl.preload = 'metadata';
    audioEl.style.cssText = 'width:100%;';
    audioWrapper.appendChild(audioIcon);
    audioWrapper.appendChild(audioLabel2);
    audioWrapper.appendChild(audioEl);
    addMediaWatermark(audioWrapper);
    mediaBlock.style.background = 'transparent';
    mediaBlock.style.border = 'none';
    mediaBlock.appendChild(audioWrapper);

  } else if(isFile && sample.src){
    mediaBlock.style.cssText += 'height:140px;display:flex;align-items:center;justify-content:center;cursor:pointer;';
    var fileInner = document.createElement('div');
    fileInner.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:10px;';
    fileInner.innerHTML = '<div style="font-size:36px;">'+(sample.mockIcon||'📄')+'</div>'
      +'<div style="font-size:10px;color:rgba(255,255,255,0.7);letter-spacing:0.1em;text-transform:uppercase;">↗ Open File</div>';
    mediaBlock.appendChild(fileInner);
    mediaBlock.onclick = function(){ window.open(sample.src,'_blank'); };

  } else {
    // Mock/placeholder
    mediaBlock.style.height = '180px';
    mediaBlock.style.display = 'flex';
    mediaBlock.style.alignItems = 'center';
    mediaBlock.style.justifyContent = 'center';
    var mockInner = document.createElement('div');
    mockInner.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;';
    mockInner.innerHTML = '<div style="font-size:36px;">'+(sample.mockIcon||'📄')+'</div>'
      +(sample.mockLines||[]).map(function(l){
        return '<div style="font-size:10px;color:rgba(255,255,255,0.75);background:rgba(0,0,0,0.25);padding:3px 8px;border-radius:2px;letter-spacing:0.04em;">'+l+'</div>';
      }).join('');
    mediaBlock.appendChild(mockInner);
    addWatermark(mediaBlock);
  }

  mediaCol.appendChild(mediaBlock);

  // Assemble two-column row
  twoCol.appendChild(detailsCol);
  twoCol.appendChild(mediaCol);
  body.appendChild(twoCol);

  // Responsive: stack on narrow panels
  var styleTag = document.getElementById('spTwoColStyle');
  if(!styleTag){
    styleTag = document.createElement('style');
    styleTag.id = 'spTwoColStyle';
    styleTag.textContent = '@media(max-width:520px){#sidePanel .sp-twocol{grid-template-columns:1fr !important;}}';
    document.head.appendChild(styleTag);
  }
  twoCol.classList.add('sp-twocol');

  // ── Divider ──
  var divider = document.createElement('div');
  divider.style.cssText = 'border-top:1px solid var(--border);margin-bottom:20px;';
  body.appendChild(divider);

  // ── CTA buttons ──
  var ctaDiv = document.createElement('div');
  ctaDiv.className = 'side-panel-cta';
  ctaDiv.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;';
  ctaDiv.innerHTML = '<a href="#" onclick="closeSidePanel();P(\'contact\');return false;" class="btn-dark"><span>Discuss Similar Work</span></a>'
    + '<a href="https://shop.beacons.ai/proassistanne/7d776266-227d-4a26-9d5a-71f3ee059043?pageViewSource=lib_view&referrer=https%3A%2F%2Fbeacons.ai%2Fproassistanne&show_back_button=true" target="_blank" rel="noopener" class="btn-outline">📅 Book a Call</a>';
  body.appendChild(ctaDiv);

  // ── 3. OPEN PANEL ──
  if(panel.parentElement !== document.body) document.body.appendChild(panel);
  if(overlay.parentElement !== document.body) document.body.appendChild(overlay);
  panel.style.zIndex   = '9001';
  overlay.style.zIndex = '9000';
  panel.classList.add('open');
  overlay.classList.add('open');
  panel.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}

function closeSidePanel(){
  const panel = document.getElementById('sidePanel');
  const overlay = document.getElementById('sidePanelOverlay');
  if(panel) panel.classList.remove('open');
  if(overlay) overlay.classList.remove('open');
  if(panel) panel.setAttribute('aria-hidden', 'true');
  // ★ Restore scroll lock if any other modal is still open underneath ★
  var stillOpen = false;
  ['subcatModal','pillarModal','projModal','smmModal','pmModal','sopModal','webModal','designModal','imgLightbox','followPopup'].forEach(function(id){
    var el = document.getElementById(id);
    if(el && el.classList.contains('open')) stillOpen = true;
  });
  document.body.style.overflow = stillOpen ? 'hidden' : '';
}

/* ═══ NEW: FOLLOW ME PLEASE POPUP ═══ */
function openFollowPopup(resourceName){
  const popup = document.getElementById('followPopup');
  const nameEl = document.getElementById('followPopupResName');
  if(!popup) return;
  if(nameEl) nameEl.textContent = resourceName || 'Free Resource';
  // Always reset to step 1 when opening
  const s1 = document.getElementById('followStep1');
  const s2 = document.getElementById('followStep2');
  if(s1) s1.style.display = '';
  if(s2) s2.style.display = 'none';
  popup.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function markFollowed(){
  // Visual feedback — highlight the "I've followed" button after clicking a social link
  setTimeout(function(){
    const btn = document.getElementById('followedBtn');
    if(btn){ btn.style.opacity='1'; btn.style.boxShadow='0 0 0 3px rgba(181,68,90,0.25)'; }
  }, 800);
}
function showEmailStep(){
  const s1 = document.getElementById('followStep1');
  const s2 = document.getElementById('followStep2');
  if(s1) s1.style.display = 'none';
  if(s2) s2.style.display = '';
}
function closeFollowPopup(e){
  if(e && e.target !== document.getElementById('followPopup')) return;
  closeFollowPopupDirect();
}
function closeFollowPopupDirect(){
  const popup = document.getElementById('followPopup');
  if(popup) popup.classList.remove('open');
  document.body.style.overflow = '';
}

/* ═══ NEW: Calendar embed fallback ═══ */
let calLoadedFlag = false;
function calLoaded(){ calLoadedFlag = true; }
function calFailed(){
  const frame = document.getElementById('calFrame');
  const fallback = document.getElementById('calFallback');
  if(frame) frame.style.display = 'none';
  if(fallback) fallback.style.display = 'block';
}
// If iframe doesn't load within 6 seconds, show fallback
setTimeout(function(){
  if(!calLoadedFlag){
    const frame = document.getElementById('calFrame');
    if(frame && frame.offsetParent !== null){
      // iframe is in the DOM but may have been blocked
      try {
        if(!frame.contentWindow || !frame.contentDocument){
          calFailed();
        }
      } catch(err){
        // Cross-origin error means iframe loaded fine, Beacons is from another origin
        // Don't trigger fallback in this case
      }
    }
  }
}, 6000);



/* ── GOOGLE SHEETS: 2 samples (img + sheet) ── */
const SHEETS_DATA = [
  {type:'img',  src:'images/project9.jpg',          label:'Master Task Tracker',       mockBg:'linear-gradient(135deg,#18201c,#223028)', mockIcon:'📊', mockLines:['Tasks + status tags','Deadline tracking','Color-coded priority'], confidential:true},
  {type:'sheet',src:'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit', label:'Live Tracker Template', mockBg:'linear-gradient(135deg,#1a2e1a,#2a4a2a)', mockIcon:'🟢', mockLines:['Open in Google Sheets','Editable template','Replace link with your own'], confidential:true}
  /* ➕ Add more: {type:'img'|'sheet'|'pdf'|'video', src:'...', label:'...', mockBg:'...', mockIcon:'...', mockLines:[...]} */
];

/* ── BLOG & ARTICLE: 3 samples ── */
const BLOG_DATA = [
  {type:'img', src:'images/projectblog1.jpg', label:'Blog Article, Wellness Niche', mockBg:'linear-gradient(135deg,#1a1820,#2c2838)', mockIcon:'✍️', mockLines:['SEO-optimized','Brand voice matched','1,200+ word deep-dive'], confidential:false},
  {type:'img', src:'images/blogsample2.jpg',  label:'Real Estate Article',     mockBg:'linear-gradient(135deg,#201a28,#382040)', mockIcon:'🏠', mockLines:['Keyword research','Internal linking','Meta description'], confidential:false},
  {type:'img', src:'images/blogsample3.jpg',  label:'Coaching Niche Article',  mockBg:'linear-gradient(135deg,#1a1830,#2a2848)', mockIcon:'🎯', mockLines:['Thought leadership','CTA embedded','Evergreen content'], confidential:false}
  /* ➕ Add more samples here */
];

/* ── NEWSLETTER: 3 samples ── */
const NEWSLETTER_DATA = [
  {type:'img', src:'images/projectblog2.jpg', label:'Newsletter, Issue Sample',      mockBg:'linear-gradient(135deg,#1a1420,#2c1e30)', mockIcon:'📰', mockLines:['Open rate: 48%','Punchy subject line','Scannable layout'], confidential:false},
  {type:'img', src:'images/newslettersample2.jpg', label:'Welcome Email Sequence', mockBg:'linear-gradient(135deg,#201424,#381e34)', mockIcon:'✉️', mockLines:['5-email drip','Brand voice guide','Subscriber nurture'], confidential:false},
  {type:'img', src:'images/newslettersample3.jpg', label:'Monthly Newsletter Template',  mockBg:'linear-gradient(135deg,#241428,#3a1e3c)', mockIcon:'📋', mockLines:['Recurring structure','Evergreen sections','Editable layout'], confidential:false}
  /* ➕ Add more samples here */
];

/* ── SEO CONTENT: 3 samples ── */
const SEO_DATA = [
  {type:'img', src:'images/projectblog3.jpg', label:'SEO Strategy Overview',          mockBg:'linear-gradient(135deg,#14181a,#1e2c30)', mockIcon:'🔍', mockLines:['Keyword research','Pillar page plan','3-month calendar'], confidential:false},
  {type:'img', src:'images/seosample2.jpg',   label:'Competitor Gap Analysis',  mockBg:'linear-gradient(135deg,#101c20,#1a2e38)', mockIcon:'📈', mockLines:['Semrush data','Content gaps','Priority keywords'], confidential:false},
  {type:'img', src:'images/seosample3.jpg',   label:'Sample Optimized Article',mockBg:'linear-gradient(135deg,#0e1a1e,#182832)', mockIcon:'📄', mockLines:['H1–H3 structure','Internal linking','Meta + schema'], confidential:false}
  /* ➕ Add more samples here */
];

/* ── EMAIL MARKETING (Mailchimp / ActiveCampaign): 2 samples each ── */
const MAILCHIMP_DATA = [
  {type:'img', src:'images/project4.jpg',    label:'Welcome Sequence, Email 1',   mockBg:'linear-gradient(135deg,#251410,#321a14)', mockIcon:'✉', mockLines:['Subject A/B tested','42% open rate','Brand-matched design'], confidential:false},
  {type:'img', src:'images/mailchimpsample2.jpg', label:'Full 5-Email Sequence', mockBg:'linear-gradient(135deg,#301810,#442018)', mockIcon:'📧', mockLines:['Full copy included','Segmentation notes','Performance results'], confidential:false}
];
const ACTIVECAMPAIGN_DATA = [
  {type:'img', src:'images/projectemail3.jpg', label:'Automation Flow Diagram',     mockBg:'linear-gradient(135deg,#1a1028,#2a1838)', mockIcon:'🔄', mockLines:['Welcome + nurture','Re-engagement flow','Tag-based triggers'], confidential:false},
  {type:'img', src:'images/acsample2.jpg',     label:'Email Copy Samples',    mockBg:'linear-gradient(135deg,#1e0e2e,#2e1440)', mockIcon:'📝', mockLines:['Full email copy','Subscriber tagging','Performance stats'], confidential:false}
];

/* ── CRM: 2 samples ── */
const CRM_DATA = [
  {type:'img', src:'images/project12.jpg',  label:'HubSpot Pipeline Screenshot',   mockBg:'linear-gradient(135deg,#201c14,#302a1c)', mockIcon:'🗃', mockLines:['Custom deal stages','Contact properties','Automated triggers'], confidential:true},
  {type:'img', src:'images/crmsample2.jpg',label:'CRM Setup Documentation', mockBg:'linear-gradient(135deg,#281e10,#3a2c18)', mockIcon:'📋', mockLines:['Setup walkthrough','Automation logic','Onboarding workflow'], confidential:true}
];

/* ── INBOX MANAGEMENT: 2 samples ── */
const INBOX_DATA = [
  {type:'img', src:'images/project3.jpg',   label:'Inbox System Screenshot',       mockBg:'linear-gradient(135deg,#1e1818,#2a2020)', mockIcon:'📬', mockLines:['Folder structure','Filter rules','Canned responses'], confidential:false},
  {type:'img', src:'images/inboxsample2.jpg',label:'Inbox SOP Document',    mockBg:'linear-gradient(135deg,#241c1c,#302828)', mockIcon:'📄', mockLines:['Zero inbox workflow','Response time guide','Priority system'], confidential:false}
];

/* ── CONTENT CALENDAR: 2 samples ── */
const CALENDAR_DATA = [
  {type:'img', src:'images/project6.jpg',   label:'90-Day Content Calendar',       mockBg:'linear-gradient(135deg,#201a14,#2e2518)', mockIcon:'📅', mockLines:['90 post ideas','Platform captions','Canva templates'], confidential:false},
  {type:'sheet',src:'https://docs.google.com/spreadsheets/d/YOUR_CALENDAR_ID/edit', label:'Live Calendar Template', mockBg:'linear-gradient(135deg,#281e10,#3a2c18)', mockIcon:'🗓️', mockLines:['Open in Google Sheets','Scheduling slots','Replace with your link'], confidential:false}
];

/* ── GOOGLE DRIVE: 1 sample ── */
const GDRIVE_DATA = [
  {type:'img', src:'images/project10.jpg',  label:'Reorganized Drive Structure',   mockBg:'linear-gradient(135deg,#14181c,#1e2428)', mockIcon:'📂', mockLines:['Clear folder hierarchy','Color-coded by client','Master index doc'], confidential:false}
];

/* ── GOHIGHLEVEL: 1 sample ── */
const GHL_DATA = [
  {type:'img', src:'images/project5.jpg',   label:'GHL Funnel Screenshot',         mockBg:'linear-gradient(135deg,#201418,#302028)', mockIcon:'⚙', mockLines:['Landing page','SMS + email follow-up','18% lead-to-call rate'], confidential:false}
];

/* Initialize SAMPLE_MAP now that all arrays are defined */
initSampleMap();

/* ═══════════════════════════════════════════════════════
   INJECT WORK SAMPLES STRIP into each portfolio card
   Matches the same pattern as Project Management modal
═══════════════════════════════════════════════════════ */
function injectPortfolioCardSamples(){
  // Debug log — visible in browser console (F12 → Console tab)
  var portCardCount = document.querySelectorAll('#page-port .port-card[onclick]').length;
  var smmCardCount  = document.querySelectorAll('#page-smm-portfolio .smm-card[data-smm]').length;
  if(window._injectLogged !== true){
    console.log('[Proassistanne] injectPortfolioCardSamples running. Found', portCardCount, 'portfolio cards,', smmCardCount, 'SMM cards. SAMPLE_MAP populated:', SAMPLE_MAP && SAMPLE_MAP.BLOG_DATA ? 'yes' : 'NO ⚠️');
    window._injectLogged = true;
  }

  // Map: card onclick project key → sample data key
  var cardSampleMap = {
    'blog1':'BLOG_DATA','blog2':'NEWSLETTER_DATA','blog3':'SEO_DATA',
    'email1':'MAILCHIMP_DATA','email2':'INBOX_DATA','email3':'ACTIVECAMPAIGN_DATA',
    'exec2':'GHL_DATA','crm1':'CRM_DATA',
    'social2':'CALENDAR_DATA','books1':'SHEETS_DATA','gdrive1':'GDRIVE_DATA'
  };

  // Modal-based cards → map to their data arrays directly
  var modalDataMap = {
    'openWebModal': typeof WEB_DATA !== 'undefined' ? WEB_DATA : null,
    'openPMModal':  typeof PM_DATA  !== 'undefined' ? PM_DATA  : null,
    'openSOPModal': typeof SOP_DATA !== 'undefined' ? SOP_DATA : null
  };

  // Helper: render a strip of thumbnails onto a card
  function renderStrip(card, sData, idSuffix){
    if(card.querySelector('.card-samples-strip')) return; // already injected
    if(!sData || !sData.length) return;

    var strip = document.createElement('div');
    strip.className = 'card-samples-strip';
    strip.innerHTML = '<div class="card-samples-label">WORK SAMPLES <span class="card-samples-count">'+ sData.length +'</span></div><div class="card-samples-row" id="csr-'+idSuffix+'"></div>';
    card.appendChild(strip);

    var row = strip.querySelector('.card-samples-row');
    sData.forEach(function(s){
      var thumb = document.createElement('div');
      thumb.className = 'card-sample-thumb' + (s.confidential ? ' is-confidential' : '');
      thumb.style.background = s.mockBg || '#1a1410';
      thumb.title = s.label;

      if(s.confidential){
        thumb.innerHTML = '<div class="cst-lock">🔒</div><div class="cst-lbl">Confidential</div>';
      } else {
        thumb.innerHTML = '<div class="cst-icon">'+(s.mockIcon||'📄')+'</div>';
        var img = document.createElement('img');
        img.src = s.src;
        img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.3s;';
        img.onload = function(){ this.style.opacity='1'; };
        thumb.style.position = 'relative';
        thumb.appendChild(img);
      }

      thumb.addEventListener('click', function(e){
        e.stopPropagation();
        openSidePanel(s);
      });
      row.appendChild(thumb);
    });
  }

  // ── 1. openProject cards ──
  var portCards = document.querySelectorAll('#page-port .port-card[onclick]');
  portCards.forEach(function(card){
    var onc = card.getAttribute('onclick') || '';

    // Check modal-based cards first
    for(var fn in modalDataMap){
      if(onc.indexOf(fn) !== -1){
        renderStrip(card, modalDataMap[fn], fn);
        return;
      }
    }

    // openProject('key') cards
    var m = onc.match(/openProject\(['"]([^'"]+)['"]\)/);
    if(!m) return;
    var key = m[1];
    var sampleKey = cardSampleMap[key];
    if(!sampleKey) return;
    renderStrip(card, SAMPLE_MAP[sampleKey], key);
  });

  // ── 2. SMM platform cards ──
  var smmCards = document.querySelectorAll('#page-smm-portfolio .smm-card[data-smm]');
  smmCards.forEach(function(card){
    if(card.querySelector('.card-samples-strip')) return;
    var platform = card.getAttribute('data-smm');
    if(!platform || !SMM_DATA || !SMM_DATA[platform]) return;
    var d = SMM_DATA[platform];
    // Build sample-like objects from SMM platform data
    var sData = (d.samples || []).map(function(s){ return s; });
    if(!sData.length){
      // Fallback: use strategy/analytics as 3 icon-only thumbs
      sData = [
        {label:'Content Plan',  mockBg: d.bg || '#1a1410', mockIcon:'📋', confidential:false, src:''},
        {label:'Strategy',      mockBg: d.bg || '#1a1410', mockIcon:'🎯', confidential:false, src:''},
        {label:'Analytics',     mockBg: d.bg || '#1a1410', mockIcon:'📊', confidential:false, src:''}
      ];
    }
    renderStrip(card, sData, 'smm-'+platform);
  });
}

// Run portfolio card sample injection multiple times to be reliable.
// The function is idempotent — already-injected strips are skipped (line 1136 check),
// so calling it multiple times is safe.
function _runInjectSamples(){
  try { injectPortfolioCardSamples(); }
  catch(e){ console.warn('[Proassistanne] injectPortfolioCardSamples error:', e); }
}
document.addEventListener('DOMContentLoaded', function(){
  setTimeout(_runInjectSamples, 50);
  setTimeout(_runInjectSamples, 300);
  setTimeout(_runInjectSamples, 800);
});
// Also run if DOM is already ready when this script loads (footer-loaded scripts)
if(document.readyState !== 'loading'){
  setTimeout(_runInjectSamples, 50);
  setTimeout(_runInjectSamples, 300);
  setTimeout(_runInjectSamples, 800);
}
// Final safety run after window load (everything including images)
window.addEventListener('load', function(){
  setTimeout(_runInjectSamples, 100);
});

/* PROJECT MANAGEMENT MODAL */
function openPMModal(){
  renderSampleCards(PM_DATA, 'pmSamplesGrid');
  document.getElementById('pmModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closePMModal(e){if(e.target===document.getElementById('pmModal'))closePMModalDirect();}
function closePMModalDirect(){document.getElementById('pmModal').classList.remove('open');document.body.style.overflow='';}

/* FULLSCREEN LIGHTBOX — supports caption + arrow nav for design gallery,
   while staying fully backward compatible: openLightbox(src) still works everywhere */
var _lightboxList = [];   // array of {src, title, cat, desc} when navigating
var _lightboxIdx = 0;

function openLightbox(srcOrItem, list){
  var imgEl = document.getElementById('lightboxImg');
  var lbEl  = document.getElementById('imgLightbox');
  if(!imgEl || !lbEl) return;

  // If called with (src, list) — set up navigation
  if(Array.isArray(list) && list.length > 0){
    _lightboxList = list.slice();
    var srcStr = (typeof srcOrItem === 'string') ? srcOrItem : srcOrItem.src;
    _lightboxIdx = _lightboxList.findIndex(function(it){ return it.src === srcStr; });
    if(_lightboxIdx < 0) _lightboxIdx = 0;
    _lightboxRender();
  }
  // If called with just an item object
  else if(typeof srcOrItem === 'object' && srcOrItem){
    _lightboxList = [srcOrItem];
    _lightboxIdx = 0;
    _lightboxRender();
  }
  // Backward compat: openLightbox(src) — no caption, no arrows
  else {
    _lightboxList = [{ src: srcOrItem, title: '', cat: '', desc: '' }];
    _lightboxIdx = 0;
    _lightboxRender();
  }

  lbEl.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function _lightboxRender(){
  var item = _lightboxList[_lightboxIdx];
  if(!item) return;

  var lbStage = document.querySelector('.img-lightbox-content') || document.getElementById('imgLightbox');
  var capEl   = document.getElementById('lightboxCaption');
  var catEl   = document.getElementById('lightboxCat');
  var titEl   = document.getElementById('lightboxTitle');
  var descEl  = document.getElementById('lightboxDesc');
  var cntEl   = document.getElementById('lightboxCounter');
  var prevBtn = document.getElementById('lightboxPrev');
  var nextBtn = document.getElementById('lightboxNext');

  // Detect file type from src extension
  var src = item.src || '';
  var ext = src.split('?')[0].split('.').pop().toLowerCase();
  var isPdf   = ext === 'pdf';
  var isVideo = ext === 'mp4' || ext === 'mov' || ext === 'webm';

  // --- Rebuild the media element inside the lightbox content ---
  var content = document.querySelector('.img-lightbox-content');
  if(content){
    // Remove any old media (video, iframe) we may have injected
    var oldMedia = content.querySelectorAll('video, iframe.lb-pdf');
    oldMedia.forEach(function(el){ el.remove(); });

    var imgEl = document.getElementById('lightboxImg');

    if(isPdf){
      // Hide the img, inject an iframe for PDF
      if(imgEl) imgEl.style.display = 'none';
      var iframe = document.createElement('iframe');
      iframe.className = 'lb-pdf';
      iframe.src = src;
      iframe.style.cssText = 'width:90vw;max-width:960px;height:80vh;border:none;display:block;background:#fff;';
      // Insert before caption if it exists
      var cap = document.getElementById('lightboxCaption');
      if(cap) content.insertBefore(iframe, cap);
      else content.appendChild(iframe);

    } else if(isVideo){
      // Hide the img, inject a video element
      if(imgEl) imgEl.style.display = 'none';
      var vid = document.createElement('video');
      vid.src = src;
      vid.controls = true;
      vid.autoplay = true;
      vid.playsInline = true;
      vid.style.cssText = 'max-width:90vw;max-height:80vh;display:block;background:#000;';
      var cap2 = document.getElementById('lightboxCaption');
      if(cap2) content.insertBefore(vid, cap2);
      else content.appendChild(vid);

    } else {
      // Normal image — make sure img is visible and set src
      if(imgEl){
        imgEl.style.display = '';
        imgEl.src = src;
      }
    }
  } else {
    // Fallback for older simple lightbox (portfolio.html version)
    var imgEl2 = document.getElementById('lightboxImg');
    if(imgEl2 && !isPdf && !isVideo) imgEl2.src = src;
  }

  // Caption text
  if(catEl)  catEl.textContent  = item.cat   || '';
  if(titEl)  titEl.textContent  = item.title || '';
  if(descEl) descEl.textContent = item.desc  || '';
  if(cntEl)  cntEl.textContent  = _lightboxList.length > 1 ? ((_lightboxIdx + 1) + ' / ' + _lightboxList.length) : '';

  // Hide caption block if no metadata
  if(capEl){
    var hasMeta = item.title || item.cat || item.desc || _lightboxList.length > 1;
    capEl.style.display = hasMeta ? '' : 'none';
  }

  // Show/hide arrows
  if(prevBtn && nextBtn){
    var multi = _lightboxList.length > 1;
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';
  }
}

function lightboxNext(){
  if(_lightboxList.length < 2) return;
  _lightboxIdx = (_lightboxIdx + 1) % _lightboxList.length;
  _lightboxRender();
}
function lightboxPrev(){
  if(_lightboxList.length < 2) return;
  _lightboxIdx = (_lightboxIdx - 1 + _lightboxList.length) % _lightboxList.length;
  _lightboxRender();
}

function closeLightbox(e){
  // Allow the lightbox to be closed by clicking outside the content
  if(e && e.target && e.target.closest && e.target.closest('.img-lightbox-content')){
    return; // clicked inside content, don't close
  }
  closeLightboxDirect();
}
function closeLightboxDirect(){
  var lbEl = document.getElementById('imgLightbox');
  if(lbEl) lbEl.classList.remove('open');
  // ★ Restore scroll lock if any modal is still open underneath ★
  var stillOpen = false;
  ['sidePanel','subcatModal','pillarModal','projModal','smmModal','pmModal','sopModal','webModal','designModal','followPopup'].forEach(function(id){
    var el = document.getElementById(id);
    if(el && el.classList.contains('open')) stillOpen = true;
  });
  document.body.style.overflow = stillOpen ? 'hidden' : '';
  // Stop any playing video and remove injected media
  var content = document.querySelector('.img-lightbox-content');
  if(content){
    content.querySelectorAll('video').forEach(function(v){ v.pause(); v.remove(); });
    content.querySelectorAll('iframe.lb-pdf').forEach(function(f){ f.remove(); });
    // Restore img visibility
    var imgEl = document.getElementById('lightboxImg');
    if(imgEl){ imgEl.style.display = ''; imgEl.src = ''; }
  }
}

// Wire up arrow buttons + arrow keys
(function(){
  document.addEventListener('keydown', function(e){
    var lbEl = document.getElementById('imgLightbox');
    if(!lbEl || !lbEl.classList.contains('open')) return;
    if(e.key === 'ArrowRight') { lightboxNext(); e.preventDefault(); }
    if(e.key === 'ArrowLeft')  { lightboxPrev(); e.preventDefault(); }
  });
  document.addEventListener('DOMContentLoaded', function(){
    var prevBtn = document.getElementById('lightboxPrev');
    var nextBtn = document.getElementById('lightboxNext');
    if(prevBtn) prevBtn.addEventListener('click', function(e){ e.stopPropagation(); lightboxPrev(); });
    if(nextBtn) nextBtn.addEventListener('click', function(e){ e.stopPropagation(); lightboxNext(); });
  });
  // Also try immediately in case DOM is ready
  if(document.readyState !== 'loading'){
    setTimeout(function(){
      var prevBtn = document.getElementById('lightboxPrev');
      var nextBtn = document.getElementById('lightboxNext');
      if(prevBtn) prevBtn.addEventListener('click', function(e){ e.stopPropagation(); lightboxPrev(); });
      if(nextBtn) nextBtn.addEventListener('click', function(e){ e.stopPropagation(); lightboxNext(); });
    }, 50);
  }
})();
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    closeWebModalDirect();
    closeProjectDirect();
    closePMModalDirect();
    closeSOPModalDirect();
    closeLightbox();
    closeSMMModalDirect();
    closeDesignModalDirect();
    closeSidePanel();
    closeFollowPopupDirect();
  }
});

/* WEB DESIGN MODAL */
function openWebModal(){
  renderSampleCards(WEB_DATA, 'webSamplesGrid');
  document.getElementById('webModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeWebModal(e){if(e.target===document.getElementById('webModal'))closeWebModalDirect();}
function closeWebModalDirect(){document.getElementById('webModal').classList.remove('open');document.body.style.overflow='';}
// Escape key already handled above


/* ═══════════════════════════════════════════════════════════
   DESIGN GALLERY — Section-based clicks with category-scoped lightbox nav
═══════════════════════════════════════════════════════════ */
(function(){
  // Only run on the design feed page
  var sections = document.querySelectorAll('.dg-section');
  if(!sections.length) return;

  sections.forEach(function(section){
    var cat = section.getAttribute('id') ? section.getAttribute('id').replace('cat-','') : '';
    var cards = Array.prototype.slice.call(section.querySelectorAll('.dg-card'));

    // Helper: detect media type from file extension or URL
    function detectMediaType(src){
      if(!src) return 'img';
      var ext = src.split('?')[0].split('.').pop().toLowerCase();
      if(ext==='pdf') return 'pdf';
      if(ext==='mp4'||ext==='mov'||ext==='webm') return 'video';
      if(ext==='gif') return 'gif';
      if(src.indexOf('docs.google.com')!==-1||src.indexOf('drive.google.com')!==-1) return 'gdoc';
      return 'img'; // jpg, jpeg, png, webp, svg, etc.
    }

    // Helper: read multi-sample data from a card.
    // A card can have data-extras="img2.jpg|Title 2|Desc 2 ; video.mp4|Title 3|Desc 3"
    // Each sample is separated by " ; " (semicolon with spaces).
    // Within a sample, fields are separated by "|" (pipe).
    function getCardSamples(card){
      var mainSrc   = card.getAttribute('data-src')      || '';
      var mainTitle = card.getAttribute('data-title')    || '';
      var mainCat   = card.getAttribute('data-cat-name') || '';
      var mainDesc  = card.getAttribute('data-desc')     || '';
      var samples = [{ src:mainSrc, title:mainTitle, cat:mainCat, desc:mainDesc, type:detectMediaType(mainSrc) }];

      var extras = card.getAttribute('data-extras');
      if(extras && extras.trim()){
        extras.split(/\s*;\s*/).forEach(function(part){
          if(!part) return;
          var fields = part.split('|').map(function(s){ return s.trim(); });
          if(fields[0]){
            var xSrc = fields[0];
            samples.push({
              src:   xSrc,
              title: fields[1] || mainTitle,
              cat:   mainCat,
              desc:  fields[2] || mainDesc,
              type:  detectMediaType(xSrc)
            });
          }
        });
      }
      return samples;
    }

    // Upgrade card thumbnails that have non-image data-src (video, gif, pdf)
    cards.forEach(function(card){
      var mainSrc = card.getAttribute('data-src') || '';
      if(!mainSrc) return;
      var ext = mainSrc.split('?')[0].split('.').pop().toLowerCase();
      var isVideo = ext==='mp4'||ext==='mov'||ext==='webm';
      var isPdf   = ext==='pdf';
      var isGif   = ext==='gif';
      if(!isVideo && !isPdf && !isGif) return; // jpg/png handled by existing <img>

      var imgWrap = card.querySelector('.dg-card-img');
      if(!imgWrap) return;
      var existingImg = imgWrap.querySelector('img');

      if(isVideo){
        // Replace img with video poster preview
        var vid = document.createElement('video');
        vid.src = mainSrc; vid.muted = true; vid.preload = 'metadata'; vid.playsInline = true;
        vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
        // Add a small play indicator (no text)
        var playBadge = document.createElement('div');
        playBadge.style.cssText = 'position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.65);color:#fff;font-size:11px;padding:4px 8px;border-radius:2px;z-index:2;pointer-events:none;';
        playBadge.textContent = '▶';
        imgWrap.style.position = 'relative';
        if(existingImg) existingImg.style.display = 'none';
        imgWrap.insertBefore(vid, imgWrap.firstChild);
        imgWrap.appendChild(playBadge);
      } else if(isPdf){
        // No text label, just keep the icon-free preview
        imgWrap.style.position = 'relative';
      } else if(isGif){
        // GIF loads fine in <img>, no badge needed
        imgWrap.style.position = 'relative';
      }
    });

    // Add a "+N" badge to cards that have extras
    cards.forEach(function(card){
      var samples = getCardSamples(card);
      if(samples.length > 1){
        var existing = card.querySelector('.dg-card-multi');
        if(!existing){
          var badge = document.createElement('div');
          badge.className = 'dg-card-multi';
          badge.textContent = samples.length + ' samples';
          var imgWrap = card.querySelector('.dg-card-img');
          if(imgWrap) imgWrap.appendChild(badge);
        }
      }
    });

    // Wire up clicks — each card opens its OWN sample list
    cards.forEach(function(card){
      card.addEventListener('click', function(){
        var samples = getCardSamples(card);
        if(typeof openLightbox === 'function' && samples[0] && samples[0].src){
          // Open with this card's first sample, with arrows scoped to this card's samples
          openLightbox(samples[0].src, samples);
        }
      });
    });
  });

  // Smooth scroll for jump nav links
  var jumplinks = document.querySelectorAll('.dg-jumplink');
  jumplinks.forEach(function(link){
    link.addEventListener('click', function(e){
      var href = link.getAttribute('href');
      if(href && href.charAt(0) === '#'){
        var target = document.querySelector(href);
        if(target){
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   RESUME POPUP — protected, directs to WhatsApp or email
═══════════════════════════════════════════════════════════ */
function openResumePopup(){
  var popup = document.getElementById('resumePopup');
  if(!popup) return;
  popup.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  // Close on backdrop click
  popup.onclick = function(e){ if(e.target === popup) closeResumePopup(); };
}
function closeResumePopup(){
  var popup = document.getElementById('resumePopup');
  if(popup){ popup.style.display = 'none'; document.body.style.overflow = ''; }
}
function copyResumeEmail(){
  var email = 'ajtmendoza123@gmail.com';
  var btn = document.getElementById('resumeCopyBtn');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(email).then(function(){
      if(btn){ btn.textContent = '✓ Copied!'; btn.style.background = '#2a9d3f'; setTimeout(function(){ btn.textContent = 'Copy'; btn.style.background = '#1a1410'; }, 2200); }
    });
  } else {
    // Fallback for older browsers
    var ta = document.createElement('textarea');
    ta.value = email; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch(e){}
    document.body.removeChild(ta);
    if(btn){ btn.textContent = '✓ Copied!'; btn.style.background = '#2a9d3f'; setTimeout(function(){ btn.textContent = 'Copy'; btn.style.background = '#1a1410'; }, 2200); }
  }
}
// Also close resume popup on Escape key
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape') closeResumePopup();
});

/* ═══════════════════════════════════════════════════════════
   RESOURCES PAGE — copyable email in Step 2
═══════════════════════════════════════════════════════════ */
function copyResourceEmail(){
  var email = 'ajtmendoza123@gmail.com';
  var btn = document.getElementById('resourceCopyBtn');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(email).then(function(){
      if(btn){ btn.textContent='✓ Copied!'; btn.style.background='#2a9d3f'; setTimeout(function(){ btn.textContent='Copy'; btn.style.background='var(--ink)'; },2200); }
    });
  } else {
    var ta=document.createElement('textarea');
    ta.value=email; ta.style.cssText='position:fixed;opacity:0;';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); }catch(e){}
    document.body.removeChild(ta);
    if(btn){ btn.textContent='✓ Copied!'; btn.style.background='#2a9d3f'; setTimeout(function(){ btn.textContent='Copy'; btn.style.background='var(--ink)'; },2200); }
  }
}


/* ═══════════════════════════════════════════════════════════════════
   ★ PILLAR PORTFOLIO SYSTEM ★
   3 pillars → subcategories → multi-format samples
   ═══════════════════════════════════════════════════════════════════
   ✅ FILE FORMATS SUPPORTED (auto-detected from extension):
      • Images:    .jpg .jpeg .png .webp .svg
      • Animated:  .gif
      • Documents: .pdf
      • Videos:    .mp4 .mov .webm
      • Cloud:     Google Docs/Sheets/Drive links
   
   📁 ALL FILES GO IN: images/  folder
   
   📌 To replace a placeholder sample:
      Just change `src:'images/SLOT-XXX.jpg'` to your actual filename
      e.g.  src:'images/my-real-reel.mp4'
      The format is detected automatically — no other changes needed.
═══════════════════════════════════════════════════════════════════ */

const PILLAR_DATA = {
  /* ════════════════════════════════════════════════════════════
     PILLAR 1 — SOCIAL MEDIA MANAGEMENT
     ════════════════════════════════════════════════════════════ */
  smm: {
    cat:'Pillar 01', title:'Social Media Management',
    desc:'Strategy, content, analytics, ads, and community management across 7 platforms. Click any sub-service below to see real samples.',
    bg:'linear-gradient(135deg,#1a2a4a 0%,#833ab4 40%,#fd1d1d 70%,#fcb045 100%)',
    icon:'📲', tag:'Social Media',
    subcats:[
      {
        id:'smm-instagram', name:'Instagram Management', icon:'📸',
        cat:'Instagram Management',
        title:'Instagram Growth & Content Strategy',
        desc:'Full Instagram account management — grid planning, posts, carousels, reels, stories, ads, captions, and monthly analytics.',
        services:['Grid layout & aesthetic planning','Posts, carousels, reels & stories','Caption writing with targeted hashtags','Instagram ads & boosted posts','Content calendar & posting schedule','Monthly analytics & growth reporting'],
        tools:'Canva · CapCut · Buffer · Planable · Meta Business Suite',
        bg:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
        samples:[
          {src:'images/iggrid1.jpg', label:'IG Grid Layout', mockBg:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', mockIcon:'📸', mockLines:['9-grid aesthetic','Brand-matched palette','Cohesive feed']},
          {src:'images/igpost1.jpg', label:'Single Post Design', mockBg:'linear-gradient(135deg,#9b3ab4,#e91e63)', mockIcon:'🖼', mockLines:['On-brand visuals','Caption + hashtags','Engagement-driven']},
          {src:'images/igcarousel1.jpg', label:'Carousel Sample', mockBg:'linear-gradient(135deg,#6a1b9a,#c2185b)', mockIcon:'🎴', mockLines:['10-slide carousel','Educational content','Save-worthy design']},
          {src:'images/igreel1.mp4', label:'Reel Sample', mockBg:'linear-gradient(135deg,#4a148c,#d81b60)', mockIcon:'🎥', mockLines:['Short-form vertical content','Hook + CTA','Trending audio']},
          {src:'images/igstory1.jpg', label:'Story Frame', mockBg:'linear-gradient(135deg,#7b1fa2,#f06292)', mockIcon:'⏱', mockLines:['Branded story design','Polls + stickers','9:16 ratio']},
          {src:'images/igad1.jpg', label:'Instagram Ad Creative', mockBg:'linear-gradient(135deg,#311b92,#ad1457)', mockIcon:'🎯', mockLines:['Boosted post creative','Target audience','A/B tested']},
          {src:'images/igcaption1.jpg', label:'Caption & Hashtag Bank', mockBg:'linear-gradient(135deg,#4a1a6a,#c0392b)', mockIcon:'✍️', mockLines:['30 caption templates','Niche hashtag sets','Per post type']},
          {src:'images/iganalytics1.jpg', label:'Monthly Analytics Report', mockBg:'linear-gradient(135deg,#1a1410,#3a2820)', mockIcon:'📊', mockLines:['Reach +42% MoM','Followers: +318','Engagement: 6.2%']}
          /* ➕ Add more: copy a line above. Supports .jpg .png .gif .pdf .mp4 .mov */
        ]
      },
      {
        id:'smm-facebook', name:'Facebook Page Management', icon:'👍',
        cat:'Facebook Page Management',
        title:'Facebook Page Strategy & Management',
        desc:'Page management — grid samples, posts, carousels, reels, stories, ads, cover photos, captions, content planning, and analytics.',
        services:['Page bio & cover photo design','Posts, carousels, reels & stories','Caption writing & content planning','Facebook ads & boosted posts','Inbox & comment management','Page insights & engagement reports'],
        tools:'Meta Business Suite · Canva · Buffer · Facebook Ads Manager',
        bg:'linear-gradient(135deg,#1a2a4a,#1877f2)',
        samples:[
          {src:'images/fbgrid1.jpg', label:'Facebook Page Grid Sample', mockBg:'linear-gradient(135deg,#1a2a4a,#1877f2)', mockIcon:'🗂', mockLines:['Cohesive page feed','Brand-aligned visuals','Content variety']},
          {src:'images/fbcover1.jpg', label:'Facebook Cover Photo', mockBg:'linear-gradient(135deg,#0d2257,#1976d2)', mockIcon:'🖼', mockLines:['820x312 sized','Brand identity','Clear CTA']},
          {src:'images/fbpost1.jpg', label:'Single Post Design', mockBg:'linear-gradient(135deg,#0d47a1,#1565c0)', mockIcon:'📰', mockLines:['Engaging visual','Caption included','Optimized for FB']},
          {src:'images/fbcarousel1.jpg', label:'Carousel Post', mockBg:'linear-gradient(135deg,#0a3d91,#1e88e5)', mockIcon:'🎴', mockLines:['Multi-image post','Story-driven','High engagement']},
          {src:'images/fbreel1.mp4', label:'Facebook Reel', mockBg:'linear-gradient(135deg,#082878,#1565c0)', mockIcon:'🎥', mockLines:['Mobile-friendly format','Hook + CTA','FB-native format']},
          {src:'images/fbstory1.jpg', label:'Facebook Story', mockBg:'linear-gradient(135deg,#0d47a1,#42a5f5)', mockIcon:'⏱', mockLines:['Daily story design','Quick updates','Brand-consistent']},
          {src:'images/fbad1.jpg', label:'Facebook Ad Creative', mockBg:'linear-gradient(135deg,#0a1830,#0d47a1)', mockIcon:'🎯', mockLines:['Targeted creative','Conversion focused','A/B test results']},
          {src:'images/fbcalendar1.jpg', label:'Content Calendar', mockBg:'linear-gradient(135deg,#1a2a4a,#1877f2)', mockIcon:'📅', mockLines:['30-day plan','Caption library','Scheduled posts']},
          {src:'images/fbanalytics1.jpg', label:'Page Insights Report', mockBg:'linear-gradient(135deg,#0d1b3e,#1565c0)', mockIcon:'📊', mockLines:['Page reach: 12.4K','Engagement: 8.7%','Inbox: 100%']}
        ]
      },
      {
        id:'smm-fbgroup', name:'Facebook Group Management', icon:'👥',
        cat:'Facebook Group Management',
        title:'Facebook Group Community Management',
        desc:'Build and manage thriving Facebook groups — member welcome flows, daily engagement posts, moderation, and growth strategy.',
        services:['New member welcome sequences','Daily engagement & discussion posts','Moderation & spam removal','Weekly themed content (polls, Q&As)','Pinned posts & rules setup','Group growth & event promotion'],
        tools:'Meta Business Suite · Canva · Notion · Google Sheets',
        bg:'linear-gradient(135deg,#0a1a2a,#0d6efd)',
        samples:[
          {src:'images/fbgroup-cover1.jpg', label:'Group Cover Design', mockBg:'linear-gradient(135deg,#0a1a2a,#0d6efd)', mockIcon:'🖼', mockLines:['1640x856 cover','Group branding','Welcome message']},
          {src:'images/fbgroup-welcome1.jpg', label:'Welcome Sequence', mockBg:'linear-gradient(135deg,#04080f,#1565c0)', mockIcon:'👋', mockLines:['Auto welcome msg','Pinned rules post','Onboarding flow']},
          {src:'images/fbgroup-poll1.jpg', label:'Engagement Poll Post', mockBg:'linear-gradient(135deg,#082545,#1976d2)', mockIcon:'📊', mockLines:['Weekly poll design','Discussion prompt','Member engagement']},
          {src:'images/fbgroup-calendar1.jpg', label:'Content Schedule', mockBg:'linear-gradient(135deg,#0a1a2a,#0d6efd)', mockIcon:'📅', mockLines:['Weekly themes','Q&A days','Tip Tuesdays']},
          {src:'images/fbgroup-rules1.jpg', label:'Group Rules Document', mockBg:'linear-gradient(135deg,#0d1b3e,#1565c0)', mockIcon:'📜', mockLines:['Community guidelines','Posting rules','Moderation policy']},
          {src:'images/fbgroup-analytics1.jpg', label:'Community Growth Report', mockBg:'linear-gradient(135deg,#060f1a,#0b55d4)', mockIcon:'📈', mockLines:['New members: +214','Engagement: 28','Clean log']}
        ]
      },
      {
        id:'smm-tiktok', name:'TikTok Management', icon:'♪',
        cat:'TikTok Management',
        title:'TikTok Content Strategy & Growth',
        desc:'Trend research, reel production, captions, hashtags, posting schedule, and weekly analytics review.',
        services:['Trend & sound research','Reel scripts & captions','Hashtag & niche targeting','Weekly content calendar','Posting schedule management','TikTok analytics review'],
        tools:'CapCut · TikTok Creator Studio · Canva · Buffer',
        bg:'linear-gradient(135deg,#0a0a0a,#ff0050)',
        samples:[
          {src:'images/tiktok-reel1.mp4', label:'TikTok Reel Sample', mockBg:'linear-gradient(135deg,#0a0a0a,#ff0050)', mockIcon:'🎥', mockLines:['Strong opening hook','Trending sound','Strong CTA']},
          {src:'images/tiktok-reel2.mp4', label:'Educational Reel', mockBg:'linear-gradient(135deg,#1a0010,#cc003d)', mockIcon:'📚', mockLines:['Step-by-step format','Step-by-step','Save-worthy']},
          {src:'images/tiktok-cover1.jpg', label:'TikTok Cover Design', mockBg:'linear-gradient(135deg,#0d0d0d,#ff0050)', mockIcon:'🖼', mockLines:['Eye-catching cover','Branded text','High CTR']},
          {src:'images/tiktok-script1.jpg', label:'Hook & Script Templates', mockBg:'linear-gradient(135deg,#0d0d0d,#69C9D0)', mockIcon:'✍️', mockLines:['10 hook formulas','POV formats','Engagement prompts']},
          {src:'images/tiktok-calendar1.jpg', label:'TikTok Content Plan', mockBg:'linear-gradient(135deg,#0a0a0a,#ff0050)', mockIcon:'📅', mockLines:['Weekly scripts','Trend research','Posting schedule']},
          {src:'images/tiktok-analytics1.jpg', label:'TikTok Growth Report', mockBg:'linear-gradient(135deg,#1a0010,#cc003d)', mockIcon:'📈', mockLines:['Views: 48K','Followers: +620','Watch time: 74%']}
        ]
      },
      {
        id:'smm-youtube', name:'YouTube Management', icon:'▶️',
        cat:'YouTube Management',
        title:'YouTube Channel Management',
        desc:'Channel covers, thumbnails, content plans, SEO-optimized titles, descriptions, scheduling, and weekly analytics.',
        services:['Channel cover & thumbnail design','SEO-optimized titles & descriptions','Content & upload plan','Tag research per video','Comment moderation','Weekly analytics reporting'],
        tools:'YouTube Studio · TubeBuddy · Canva · Google Sheets',
        bg:'linear-gradient(135deg,#1c0a0a,#ff0000)',
        samples:[
          {src:'images/yt-banner1.jpg', label:'YouTube Channel Banner', mockBg:'linear-gradient(135deg,#1c0a0a,#cc0000)', mockIcon:'🎨', mockLines:['2560x1440 banner','Brand identity','Schedule info']},
          {src:'images/yt-thumbnail1.jpg', label:'Video Thumbnail Design', mockBg:'linear-gradient(135deg,#1a0505,#e53935)', mockIcon:'🖼', mockLines:['Eye-catching design','High CTR','Brand-consistent']},
          {src:'images/yt-thumbnail2.jpg', label:'Thumbnail Series', mockBg:'linear-gradient(135deg,#2a0a0a,#ff0000)', mockIcon:'✨', mockLines:['Series consistency','Visual hierarchy','Tested designs']},
          {src:'images/yt-plan1.jpg', label:'Content Plan Document', mockBg:'linear-gradient(135deg,#1c0a0a,#cc0000)', mockIcon:'📋', mockLines:['12-week plan','Topic research','Upload schedule']},
          {src:'images/yt-seo1.jpg', label:'SEO Title & Description Sheet', mockBg:'linear-gradient(135deg,#2a0808,#ff0000)', mockIcon:'🔍', mockLines:['Keyword research','Description copy','Tag library']},
          {src:'images/yt-analytics1.jpg', label:'Channel Analytics Report', mockBg:'linear-gradient(135deg,#2a0808,#ff0000)', mockIcon:'📊', mockLines:['Watch hours: 1,240','Subs: +88','CTR: 9.3%']}
        ]
      },
      {
        id:'smm-pinterest', name:'Pinterest Management', icon:'📌',
        cat:'Pinterest Management',
        title:'Pinterest Traffic Strategy',
        desc:'Pin design, board organization, keyword research, scheduling, and traffic-focused growth strategy.',
        services:['Pin design & keyword descriptions','Board organization & SEO','Tailwind scheduling','Rich Pin setup','Pinterest analytics','Seasonal content planning'],
        tools:'Canva · Tailwind · Pinterest Business Analytics',
        bg:'linear-gradient(135deg,#2a0a0a,#e60023)',
        samples:[
          {src:'images/pin-design1.jpg', label:'Pin Design Sample', mockBg:'linear-gradient(135deg,#3a0a0a,#ff1744)', mockIcon:'📌', mockLines:['Vertical 1000x1500','Keyword title','High click-through']},
          {src:'images/pin-design2.jpg', label:'Pin Design Variation', mockBg:'linear-gradient(135deg,#2a0505,#e60023)', mockIcon:'🖼', mockLines:['A/B test variant','Branded template','SEO description']},
          {src:'images/pin-board1.jpg', label:'Board Strategy Layout', mockBg:'linear-gradient(135deg,#2a0a0a,#e60023)', mockIcon:'🗂', mockLines:['Board organization','SEO board names','Content categories']},
          {src:'images/pin-strategy1.jpg', label:'Pinterest Strategy Doc', mockBg:'linear-gradient(135deg,#1a0505,#b5001a)', mockIcon:'📋', mockLines:['Keyword research','Pin schedule','Seasonal map']},
          {src:'images/pin-analytics1.jpg', label:'Pinterest Analytics Report', mockBg:'linear-gradient(135deg,#1a0505,#b5001a)', mockIcon:'📈', mockLines:['Impressions: 94K','Clicks: +38%','Top pins tracked']}
        ]
      },
      {
        id:'smm-reddit', name:'Reddit Management', icon:'🤖',
        cat:'Reddit Management',
        title:'Reddit Community Management',
        desc:'Subreddit research, authentic posting, brand reputation monitoring, and community engagement.',
        services:['Subreddit research & mapping','Authentic post creation','Brand reputation monitoring','Scheduled value posts','Comment & thread management','Monthly Reddit activity report'],
        tools:'Reddit · Later · Google Sheets · Brand24',
        bg:'linear-gradient(135deg,#1a1010,#ff4500)',
        samples:[
          {src:'images/reddit-map1.jpg', label:'Subreddit Research Map', mockBg:'linear-gradient(135deg,#1a1010,#cc3700)', mockIcon:'🗺', mockLines:['15 target subreddits','Audience analysis','Posting rules']},
          {src:'images/reddit-post1.jpg', label:'Sample Community Post', mockBg:'linear-gradient(135deg,#180e08,#e53d00)', mockIcon:'✍️', mockLines:['Value-first format','Authentic voice','No-spam approach']},
          {src:'images/reddit-strategy1.jpg', label:'Reddit Engagement Strategy', mockBg:'linear-gradient(135deg,#0f0a08,#ff4500)', mockIcon:'📋', mockLines:['Tone guide','Post calendar','Brand mentions']},
          {src:'images/reddit-analytics1.jpg', label:'Reddit Activity Report', mockBg:'linear-gradient(135deg,#0f0a08,#ff4500)', mockIcon:'📊', mockLines:['Posts: 24/mo','Upvote ratio: 91%','Mentions tracked']}
        ]
      },
      {
        id:'smm-calendar', name:'Content Calendar System', icon:'📅',
        cat:'Cross-Platform Strategy',
        title:'Content Calendar System',
        desc:'A unified content calendar covering all your platforms — themes, captions, visuals, and scheduling in one place.',
        services:['3-month editorial calendar','Platform-specific captions','Reusable Canva templates','Content theme planning','Scheduling across platforms','Performance tracking sheet'],
        tools:'Notion · Google Sheets · Canva · Buffer · Planable',
        bg:'linear-gradient(135deg,#201a14,#2e2518)',
        samples:[
          {src:'images/calendar-monthly1.jpg', label:'Monthly Calendar View', mockBg:'linear-gradient(135deg,#201a14,#2e2518)', mockIcon:'📅', mockLines:['30-day at a glance','Theme color-coding','All platforms']},
          {src:'images/calendar-quarterly1.jpg', label:'3-Month Editorial Plan', mockBg:'linear-gradient(135deg,#1a1410,#3a2820)', mockIcon:'🗓', mockLines:['90 post ideas','Cross-platform captions','Holiday planning']},
          {src:'images/calendar-template1.jpg', label:'Reusable Content Template', mockBg:'linear-gradient(135deg,#2c2418,#403428)', mockIcon:'🎨', mockLines:['30 Canva templates','Brand-matched','Plug-and-play']},
          {src:'images/calendar-tracker1.jpg', label:'Performance Tracker', mockBg:'linear-gradient(135deg,#181410,#2c2418)', mockIcon:'📊', mockLines:['Per-post metrics','Weekly summary','Trend insights']}
        ]
      }
    ]
  },

  /* ════════════════════════════════════════════════════════════
     PILLAR 2 — CREATIVE DESIGN
     ════════════════════════════════════════════════════════════ */
  design: {
    cat:'Pillar 02', title:'Creative Design',
    desc:'A visual gallery of branding, email templates, print, editorial, infographics, and web graphics. Click any sub-service to view samples.',
    bg:'linear-gradient(135deg,#b5445a 0%,#943648 40%,#c8923a 100%)',
    icon:'🎨', tag:'Creative Design',
    subcats:[
      {
        id:'design-branding', name:'Branding', icon:'🏷',
        cat:'Branding & Identity',
        title:'Brand Kit & Identity Design',
        desc:'Full brand identity packages — logo concepts, color palettes, typography systems, and brand guidelines.',
        services:['Logo design & variations','Color palette systems','Typography guidelines','Brand asset library','Usage guide & do/don\'ts','Brand reveal mockups'],
        tools:'Canva · Adobe Photoshop · Adobe Illustrator',
        bg:'linear-gradient(135deg,#b5445a,#943648)',
        samples:[
          {src:'images/brand-logo1.jpg', label:'Logo Design Concept', mockBg:'linear-gradient(135deg,#b5445a,#943648)', mockIcon:'🏷', mockLines:['Primary logo','Variations','Black/white versions']},
          {src:'images/brand-palette1.jpg', label:'Color Palette System', mockBg:'linear-gradient(135deg,#943648,#c8923a)', mockIcon:'🎨', mockLines:['Primary + secondary','Usage ratios','Accessibility tested']},
          {src:'images/brand-typography1.jpg', label:'Typography Scale', mockBg:'linear-gradient(135deg,#7a2c3a,#b5445a)', mockIcon:'🔤', mockLines:['Heading hierarchy','Body type','Pairing guide']},
          {src:'images/brand-guidelines1.jpg', label:'Brand Guidelines PDF', mockBg:'linear-gradient(135deg,#1a1410,#943648)', mockIcon:'📖', mockLines:['Full brand bible','Comprehensive guide','Do/don\'t examples']},
          {src:'images/brand-mockup1.jpg', label:'Brand Reveal Mockups', mockBg:'linear-gradient(135deg,#b5445a,#c8923a)', mockIcon:'✨', mockLines:['Real-world mockups','Print + digital','Presentation-ready']}
        ]
      },
      {
        id:'design-email', name:'Email Design', icon:'✉',
        cat:'Email Design',
        title:'Email Newsletter & Campaign Templates',
        desc:'Mobile-responsive email templates designed in Canva and coded for Mailchimp, ActiveCampaign, and other ESPs.',
        services:['Newsletter templates','Welcome email designs','Campaign email graphics','Promo & sale email layouts','Header & footer design','Mobile responsive design'],
        tools:'Canva · Mailchimp · ActiveCampaign',
        bg:'linear-gradient(135deg,#1a1410,#b5445a)',
        samples:[
          {src:'images/email-newsletter1.jpg', label:'Newsletter Template', mockBg:'linear-gradient(135deg,#1a1410,#b5445a)', mockIcon:'✉', mockLines:['Mobile responsive','On-brand','CTA-focused']},
          {src:'images/email-welcome1.jpg', label:'Welcome Email Design', mockBg:'linear-gradient(135deg,#251410,#321a14)', mockIcon:'👋', mockLines:['First impression','Brand intro','Soft CTA']},
          {src:'images/email-promo1.jpg', label:'Promo Email Design', mockBg:'linear-gradient(135deg,#321a14,#b5445a)', mockIcon:'🎁', mockLines:['Sale announcement','Urgency-focused','Strong CTA']},
          {src:'images/email-sequence1.jpg', label:'Email Sequence Plan', mockBg:'linear-gradient(135deg,#1a1410,#3a2820)', mockIcon:'🔁', mockLines:['5-email sequence','Subject lines','Send schedule']}
        ]
      },
      {
        id:'design-print', name:'Print Design', icon:'🖨',
        cat:'Print Design',
        title:'Print & Marketing Materials',
        desc:'Print-ready materials — flyers, brochures, business cards, posters, and marketing collateral.',
        services:['Flyers & brochures','Business cards','Posters & banners','Menus & catalogs','Trade show materials','Print-ready file prep'],
        tools:'Canva · Adobe InDesign · Adobe Illustrator',
        bg:'linear-gradient(135deg,#3a2a1a,#c8923a)',
        samples:[
          {src:'images/print-flyer1.jpg', label:'Event Flyer Design', mockBg:'linear-gradient(135deg,#3a2a1a,#c8923a)', mockIcon:'📄', mockLines:['A4/A5 size','Print-ready','High resolution']},
          {src:'images/print-bizcard1.jpg', label:'Business Card', mockBg:'linear-gradient(135deg,#2a1a0a,#a87528)', mockIcon:'💳', mockLines:['Front + back','Bleed-ready','Brand-consistent']},
          {src:'images/print-brochure1.jpg', label:'Tri-Fold Brochure', mockBg:'linear-gradient(135deg,#3a2a1a,#c8923a)', mockIcon:'📑', mockLines:['Tri-fold layout','Print-ready','Editable']},
          {src:'images/print-poster1.jpg', label:'Poster Design', mockBg:'linear-gradient(135deg,#1a1410,#3a2a1a)', mockIcon:'🖼', mockLines:['Large format','Eye-catching','Print-ready']}
        ]
      },
      {
        id:'design-editorial', name:'Editorial Design', icon:'📖',
        cat:'Editorial Design',
        title:'Editorial & Publication Design',
        desc:'Magazine layouts, eBooks, lookbooks, and long-form publication design.',
        services:['eBook layout & design','Magazine spreads','Lookbook design','Lead magnet PDFs','Workbook design','Multi-page documents'],
        tools:'Canva · Adobe InDesign · Affinity Publisher',
        bg:'linear-gradient(135deg,#2a1a3a,#943648)',
        samples:[
          {src:'images/editorial-ebook1.jpg', label:'eBook Design', mockBg:'linear-gradient(135deg,#2a1a3a,#943648)', mockIcon:'📚', mockLines:['Cover + interior','Multi-page layout','Lead magnet ready']},
          {src:'images/editorial-magazine1.jpg', label:'Magazine Spread', mockBg:'linear-gradient(135deg,#1a0e2a,#7a2c3a)', mockIcon:'📰', mockLines:['Editorial layout','Typography hierarchy','Print quality']},
          {src:'images/editorial-workbook1.jpg', label:'Workbook Design', mockBg:'linear-gradient(135deg,#3a2a4a,#943648)', mockIcon:'✏️', mockLines:['Interactive fields','Branded design','Worksheet pages']},
          {src:'images/editorial-lookbook1.jpg', label:'Lookbook Layout', mockBg:'linear-gradient(135deg,#2a1a3a,#b5445a)', mockIcon:'👗', mockLines:['Photo-led layout','Editorial styling','Brand-consistent']}
        ]
      },
      {
        id:'design-infographics', name:'Infographics', icon:'📊',
        cat:'Infographics',
        title:'Infographics & Data Visualization',
        desc:'Visual content that communicates clearly — branded infographics, charts, and shareable graphics.',
        services:['Branded infographics','Process diagrams','Data visualizations','Step-by-step guides','Statistics graphics','Shareable social infographics'],
        tools:'Canva · Adobe Illustrator · Figma',
        bg:'linear-gradient(135deg,#1a3a2a,#3a8a5a)',
        samples:[
          {src:'images/infographic1.jpg', label:'Branded Infographic', mockBg:'linear-gradient(135deg,#1a3a2a,#3a8a5a)', mockIcon:'📊', mockLines:['Data viz','On-brand','Shareable format']},
          {src:'images/infographic-process1.jpg', label:'Process Diagram', mockBg:'linear-gradient(135deg,#0e2a1a,#2c6a4a)', mockIcon:'🔄', mockLines:['Step-by-step flow','Visual hierarchy','Easy to follow']},
          {src:'images/infographic-stats1.jpg', label:'Statistics Graphic', mockBg:'linear-gradient(135deg,#1a3a2a,#5aa87a)', mockIcon:'📈', mockLines:['Data storytelling','Brand colors','Social-ready']},
          {src:'images/infographic-guide1.jpg', label:'How-To Visual Guide', mockBg:'linear-gradient(135deg,#0a2018,#3a8a5a)', mockIcon:'📋', mockLines:['Step-by-step PDF','Lead magnet','Shareable']}
        ]
      },
      {
        id:'design-webgraphics', name:'Web Graphics', icon:'🖼',
        cat:'Web Graphics',
        title:'Web Graphics & Banners',
        desc:'Web banners, hero images, blog headers, and graphics optimized for digital channels.',
        services:['Website hero images','Blog post headers','Web banners & ads','Email banners','Landing page graphics','Featured image design'],
        tools:'Canva · Photoshop · Figma',
        bg:'linear-gradient(135deg,#1a2a3a,#3a6a8a)',
        samples:[
          {src:'images/web-hero1.jpg', label:'Website Hero Image', mockBg:'linear-gradient(135deg,#1a2a3a,#3a6a8a)', mockIcon:'🖼', mockLines:['1920x800','Brand-aligned','Web-optimized']},
          {src:'images/web-banner1.jpg', label:'Web Banner Ad', mockBg:'linear-gradient(135deg,#0a1a2a,#2c5a7a)', mockIcon:'🎯', mockLines:['Multiple sizes','Conversion CTA','High click rate']},
          {src:'images/web-blogheader1.jpg', label:'Blog Post Header', mockBg:'linear-gradient(135deg,#1a2a3a,#5a8aaa)', mockIcon:'📰', mockLines:['Featured image','SEO-friendly','Brand-style']},
          {src:'images/web-featured1.gif', label:'Animated Featured GIF', mockBg:'linear-gradient(135deg,#0a1a2a,#3a6a8a)', mockIcon:'✨', mockLines:['Eye-catching motion','Eye-catching','Web-optimized']}
        ]
      },
      {
        id:'design-social', name:'Social Media Design', icon:'📱',
        cat:'Social Media Design',
        title:'Social Media Graphics & Templates',
        desc:'Branded post templates, story frames, reel covers, and quote posts ready to plug-and-play.',
        services:['Instagram post templates','Story templates & frames','Reel cover designs','Quote post graphics','Highlight cover icons','Carousel designs'],
        tools:'Canva · Photoshop · Brand Guidelines',
        bg:'linear-gradient(135deg,#833ab4,#fd1d1d)',
        samples:[
          {src:'images/social-templates1.jpg', label:'Post Template Pack', mockBg:'linear-gradient(135deg,#833ab4,#fd1d1d)', mockIcon:'📱', mockLines:['10 templates','Multi-platform','Plug-and-play']},
          {src:'images/social-story1.jpg', label:'Story Template Set', mockBg:'linear-gradient(135deg,#6a1b9a,#e91e63)', mockIcon:'⏱', mockLines:['Story frames','Polls + stickers','9:16 ratio']},
          {src:'images/social-reelcover1.jpg', label:'Reel Cover Pack', mockBg:'linear-gradient(135deg,#4a148c,#d81b60)', mockIcon:'🎥', mockLines:['Reel thumbnails','Series consistency','High CTR']},
          {src:'images/social-quote1.jpg', label:'Quote Post Series', mockBg:'linear-gradient(135deg,#7b1fa2,#f06292)', mockIcon:'💬', mockLines:['Typography focus','Shareable','Brand voice']},
          {src:'images/social-highlight1.jpg', label:'Highlight Cover Icons', mockBg:'linear-gradient(135deg,#311b92,#ad1457)', mockIcon:'✨', mockLines:['Cohesive icons','Brand-matched','12 covers']}
        ]
      }
    ]
  },

  /* ════════════════════════════════════════════════════════════
     PILLAR 3 — ADMIN & EXECUTIVE VA
     ════════════════════════════════════════════════════════════ */
  admin: {
    cat:'Pillar 03', title:'Admin & Executive VA',
    desc:'Behind-the-scenes systems that keep businesses running smoothly. Click any sub-service to see real samples.',
    bg:'linear-gradient(135deg,#1c1828 0%,#2a2438 50%,#3a2c4a 100%)',
    icon:'📋', tag:'Admin & Executive VA',
    subcats:[
      {
        id:'admin-copywriting', name:'Copywriting', icon:'✍️',
        cat:'Copywriting',
        title:'Copywriting — Blogs, Articles & Web Copy',
        desc:'SEO-optimized blog posts, articles, web copy, and long-form content for clients in wellness, real estate, and coaching.',
        services:['Blog & article writing','Web copy & landing pages','Newsletter copy','Long-form content','Brand voice writing','SEO-optimized articles'],
        tools:'Google Docs · Grammarly · SurferSEO',
        bg:'linear-gradient(135deg,#1a1820,#2c2838)',
        samples:[
          {src:'images/copy-blog1.jpg', label:'Blog Article Sample', mockBg:'linear-gradient(135deg,#1a1820,#2c2838)', mockIcon:'✍️', mockLines:['1500+ words','SEO-optimized','Wellness niche']},
          {src:'images/copy-blog2.jpg', label:'Real Estate Article', mockBg:'linear-gradient(135deg,#181420,#2a2030)', mockIcon:'🏠', mockLines:['Real estate copy','Authority-driven','Lead-gen focused']},
          {src:'images/copy-newsletter1.jpg', label:'Newsletter Copy Sample', mockBg:'linear-gradient(135deg,#1a1420,#2c1e30)', mockIcon:'📰', mockLines:['Engaging hook','Personal voice','Subscriber retention']},
          {src:'images/copy-web1.jpg', label:'Web Copy Sample', mockBg:'linear-gradient(135deg,#201828,#2c2440)', mockIcon:'🌐', mockLines:['Landing page copy','Conversion-focused','Brand voice']}
        ]
      },
      {
        id:'admin-web', name:'Website Design (Simple)', icon:'🌐',
        cat:'Web Design',
        title:'Simple Website Design',
        desc:'Clean, simple websites — portfolios, landing pages, and service pages. Built to convert and easy to maintain.',
        services:['Portfolio websites','Landing pages','Service pages','Contact form integration','Mobile-responsive design','SEO setup basics'],
        tools:'Wix · WordPress · Squarespace · Carrd',
        bg:'linear-gradient(135deg,#18201c,#223028)',
        samples:[
          {src:'images/web1.jpg', label:'Portfolio Site', mockBg:'linear-gradient(135deg,#18201c,#223028)', mockIcon:'🌐', mockLines:['Skills + services','Work samples','Clean design']},
          {src:'images/web2.jpg', label:'Business Landing Page', mockBg:'linear-gradient(135deg,#201820,#301a28)', mockIcon:'🌐', mockLines:['Conversion-focused','Testimonials','Clear CTA']},
          {src:'images/web3.jpg', label:'Service Business Site', mockBg:'linear-gradient(135deg,#1a1820,#252038)', mockIcon:'🌐', mockLines:['About + services','Contact form','Built from scratch']}
        ]
      },
      {
        id:'admin-crm', name:'CRM Pipeline', icon:'🗃',
        cat:'CRM Management',
        title:'CRM Pipeline Setup & Management',
        desc:'Full CRM pipelines with custom deal stages, contact properties, task reminders, and automated workflows.',
        services:['CRM pipeline setup','Custom deal stages','Contact properties & tags','Automated workflows','Task reminders','Lead nurture sequences'],
        tools:'HubSpot · Salesforce · Pipedrive · Zoho',
        bg:'linear-gradient(135deg,#201c14,#302a1c)',
        samples:[
          {src:'images/crm-pipeline1.jpg', label:'HubSpot Pipeline', mockBg:'linear-gradient(135deg,#201c14,#302a1c)', mockIcon:'🗃', mockLines:['Custom deal stages','Contact properties','Workflow setup']},
          {src:'images/crm-workflow1.jpg', label:'Automation Workflow', mockBg:'linear-gradient(135deg,#181410,#2a1f18)', mockIcon:'⚙️', mockLines:['Email triggers','Task creation','Onboarding flow']},
          {src:'images/crm-dashboard1.jpg', label:'CRM Dashboard', mockBg:'linear-gradient(135deg,#181410,#3a2a18)', mockIcon:'📊', mockLines:['Pipeline overview','Lead source tracking','Conversion stats']}
        ]
      },
      {
        id:'admin-ghl', name:'GoHighLevel', icon:'⚙',
        cat:'GoHighLevel',
        title:'GoHighLevel Funnel & Automation',
        desc:'Complete GHL setup — funnels, lead capture, automated follow-up sequences, and CRM integration.',
        services:['Sales funnel build','Lead capture forms','Automated follow-up sequences','SMS & email automation','Pipeline integration','Calendar booking setup'],
        tools:'GoHighLevel · Zapier · Twilio',
        bg:'linear-gradient(135deg,#1a1820,#252030)',
        samples:[
          {src:'images/ghl-funnel1.jpg', label:'GHL Sales Funnel', mockBg:'linear-gradient(135deg,#1a1820,#252030)', mockIcon:'⚙', mockLines:['Lead capture','Automated sequence','18% conversion']},
          {src:'images/ghl-automation1.jpg', label:'Automation Setup', mockBg:'linear-gradient(135deg,#141420,#2a2440)', mockIcon:'🤖', mockLines:['Email + SMS','Trigger-based','Multi-step']},
          {src:'images/ghl-pipeline1.jpg', label:'Pipeline Integration', mockBg:'linear-gradient(135deg,#181428,#302438)', mockIcon:'🔗', mockLines:['CRM connected','Calendar booking','Deal tracking']}
        ]
      },
      {
        id:'admin-gdrive', name:'Google Drive Organization', icon:'📂',
        cat:'Organization & Systems',
        title:'Google Drive Organization',
        desc:'Rebuild cluttered Drives into clear folder structures with naming conventions, color coding, and master index docs.',
        services:['Folder structure design','Naming conventions','Color coding system','Master index document','File access cleanup','Sharing permissions audit'],
        tools:'Google Drive · Google Docs · Google Sheets',
        bg:'linear-gradient(135deg,#1a1c28,#252838)',
        samples:[
          {src:'images/gdrive-structure1.jpg', label:'Folder Structure Map', mockBg:'linear-gradient(135deg,#1a1c28,#252838)', mockIcon:'📂', mockLines:['Clear hierarchy','Naming rules','Color coded']},
          {src:'images/gdrive-index1.jpg', label:'Master Index Doc', mockBg:'linear-gradient(135deg,#181a26,#202838)', mockIcon:'📋', mockLines:['Clickable index','Quick file access','Updated weekly']},
          {src:'images/gdrive-before-after1.jpg', label:'Before & After Cleanup', mockBg:'linear-gradient(135deg,#1a1c28,#3a3a4a)', mockIcon:'✨', mockLines:['Cluttered → Clean','3-year archive','Logical groups']}
        ]
      },
      {
        id:'admin-inbox', name:'Inbox & Email Management', icon:'📬',
        cat:'Inbox Management',
        title:'Inbox & Email Management',
        desc:'Full inbox setup — filtering rules, canned response templates, and a zero-inbox system.',
        services:['Inbox setup & filtering rules','Canned response templates','Email triage system','Zero-inbox process','Daily inbox monitoring','Response time tracking'],
        tools:'Gmail · Outlook · Spike · Front',
        bg:'linear-gradient(135deg,#1e1818,#2a2020)',
        samples:[
          {src:'images/inbox-filters1.jpg', label:'Filter Rules Setup', mockBg:'linear-gradient(135deg,#1e1818,#2a2020)', mockIcon:'📬', mockLines:['Filter library','Auto-labels','Priority sorting']},
          {src:'images/inbox-templates1.jpg', label:'Canned Response Templates', mockBg:'linear-gradient(135deg,#181410,#2a201c)', mockIcon:'💬', mockLines:['20+ templates','Brand voice','Quick replies']},
          {src:'images/inbox-system1.jpg', label:'Zero-Inbox System Map', mockBg:'linear-gradient(135deg,#1a1410,#2c2018)', mockIcon:'🎯', mockLines:['Daily process','Response time -85%','Triage rules']}
        ]
      },
      {
        id:'admin-sheets', name:'Google Sheets Management', icon:'📊',
        cat:'Trackers & Sheets',
        title:'Google Sheets — Trackers & Dashboards',
        desc:'Custom trackers, dashboards, and reporting sheets — tasks, deadlines, client notes, color-coded priorities.',
        services:['Custom tracker design','Project & task trackers','Client management sheets','Dashboard reporting','Color-coded priority system','Formula & automation setup'],
        tools:'Google Sheets · Excel · Airtable',
        bg:'linear-gradient(135deg,#18201c,#223028)',
        samples:[
          {src:'images/sheets-master1.jpg', label:'Master Tracker Sheet', mockBg:'linear-gradient(135deg,#18201c,#223028)', mockIcon:'📊', mockLines:['Tasks + deadlines','Client notes','Color priorities']},
          {src:'images/sheets-dashboard1.jpg', label:'Dashboard View', mockBg:'linear-gradient(135deg,#141a18,#1c2c24)', mockIcon:'📈', mockLines:['Visual overview','Live formulas','KPIs']},
          {src:'images/sheets-tracker1.jpg', label:'Project Tracker', mockBg:'linear-gradient(135deg,#1a2420,#2c3830)', mockIcon:'✅', mockLines:['Project phases','Deadline alerts','Auto-status']}
        ]
      },
      {
        id:'admin-mailchimp', name:'Mailchimp & Newsletters', icon:'✉',
        cat:'Email Marketing',
        title:'Mailchimp & Newsletter Campaigns',
        desc:'Welcome sequences, newsletter campaigns, A/B testing, and subscriber list management.',
        services:['Welcome email sequences','Newsletter design & copy','A/B testing setup','List segmentation','Campaign reporting','Subscriber growth strategy'],
        tools:'Mailchimp · ActiveCampaign · ConvertKit',
        bg:'linear-gradient(135deg,#251410,#321a14)',
        samples:[
          {src:'images/mailchimp-welcome1.jpg', label:'Welcome Sequence Design', mockBg:'linear-gradient(135deg,#251410,#321a14)', mockIcon:'✉', mockLines:['5-email sequence','42% open rate','Wellness brand']},
          {src:'images/mailchimp-newsletter1.jpg', label:'Newsletter Campaign', mockBg:'linear-gradient(135deg,#1f0f0c,#2a1410)', mockIcon:'📧', mockLines:['Monthly newsletter','Subscriber growth','Click-tracked']},
          {src:'images/mailchimp-report1.jpg', label:'Campaign Performance Report', mockBg:'linear-gradient(135deg,#180c0a,#321a14)', mockIcon:'📊', mockLines:['Open rates','A/B test results','Growth metrics']}
        ]
      },
      {
        id:'admin-pm', name:'Project Management', icon:'📋',
        cat:'Project Management',
        title:'Project Management Setup',
        desc:'Full workspace setup across ClickUp, Notion, and Trello — tailored to each client\'s workflow.',
        services:['ClickUp workspace setup','Notion workspace setup','Trello board design','Task templates','Automated workflows','Team collaboration setup'],
        tools:'ClickUp · Notion · Trello · Asana',
        bg:'linear-gradient(135deg,#1c1828,#2a2438)',
        samples:[
          {src:'images/pm-trello1.jpg', label:'Trello Board Setup', mockBg:'linear-gradient(135deg,#1c1828,#2a2438)', mockIcon:'📋', mockLines:['Department boards','Card templates','Power-ups']},
          {src:'images/pm-clickup1.jpg', label:'ClickUp Workspace', mockBg:'linear-gradient(135deg,#1a1410,#2c1f18)', mockIcon:'📁', mockLines:['Custom task lists','Auto statuses','Templates']},
          {src:'images/pm-notion1.jpg', label:'Notion Workspace', mockBg:'linear-gradient(135deg,#181c18,#222e22)', mockIcon:'🗂', mockLines:['CRM database','Project tracker','SOP library']}
        ]
      },
      {
        id:'admin-seo', name:'SEO Strategy', icon:'🔍',
        cat:'SEO',
        title:'SEO Content Strategy',
        desc:'Complete content strategy with keyword research, pillar pages, and 3-month blog calendars.',
        services:['Keyword research','Content pillar strategy','3-month blog calendar','Meta description writing','Internal linking plan','Performance tracking'],
        tools:'SurferSEO · Ahrefs · Semrush · Google Search Console',
        bg:'linear-gradient(135deg,#14181a,#1e2c30)',
        samples:[
          {src:'images/seo-strategy1.jpg', label:'SEO Strategy Document', mockBg:'linear-gradient(135deg,#14181a,#1e2c30)', mockIcon:'🔍', mockLines:['Keyword research','Pillar pages','60% organic growth']},
          {src:'images/seo-keyword1.jpg', label:'Keyword Research Sheet', mockBg:'linear-gradient(135deg,#0e1416,#1a2528)', mockIcon:'🔑', mockLines:['Search volume','Difficulty score','Intent mapped']},
          {src:'images/seo-calendar1.jpg', label:'3-Month Blog Calendar', mockBg:'linear-gradient(135deg,#10181a,#1c2c30)', mockIcon:'📅', mockLines:['12 pillar topics','Internal links','Meta copy']}
        ]
      },
      {
        id:'admin-sop', name:'SOP & Documentation', icon:'📝',
        cat:'SOPs',
        title:'SOP & Documentation Library',
        desc:'Full library of Standard Operating Procedures — onboarding, reporting, content posting, and inbox triage.',
        services:['Onboarding SOPs','Reporting SOPs','Content posting SOPs','Inbox triage SOPs','Training documentation','Process flow diagrams'],
        tools:'Notion · Google Docs · Loom',
        bg:'linear-gradient(135deg,#201820,#301a28)',
        samples:[
          {src:'images/sop-onboarding1.jpg', label:'Client Onboarding SOP', mockBg:'linear-gradient(135deg,#201820,#301a28)', mockIcon:'📝', mockLines:['Welcome sequence','Tool access','First-week checklist']},
          {src:'images/sop-social1.jpg', label:'Social Media Posting SOP', mockBg:'linear-gradient(135deg,#1a1410,#2c2018)', mockIcon:'📱', mockLines:['Create→review→schedule','Platform-specific','Reporting']},
          {src:'images/sop-reporting1.jpg', label:'Weekly Reporting SOP', mockBg:'linear-gradient(135deg,#141820,#1e2838)', mockIcon:'📊', mockLines:['KPIs to pull','Report format','Stored in Notion']},
          {src:'images/sop-loom1.mp4', label:'Loom Training Walkthrough', mockBg:'linear-gradient(135deg,#201820,#3a2a3a)', mockIcon:'🎥', mockLines:['Step-by-step walkthrough','Step-by-step','Voice-over']}
        ]
      }
    ]
  }
};

/* ── PILLAR MODAL: open & render ── */
function openPillar(pillarKey){
  const p = PILLAR_DATA[pillarKey];
  if(!p) return;

  const banner = document.getElementById('pillarModalBanner');
  banner.style.background = p.bg;
  banner.innerHTML = '<div style="font-size:48px;position:relative;z-index:1;">'+p.icon+'</div>'
    + '<div style="font-size:11px;color:rgba(255,255,255,0.85);letter-spacing:0.18em;text-transform:uppercase;font-weight:600;position:relative;z-index:1;">'+p.tag+'</div>';

  document.getElementById('pillarModalCat').textContent = p.cat;
  document.getElementById('pillarModalTitle').textContent = p.title;
  document.getElementById('pillarModalDesc').textContent = p.desc;

  const grid = document.getElementById('pillarSubcatGrid');
  grid.innerHTML = '';
  p.subcats.forEach(function(sub){
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'subcat-card';
    card.onclick = function(){ openSubcat(pillarKey, sub.id); };
    card.innerHTML =
      '<div class="subcat-icon">'+(sub.icon||'📁')+'</div>'
      + '<div class="subcat-name">'+sub.name+'</div>'
      + '<div class="subcat-hint">View Samples →</div>';
    grid.appendChild(card);
  });

  document.getElementById('pillarModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePillarModal(e){ if(e.target===document.getElementById('pillarModal')) closePillarModalDirect(); }
function closePillarModalDirect(){
  document.getElementById('pillarModal').classList.remove('open');
  if(!document.getElementById('subcatModal') || !document.getElementById('subcatModal').classList.contains('open')){
    document.body.style.overflow = '';
  }
}

/* ── SUBCATEGORY MODAL: open & render ── */
function openSubcat(pillarKey, subId){
  const p = PILLAR_DATA[pillarKey];
  if(!p) return;
  const sub = p.subcats.find(function(s){ return s.id === subId; });
  if(!sub) return;

  document.getElementById('subcatModalBanner').style.background = sub.bg || p.bg;
  document.getElementById('subcatModalIcon').textContent = sub.icon || '📁';
  document.getElementById('subcatModalBannerCat').textContent = sub.cat || sub.name;

  document.getElementById('subcatModalCat').textContent = sub.cat || sub.name;
  document.getElementById('subcatModalTitle').textContent = sub.title || sub.name;
  document.getElementById('subcatModalDesc').textContent = sub.desc || '';

  const ul = document.getElementById('subcatModalServices');
  ul.innerHTML = '';
  (sub.services||[]).forEach(function(s){
    const li = document.createElement('li');
    li.textContent = s;
    ul.appendChild(li);
  });
  document.getElementById('subcatModalServicesWrap').style.display = (sub.services && sub.services.length) ? '' : 'none';

  document.getElementById('subcatModalTools').textContent = sub.tools || '';
  document.getElementById('subcatModalToolsWrap').style.display = sub.tools ? '' : 'none';

  if(typeof renderSampleCards === 'function'){
    renderSampleCards(sub.samples || [], 'subcatSamplesGrid');
  }

  document.getElementById('subcatModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSubcatModal(e){ if(e.target===document.getElementById('subcatModal')) closeSubcatModalDirect(); }
function closeSubcatModalDirect(){
  document.getElementById('subcatModal').classList.remove('open');
  if(document.getElementById('pillarModal') && document.getElementById('pillarModal').classList.contains('open')){
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

/* Close on ESC */
document.addEventListener('keydown', function(e){
  if(e.key !== 'Escape') return;
  var sub = document.getElementById('subcatModal');
  var pil = document.getElementById('pillarModal');
  if(sub && sub.classList.contains('open')) closeSubcatModalDirect();
  else if(pil && pil.classList.contains('open')) closePillarModalDirect();
});


/* ═══════════════════════════════════════════════════════════════════
   ★ UNIVERSAL SMART MEDIA LOADER ★
   Works on ALL pages. Detects any format automatically.
   Uses <img> onerror chaining — works perfectly on GitHub Pages.

   HOW TO USE:
     Upload your file to images/ with the SAME BASE NAME as the existing image.
     Examples:
       anne1.gif   → replaces anne1.jpg  (GIF wins over JPG)
       anne1.mp4   → replaces anne1.jpg  (video player appears)
       travel3.gif → replaces travel3.jpg
       insta2.mp4  → replaces insta2.jpg
     No HTML changes needed. Ever.

   FORMAT PRIORITY (first one found wins):
     .gif → .mp4 → .mov → .webm → .mp3 → .wav → .m4a → .jpg → .jpeg → .png → .webp
═══════════════════════════════════════════════════════════════════ */
(function(){
  var VIDEO_EXTS = ['.mp4','.mov','.webm'];
  var AUDIO_EXTS = ['.mp3','.wav','.m4a','.ogg'];
  // Order matters — GIF and video tried before jpg
  var TRY_ORDER  = ['.gif','.mp4','.mov','.webm','.mp3','.wav','.m4a','.jpg','.jpeg','.png','.webp'];

  function getBase(src){
    var clean = src.split('?')[0];
    var dot   = clean.lastIndexOf('.');
    return dot === -1 ? clean : clean.slice(0, dot);
  }
  function getExt(src){
    var clean = src.split('?')[0];
    var dot   = clean.lastIndexOf('.');
    return dot === -1 ? '' : clean.slice(dot).toLowerCase();
  }

  function makeVideo(src, img){
    var vid = document.createElement('video');
    // Copy visual properties from the img
    vid.style.cssText  = img.style.cssText || '';
    vid.className      = img.className     || '';
    vid.setAttribute('width',  img.getAttribute('width')  || '');
    vid.setAttribute('height', img.getAttribute('height') || '');
    vid.style.display  = 'block';
    vid.style.width    = img.style.width  || img.getAttribute('width')  || '100%';
    vid.style.height   = img.style.height || img.getAttribute('height') || 'auto';
    vid.style.objectFit= 'cover';
    vid.src        = src;
    vid.muted      = true;
    vid.loop       = true;
    vid.playsInline= true;
    vid.controls   = true;
    vid.preload    = 'metadata';
    if(img.parentNode) img.parentNode.replaceChild(vid, img);
  }

  function makeAudio(src, img){
    var wrap  = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:12px;min-height:80px;';
    wrap.style.width   = img.style.width  || img.getAttribute('width')  || '100%';
    var icon = document.createElement('div');
    icon.textContent   = '🎵';
    icon.style.fontSize= '28px';
    var aud  = document.createElement('audio');
    aud.src      = src;
    aud.controls = true;
    aud.preload  = 'none';
    aud.style.cssText = 'width:90%;max-width:280px;';
    wrap.appendChild(icon);
    wrap.appendChild(aud);
    if(img.parentNode) img.parentNode.replaceChild(wrap, img);
  }

  // The core trick: try each extension by chaining onerror on a hidden test img
  function findAndUpgrade(img){
    if(img._smartDone) return;
    img._smartDone = true;

    var origSrc = img.getAttribute('src') || '';
    // Only process local images/ folder
    if(!origSrc || origSrc.indexOf('images/') === -1) return;

    var base    = getBase(origSrc);
    var origExt = getExt(origSrc);

    // Build list: alternatives first, original last
    var toTry = TRY_ORDER.filter(function(e){ return e !== origExt; });
    // Don't try the same extension that's already loaded
    var i = 0;

    function tryNext(){
      if(i >= toTry.length) return; // nothing better found, keep original
      var ext = toTry[i++];
      var url = base + ext;

      if(VIDEO_EXTS.indexOf(ext) !== -1){
        // new Image() cannot load video files — use a hidden <video> element to probe
        var vtester = document.createElement('video');
        vtester.preload = 'metadata';
        vtester.muted = true;
        vtester.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none;';
        document.body.appendChild(vtester);
        var vDone = false;
        vtester.onloadedmetadata = function(){
          if(vDone) return; vDone = true;
          vtester.remove();
          makeVideo(url, img);
        };
        vtester.onerror = function(){
          if(vDone) return; vDone = true;
          vtester.remove();
          tryNext();
        };
        vtester.src = url;
      } else {
        // GIF, JPG, PNG, MP3, WAV etc — new Image() works fine for these
        var tester = new Image();
        tester.onload = function(){
          if(AUDIO_EXTS.indexOf(ext) !== -1){
            makeAudio(url, img);
          } else {
            img.src = url; // GIF or other image format — just swap src
          }
        };
        tester.onerror = function(){
          tryNext();
        };
        tester.src = url;
      }
    }

    tryNext();
  }

  function scanPage(){
    var imgs = document.querySelectorAll('img');
    for(var i = 0; i < imgs.length; i++){
      var src = imgs[i].getAttribute('src') || '';
      if(src.indexOf('images/') !== -1) findAndUpgrade(imgs[i]);
    }
  }

  // Watch for dynamically added images (modals, sample cards, etc.)
  function watchDOM(){
    if(!window.MutationObserver) return;
    var obs = new MutationObserver(function(muts){
      muts.forEach(function(m){
        m.addedNodes.forEach(function(node){
          if(!node || node.nodeType !== 1) return;
          if(node.tagName === 'IMG'){
            var s = node.getAttribute('src') || '';
            if(s.indexOf('images/') !== -1) findAndUpgrade(node);
          }
          if(node.querySelectorAll){
            var nested = node.querySelectorAll('img');
            for(var j = 0; j < nested.length; j++){
              var ns = nested[j].getAttribute('src') || '';
              if(ns.indexOf('images/') !== -1) findAndUpgrade(nested[j]);
            }
          }
        });
      });
    });
    obs.observe(document.body, { childList:true, subtree:true });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ scanPage(); watchDOM(); });
  } else {
    scanPage();
    watchDOM();
  }

  window.smartMediaScan = scanPage; // call manually anytime if needed
})();
