const categoryMap={1:'GK',2:'Geography',3:'History',4:'Economics',5:'Science',6:'Technology',7:'Guess-Movie',8:'Guess-Brand'};
const difficultyMap={1:'Easy',2:'Medium',3:'Hard'};

let questions=[],playList=[],currentIndex=0,selectedOption=null;

window.onload=()=>{
  const saved=localStorage.getItem('quizData');
  if(saved){
    questions=JSON.parse(saved);
    updateAskedArea();
  }
};

function saveData(){
  localStorage.setItem('quizData',JSON.stringify(questions));
}

function showNotify(msg){
  const n=document.getElementById('notify');
  n.innerText=msg;
  n.style.display='block';
  setTimeout(()=>n.style.display='none',2000);
}

function generateQNo(cat,diff){
  const count=questions.filter(q=>q.cat==cat && q.diff==diff).length+1;
  return `${cat}${diff}${count}`;
}

function importMCQFile(){
  const raw=document.getElementById('bulkInput').value.trim();
  const file=document.getElementById('fileInput');

  if(file.files.length){
    const reader=new FileReader();
    reader.onload=e=>parseMCQ(e.target.result);
    reader.readAsText(file.files[0]);
  }else if(raw){
    parseMCQ(raw);
  }else{
    showNotify('Paste text or choose file');
  }
}

function parseMCQ(raw){
  const blocks=raw.split(/\n\s*\n/);
  let added=0;

  blocks.forEach(b=>{
    let cat,diff,ques,A,B,C,D,ans;
    b.split('\n').forEach(l=>{
      if(l.startsWith('CATEGORY:')) cat=l.split(':')[1].trim();
      if(l.startsWith('DIFFICULTY:')) diff=l.split(':')[1].trim();
      if(l.startsWith('QUESTION:')) ques=l.replace('QUESTION:','').trim();
      if(l.startsWith('A)')) A=l.trim();
      if(l.startsWith('B)')) B=l.trim();
      if(l.startsWith('C)')) C=l.trim();
      if(l.startsWith('D)')) D=l.trim();
      if(l.startsWith('ANSWER:')) ans=l.split(':')[1].trim();
    });

    if(cat && diff && ques && A && B && C && D && ans){
      questions.push({
        qno:generateQNo(cat,diff),
        cat,diff,ques,A,B,C,D,ans,asked:false
      });
      added++;
    }
  });

  saveData();
  updateAskedArea();
  showNotify(`Questions imported: ${added}`);
}

function categoryChanged(){
  document.getElementById('quizArea').style.display='none';
}

function startQuiz(){
  const c=playCategory.value;
  const d=playDiff.value;

  if(!c || !d){
    showNotify('Select category & difficulty');
    return;
  }

  playList=questions.filter(q=>q.cat==c && q.diff==d);
  if(!playList.length){
    showNotify('No questions found');
    return;
  }

  currentIndex=0;
  quizArea.style.display='block';
  showQ();
}

function searchQuestion(){
  const qno=searchQno.value.trim();
  const q=questions.find(q=>q.qno===qno);
  if(!q){ showNotify('Not found'); return; }
  playList=[q];
  currentIndex=0;
  quizArea.style.display='block';
  showQ();
}

function showQ(){
  selectedOption=null;
  const q=playList[currentIndex];

  qno.innerText=`Q No: ${q.qno}`;
  qtext.innerText=q.ques;
  opts.innerHTML='';

  ['A','B','C','D'].forEach(o=>{
    const b=document.createElement('button');
    b.innerText=q[o];

    if(q.asked){
      b.className=o===q.ans?'correct':'asked';
      b.disabled=true;
    }else{
      b.onclick=()=>{
        selectedOption=o;
        [...opts.children].forEach(x=>x.style.border='1px solid #ccc');
        b.style.border='2px solid #007bff';
      };
    }
    opts.appendChild(b);
  });

  submitBtn.style.display=q.asked?'none':'block';
  prevBtn.style.display=currentIndex>0?'block':'none';
}

function submitAnswer(){
  if(!selectedOption){ showNotify('Select option'); return; }
  const q=playList[currentIndex];

  [...opts.children].forEach(b=>{
    if(b.innerText===q[q.ans]) b.classList.add('correct');
    else if(b.style.border.includes('2px')) b.classList.add('wrong');
    b.disabled=true;
  });
}

function nextQ(){
  if(currentIndex<playList.length-1){
    currentIndex++; showQ();
  }
}

function prevQ(){
  if(currentIndex>0){
    currentIndex--; showQ();
  }
}

function markAsked(){
  playList[currentIndex].asked=true;
  saveData();
  updateAskedArea();
  showQ();
}

function resetData(){
  if(confirm('Delete all data?')){
    questions=[];
    saveData();
    updateAskedArea();
    quizArea.style.display='none';
  }
}

function updateAskedArea(){
  askedArea.innerHTML='';
  const asked=questions.filter(q=>q.asked);
  if(!asked.length){
    askedArea.innerText='No asked questions yet';
    return;
  }

  asked.forEach(q=>{
    askedArea.innerHTML+=`
    <div class="box">
      <b>${q.qno}</b><br>
      ${q.ques}<br>
      Answer: ${q.ans}
    </div>`;
  });
}
