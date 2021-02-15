let rcontent = document.getElementById('rcontent');
let ucontent = document.getElementById('ucontent');
let CLIENT_ID = '8018d44172bdf64f4aba22b97788c89c';

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


function show(ele){
  ele.style.display = ''
}

function hide(ele){
  ele.style.display = 'none'
}

let register = document.getElementById('register');

mal_aut.init();
register.addEventListener('click', mal_aut.register);


mal_aut.isregistered().then(function(registered){
  if (registered){
    show(rcontent);
    hide(ucontent);
  }
  else {
    show(ucontent);
    hide(rcontent);
  }
});


function generateTableHead() {
  let table = document.getElementById('anime_table');
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of ["Title", "Progress", "Increment", "Decrement"]) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function generateTable(data) {
  let table = document.getElementById('anime_table');
  for (let element of data) {
    let row = table.insertRow();
    
    let namecell = row.insertCell();
    let nametext = document.createTextNode(element['title']);
    namecell.appendChild(nametext);

    let progresscell = row.insertCell();
    let progresstext = document.createTextNode(`${element['episodes']}/${element['tepisodes']}`);
    progresscell.appendChild(progresstext);

    let addcell = row.insertCell();
    addcell.appendChild(createIncButton(element, progresstext));

    let deccell = row.insertCell();
    deccell.appendChild(createDecButton(element, progresstext));
  }
}

function createDecButton(element, ptext){
  let button = document.createElement("button");
  let icon = document.createElement('i');
  icon.innerText = 'arrow_circle_down';
  icon.classList.add('material-icons');
  button.appendChild(icon);
  button.addEventListener('click', function(){
    if (element['episodes'] === 0) return;
    element['episodes']--;
    ptext.nodeValue = `${element['episodes']}/${element['tepisodes']}`;
    malr.updateAnime(element.id, null, element['episodes']);
  });
  return button;
}


function createIncButton(element, ptext){
  let button = document.createElement("button");
  let icon = document.createElement('i');
  icon.innerText = 'arrow_circle_up';
  icon.classList.add('material-icons');
  button.appendChild(icon);
  button.addEventListener('click', function(){
    if (element['episodes'] === element['tepisodes']) return;
    element['episodes']++;
    ptext.nodeValue = `${element['episodes']}/${element['tepisodes']}`;
    malr.updateAnime(element.id, null, element['episodes']);
  });
  return button;
}


let headp = new Promise(function (resolve, reject){
  generateTableHead();
  resolve();
});


Promise.all([malr.get_watching(), headp]).then(function([data, table]){
  generateTable(data);
});

