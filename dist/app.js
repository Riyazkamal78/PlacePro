'use strict';

const paths = {
  cap: '<path d="m2 10 10-5 10 5-10 5-10-5Zm4 2v5c3 3 9 3 12 0v-5m4-2v6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2m2-15a3 3 0 0 1 0 6m4 9v-2a4 4 0 0 0-3-4"/>',
  briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18m-11 0v2h4v-2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18m-13 5h2m4 0h2"/>',
  award: '<circle cx="12" cy="8" r="5"/><path d="m8 12-2 9 6-3 6 3-2-9"/>',
  chart: '<path d="M4 3v17h17M8 15l4-4 3 2 5-7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  right: '<path d="m9 6 6 6-6 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',
};

const icon = name => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + '</svg>';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const departments = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'];
const seed = {
  students: [
    {id:'s1',name:'Ananya Rao',reg:'PP26001',dept:'CSE',cgpa:9.2,status:'Placed'},
    {id:'s2',name:'Arjun Menon',reg:'PP26002',dept:'IT',cgpa:8.6,status:'Interview'},
    {id:'s3',name:'Diya Nair',reg:'PP26003',dept:'ECE',cgpa:8.1,status:'Shortlisted'},
    {id:'s4',name:'Kavin Prakash',reg:'PP26004',dept:'CSE',cgpa:7.8,status:'Registered'},
    {id:'s5',name:'Meera Shah',reg:'PP26005',dept:'IT',cgpa:9.0,status:'Placed'},
    {id:'s6',name:'Rahul Verma',reg:'PP26006',dept:'Mechanical',cgpa:7.2,status:'Registered'},
  ],
  drives: [
    {id:'d1',company:'Tata Consultancy Services',role:'Graduate Engineer Trainee',date:'2026-11-24',dept:'All departments',cgpa:7,status:'Open',badge:'TCS'},
    {id:'d2',company:'Infosys',role:'Systems Engineer',date:'2026-11-28',dept:'CSE',cgpa:7.5,status:'Open',badge:'IN'},
    {id:'d3',company:'Cognizant',role:'GenC Developer',date:'2026-12-03',dept:'IT',cgpa:7,status:'Scheduled',badge:'CO'},
    {id:'d4',company:'Accenture',role:'Associate Software Engineer',date:'2026-12-08',dept:'All departments',cgpa:7.5,status:'Scheduled',badge:'AC'},
  ],
  interviews: [
    {id:'i1',student:'s2',drive:'d1',date:'2026-11-25',time:'10:00',round:'Technical round',status:'Scheduled'},
    {id:'i2',student:'s3',drive:'d1',date:'2026-11-25',time:'11:30',round:'HR round',status:'Scheduled'},
  ],
  offers: [
    {id:'o1',student:'s1',drive:'d1',package:7.5,status:'Accepted'},
    {id:'o2',student:'s5',drive:'d3',package:6.4,status:'Accepted'},
  ],
};

const pages = {
  overview: {title:'Overview'},
  students: {title:'Students', singular:'student', description:'Manage student profiles, eligibility, and placement status.', columns:[['name','Student'],['reg','Register number'],['dept','Department'],['cgpa','CGPA'],['status','Status']]},
  drives: {title:'Recruitment drives', singular:'drive', description:'Manage campus drives and see which students meet each drive’s criteria.', columns:[['company','Company'],['role','Role'],['date','Drive date'],['cgpa','Min. CGPA'],['status','Status']]},
  interviews: {title:'Interviews', singular:'interview', description:'Schedule interviews and track recruitment rounds.', columns:[['student','Student'],['drive','Company'],['date','Date'],['time','Time'],['round','Round'],['status','Status']]},
  offers: {title:'Offers', singular:'offer', description:'Record offer packages and track student decisions.', columns:[['student','Student'],['drive','Company'],['package','Annual CTC'],['status','Status']]},
  reports: {title:'Reports', description:'Review placement outcomes by department and export your records.'},
};
const statuses = {
  students:['Registered','Shortlisted','Interview','Placed'],
  drives:['Open','Scheduled','Closed'],
  interviews:['Scheduled','Closed'],
  offers:['Issued','Accepted','Declined'],
};
const key = 'placepro.v1';
let records;
try { records = JSON.parse(localStorage.getItem(key)) ?? structuredClone(seed); }
catch { records = structuredClone(seed); }

const main = document.querySelector('#main');
const dialog = document.querySelector('#dialog');
const dialogBody = document.querySelector('#dialog-body');
const menu = document.querySelector('#menu');
const toast = document.querySelector('#toast');
let page = 'overview';
let term = '';
let filter = '';
let period = '6';
let toastTimer;
const number = value => Number(value).toLocaleString('en-IN');
const formatDate = value => new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric'}).format(new Date(value+'T00:00:00'));
const lookup = (section,id) => records[section].find(row => row.id === id);
const accepted = () => new Set(records.offers.filter(row => row.status === 'Accepted').map(row => row.student));
const placed = student => student.status === 'Placed' || accepted().has(student.id);
const studentStatus = student => placed(student) ? 'Placed' : student.status;
const eligible = (student,drive) => student.cgpa >= drive.cgpa && (drive.dept === 'All departments' || student.dept === drive.dept);
const textValue = (row,field) => {
  if (field === 'student') return lookup('students',row.student)?.name ?? 'Unknown student';
  if (field === 'drive') return lookup('drives',row.drive)?.company ?? 'Unknown company';
  if (field === 'date') return formatDate(row.date);
  if (field === 'package') return '₹' + Number(row.package).toFixed(2) + ' LPA';
  if (field === 'status' && 'reg' in row) return studentStatus(row);
  return row[field];
};
const button = (label,attrs,style='',glyph='') => '<button class="btn '+style+'" '+attrs+'>'+ (glyph ? icon(glyph) : '')+label+'</button>';
const optionList = (options,value) => options.map(item => {
  const [id,label] = Array.isArray(item) ? item : [item,item];
  return '<option value="'+escape(id)+'"'+(id===value?' selected':'')+'>'+escape(label)+'</option>';
}).join('');
const tones = ['blue','violet','green','gold'];
const company = (row,index) => '<span class="company-cell"><span class="company-badge '+tones[index%4]+'">'+escape(row.badge)+'</span>'+escape(row.company)+'</span>';
const pill = value => '<span class="pill '+escape(value.toLowerCase())+'">'+escape(value)+'</span>';
const stat = (label,value,detail,glyph,tone) => '<article class="card stat"><div class="stat-top">'+label+'<span class="metric-icon '+tone+'">'+icon(glyph)+'</span></div><div class="stat-number">'+value+'</div><small>'+detail+'</small></article>';

function trend() {
  const all = [['Jul',8,22],['Aug',16,31],['Sep',24,43],['Oct',35,55],['Nov',43,66],['Dec',54,79]];
  const data = all.slice(-Number(period));
  return '<section class="card panel"><div class="panel-head"><div><h2>Placement trend</h2><p class="sub">Sample monthly offers and interviews</p></div><select id="period" class="select" aria-label="Placement trend period">'+optionList([['6','Last 6 months'],['3','Last 3 months']],period)+'</select></div>'+
    '<div class="chart" role="img" aria-label="'+data.map(([month,offers,interviews])=>month+' '+offers+' offers and '+interviews+' interviews').join(', ')+'"><div class="axis-y" aria-hidden="true"><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div><div class="plot" aria-hidden="true">'+data.map(([month,offers,interviews])=>'<div class="plot-group" title="'+month+' · '+offers+' offers · '+interviews+' interviews"><span class="bar" style="height:'+offers/80*100+'%"></span><span class="bar secondary" style="height:'+interviews/80*100+'%"></span></div>').join('')+'</div><div class="axis-x" aria-hidden="true">'+data.map(row=>'<span>'+row[0]+'</span>').join('')+'</div></div><div class="legend"><span><b></b>Offers</span><span><b></b>Interviews</span></div></section>';
}
function pipeline() {
  const labels = [['Registered students',records.students.length,'#2d65e5'],['Shortlisted students',records.students.filter(row=>['Shortlisted','Interview'].includes(studentStatus(row)) || placed(row)).length,'#6689ec'],['Interview candidates',new Set(records.interviews.map(row=>row.student)).size,'#8c75e6'],['Placed students',records.students.filter(placed).length,'#279879']];
  return '<section class="card panel"><div class="panel-head"><div><h2>Recruitment pipeline</h2><p class="sub">Student progress across key stages</p></div><span class="metric-icon blue">'+icon('chart')+'</span></div><div class="pipeline">'+labels.map(([label,count,color])=>'<div><div class="pipe-title"><span>'+label+'</span><strong>'+number(count)+'</strong></div><div class="track"><span class="fill" style="--fill:'+color+';width:'+count/Math.max(1,records.students.length)*100+'%"></span></div></div>').join('')+'</div></section>';
}

function table(section,rows) {
  const cols=pages[section].columns;
  if (!rows.length) return '<div class="empty">No matching records found.</div>';
  return '<div class="table-scroll" tabindex="0" role="region" aria-label="'+pages[section].title+' table"><table><thead><tr>'+cols.map(([,label])=>'<th scope="col">'+label+'</th>').join('')+'<th scope="col">Actions</th></tr></thead><tbody>'+rows.map((row,index)=>'<tr>'+cols.map(([field])=>{
    const value = textValue(row,field);
    return '<td>'+(field==='company' ? company(row,index) : field==='status' ? pill(value) : escape(value))+'</td>';
  }).join('')+'<td><button class="link-button" data-detail="'+escape(row.id)+'" data-section="'+section+'">View<span class="visually-hidden"> '+escape(textValue(row,cols[0][0]))+'</span></button></td></tr>').join('')+'</tbody></table></div>';
}

function overview() {
  const total=records.students.length, count=records.students.filter(placed).length;
  const upcoming=[...records.drives].filter(row=>row.status!=='Closed').sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
  return '<section class="hero"><div><span class="eyebrow">'+icon('calendar')+'2026–27 placement season</span><h1>Placement overview</h1><p>Intelligent Campus Recruitment Management System</p></div>'+button('New drive','data-add="drives"','light','plus')+'</section>'+
    '<section class="stats" aria-label="Placement metrics">'+
    stat('Registered students',number(total),'Across '+new Set(records.students.map(row=>row.dept)).size+' departments','users','blue')+
    stat('Active drives',number(records.drives.filter(row=>row.status!=='Closed').length),'Open or scheduled','briefcase','violet')+
    stat('Offers recorded',number(records.offers.length),number(records.offers.filter(row=>row.status==='Accepted').length)+' accepted','award','green')+
    stat('Placement rate',total ? Math.round(count/total*100)+'%' : '0%',count+' of '+total+' students placed','chart','gold')+'</section>'+
    '<div class="panels">'+trend()+pipeline()+'</div>'+
    '<section class="card list-card"><div class="section-head"><div><h2>Upcoming drives</h2><p class="sub">Open and scheduled company drives</p></div><a class="btn outline" href="#drives">View all drives</a></div>'+table('drives',upcoming)+'</section>';
}

function list(section) {
  const info = pages[section];
  return '<section class="page-head"><div><h1>'+info.title+'</h1><p>'+info.description+'</p></div>'+button('New '+info.singular,'data-add="'+section+'"','','plus')+'</section>'+
    '<section class="card list-card"><div class="section-head"><h2>'+info.title+' directory</h2></div><div class="toolbar"><input id="search" class="input" type="search" aria-label="Search '+info.title.toLowerCase()+'" placeholder="Search records" value="'+escape(term)+'"><select id="filter" class="select" aria-label="Filter by status">'+optionList([['','All statuses'],...statuses[section]],filter)+'</select></div><div id="results"></div></section>';
}
function results() {
  const rows=records[page].filter(row=>(!filter || textValue(row,'status')===filter) && pages[page].columns.some(([field])=>String(textValue(row,field)).toLowerCase().includes(term.trim().toLowerCase())));
  document.querySelector('#results').innerHTML=table(page,rows);
}

function reports() {
  return '<section class="page-head"><div><h1>Reports</h1><p>'+pages.reports.description+'</p></div>'+button('Export CSV','id="export"','','download')+'</section><div class="panels">'+trend()+pipeline()+'</div><section class="card list-card"><div class="section-head"><h2>Department breakdown</h2></div><div class="table-scroll"><table><thead><tr><th>Department</th><th>Registered</th><th>Placed</th><th>Placement rate</th></tr></thead><tbody>'+departments.map(dept=>{
    const students=records.students.filter(row=>row.dept===dept);
    const count=students.filter(placed).length;
    return '<tr><td>'+dept+'</td><td>'+students.length+'</td><td>'+count+'</td><td>'+(students.length ? Math.round(count/students.length*100)+'%' : '—')+'</td></tr>';
  }).join('')+'</tbody></table></div></section>';
}

function render() {
  document.querySelector('#crumb').textContent = pages[page].title;
  document.querySelectorAll('[data-page]').forEach(link=>{
    if (link.dataset.page===page) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  main.innerHTML=page==='overview'?overview():page==='reports'?reports():list(page);
  if (pages[page].columns) results();
}

const fields = {
  students:[['name','Full name'],['reg','Register number'],['dept','Department','select',departments],['cgpa','CGPA','number',0,10,.01]],
  drives:[['company','Company'],['role','Hiring role'],['date','Drive date','date'],['dept','Eligible department','select',['All departments',...departments]],['cgpa','Minimum CGPA','number',0,10,.01]],
  interviews:[['student','Student','select'],['drive','Recruitment drive','select'],['date','Interview date','date'],['time','Interview time','time'],['round','Interview round']],
  offers:[['student','Student','select'],['drive','Recruitment drive','select'],['package','Annual CTC (₹ lakh)','number',.01,10000,.01]],
};

function edit(section,id) {
  const row=id?lookup(section,id):{};
  if ((section==='interviews' || section==='offers') && (!records.students.length || !records.drives.length)) {
    notify('Add a student and drive first.');
    return;
  }
  const formFields=[...fields[section],['status','Status','select',statuses[section]]];
  const html=formFields.map(([name,label,type='text',options,max,step])=>{
    const choices=options ?? (name==='student' ? records.students.map(item=>[item.id,item.name+' · '+item.reg]) : records.drives.map(item=>[item.id,item.company+' · '+item.role]));
    const control=type==='select'
      ? '<select class="select" name="'+name+'" required>'+optionList(choices,row[name])+'</select>'
      : '<input class="input" type="'+type+'" name="'+name+'" value="'+escape(row[name])+'" required '+(type==='number'?'min="'+options+'" max="'+max+'" step="'+step+'"':'maxlength="100"')+'>';
    return '<label>'+label+control+'</label>';
  }).join('');
  dialogBody.innerHTML='<h2 id="dialog-title">'+(id?'Edit ':'New ')+pages[section].singular+'</h2><form id="record-form"><div class="fields">'+html+'</div><div class="dialog-actions">'+button('Cancel','type="button" data-close','outline')+button(id?'Save changes':'Save '+pages[section].singular,'type="submit"')+'</div></form>';
  if (!dialog.open) dialog.showModal();
  dialogBody.querySelector('form').addEventListener('submit',event=>{
    event.preventDefault();
    const form=event.currentTarget;
    const values=Object.fromEntries(new FormData(form));
    for (const [name,label,type] of formFields) {
      values[name]=type==='number' ? Number(values[name]) : values[name].trim();
      if (values[name]==='') {
        notify('Enter '+label.toLowerCase()+'.');
        form.elements.namedItem(name).focus();
        return;
      }
    }
    if(section==='students' && records.students.some(item=>item.id!==id && item.reg.toLowerCase()===values.reg.toLowerCase())){
      notify('That register number is already in use.');
      form.elements.namedItem('reg').focus();
      return;
    }
    const entry={...values,id:id??crypto.randomUUID()};
    if(section==='drives') entry.badge=values.company.split(/\s+/).slice(0,3).map(word=>word[0].toUpperCase()).join('').padEnd(2,values.company[1]?.toUpperCase()??'');
    const updated=id ? records[section].map(item=>item.id===id?entry:item) : [...records[section],entry];
    const next={...records,[section]:updated};
    try { localStorage.setItem(key,JSON.stringify(next)); }
    catch { notify('Changes could not be saved in this browser.'); return; }
    records=next;
    dialog.close();
    render();
    notify(id?'Changes saved.':pages[section].singular[0].toUpperCase()+pages[section].singular.slice(1)+' added.');
  });
}

function detail(section,id) {
  const row=lookup(section,id);
  if (!row) return;
  let extra='';
  if (section==='drives') {
    const matches=records.students.filter(student=>eligible(student,row));
    extra='<div class="eligibility"><strong>'+matches.length+' eligible '+(matches.length===1?'student':'students')+'</strong><p>'+escape(row.dept)+' · minimum CGPA '+row.cgpa+'</p>'+
      (matches.length?'<ul>'+matches.map(item=>'<li>'+escape(item.name)+' · '+escape(item.dept)+' · '+item.cgpa+'</li>').join('')+'</ul>':'')+'</div>';
  }
  dialogBody.innerHTML='<h2 id="dialog-title">'+escape(textValue(row,pages[section].columns[0][0]))+'</h2><dl class="details">'+pages[section].columns.slice(1).map(([field,label])=>'<dt>'+label+'</dt><dd>'+escape(textValue(row,field))+'</dd>').join('')+'</dl>'+extra+'<div class="dialog-actions">'+button('Close','data-close','outline')+button('Edit '+pages[section].singular,'data-edit="'+escape(id)+'" data-section="'+section+'"')+'</div>';
  dialog.showModal();
}

function csv() {
  const cell=value=>{
    const string=String(value);
    const safe=/^[\s]*[=+\-@]|^[\t\r\n]/.test(string)?"'"+string:string;
    return '"'+safe.replaceAll('"','""')+'"';
  };
  const rows=[['Student','Register number','Department','CGPA','Placement status'],...records.students.map(row=>[row.name,row.reg,row.dept,row.cgpa,studentStatus(row)])];
  const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');
  link.href=url;
  link.download='PlacePro-placement-report.csv';
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  notify('Placement report exported.');
}

function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent=message;
  toastTimer=setTimeout(()=>{toast.textContent='';},3200);
}
function toggleMenu(open) {
  document.querySelector('#sidebar').classList.toggle('open',open);
  menu.setAttribute('aria-expanded',String(open));
}
function route() {
  const candidate=location.hash.slice(1);
  page=Object.hasOwn(pages,candidate)?candidate:'overview';
  term='';
  filter='';
  toggleMenu(false);
  render();
  window.scrollTo(0,0);
}

document.querySelectorAll('[data-icon]').forEach(element=>{element.innerHTML=icon(element.dataset.icon);});
dialog.setAttribute('aria-labelledby','dialog-title');
document.addEventListener('click',event=>{
  const control=event.target.closest('button');
  if (control?.dataset.add) edit(control.dataset.add);
  if (control?.dataset.detail) detail(control.dataset.section,control.dataset.detail);
  if (control?.dataset.edit) edit(control.dataset.section,control.dataset.edit);
  if (control?.hasAttribute('data-close')) dialog.close();
  if (control?.id==='export') csv();
  if (control===menu) toggleMenu(menu.getAttribute('aria-expanded')!=='true');
  else if (!event.target.closest('#sidebar') || event.target.closest('[data-page],.brand')) toggleMenu(false);
});
document.addEventListener('keydown',event=>{
  if (event.key==='Escape' && menu.getAttribute('aria-expanded')==='true') {
    toggleMenu(false);
    menu.focus();
  }
});
main.addEventListener('input',event=>{
  if(event.target.id==='search'){term=event.target.value;results();}
});
main.addEventListener('change',event=>{
  if(event.target.id==='filter'){filter=event.target.value;results();}
  if(event.target.id==='period'){period=event.target.value;render();document.querySelector('#period').focus();}
});
window.addEventListener('hashchange',route);
route();
