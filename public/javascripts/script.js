//основные константы для ипользования
const dbutton = "<button class=\"delete\" id=\"dbutton\">X</button>";
const editbutton = "<button class=\"edit\" id=\"editbutton\">Edit</button>";
const okbutton = "<button class=\"ok\" id=\"okbutton\">Ok</button>";
const cancelbutton = "<button class=\"cancel\" id=\"cancelbutton\">Cancel</button>";
const blockOfButtons = dbutton + editbutton + okbutton + cancelbutton;


//слушатель для обработки событий при нажатии на кнопку "add"
document.getElementById("add-button").addEventListener("click", addToUlAJAX);

//слушатель для обработки событий при нажатии на кнопку "X"
document.querySelector('ul').addEventListener("click", function(e) {
	const dbutton = e.target.closest('.delete');
	if (!dbutton) {
		return;
	}
	let req = new XMLHttpRequest();
	let id = dbutton.parentElement.children[0].text;
	
	req.responseType =	"json";
	req.open('DELETE', '/' + id, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");	
	
	req.addEventListener("readystatechange", () => {
		if (req.readyState == XMLHttpRequest.DONE && req.status == 204) {
			dbutton.parentElement.remove();
		}else if (req.readyState == XMLHttpRequest.DONE) {
			window.alert('Delete error!');
		}
	});
	
	req.send();
	
});

//слушатель для обработки событий при нажатии на кнопку "edit"
document.querySelector('ul').addEventListener("click", function(e) {
	const editbutton = e.target.closest('.edit');
	if (!editbutton) {
		return;
	}
	let newtext = document.getElementById("text-input");
	let li = editbutton.parentElement;
	
	li.children[1].style.display = "none";
	li.children[2].style.display = "none";
	li.children[3].style.display = "none";
	li.children[4].style.display = "inline";
	li.children[5].style.display = "inline";
	
	let input = document.createElement("input");
	
	input.id = "edit-input"
	input.type = "text";
	input.value = li.children[1].text;
	li.insertBefore(input, li.children[1]);
});

//слушатель для обработки событий при нажатии на кнопку "cancel" или "ok"
document.querySelector('ul').addEventListener("click", function(e) {
	const cancelbutton = e.target.closest('.cancel');
	const okbutton = e.target.closest('.ok');
	
	if (!okbutton && !cancelbutton) {
		return;
	}
	
	let li = okbutton ? okbutton.parentElement : cancelbutton.parentElement;
	let new_text = li.children[1].value;
	let id = li.children[0].text;
	
	li.removeChild(li.children[1]);
	li.children[2].style.display = "inline";
	li.children[3].style.display = "inline";
	li.children[4].style.display = "none";
	li.children[5].style.display = "none";
	
	if (okbutton && new_text != "") {
		let req = new XMLHttpRequest();
		
		req.responseType =	"json";
		req.open('POST', '/' + id, true);
		req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");	
		
		req.addEventListener("readystatechange", () => {
			if (req.readyState == XMLHttpRequest.DONE && req.status == 200) {
				li.children[1].text = new_text;	
			}else if (req.readyState == XMLHttpRequest.DONE) {
				window.alert('Edit error!');
			}
		});
		
		req.send("value=" + new_text);
	}
	
	li.children[1].style.display = "inline";
});

//слушатель для обработки событий при выборе сортировки списка
document.addEventListener("click", function(e) {
	if (e.target && (e.target.matches("input[name='sort-radiobutton']"))) {
		Sorting(e.target);
	}
});

//фукнция для ajax запроса по добавению элемента в бд
function addToUlAJAX() {
	let text = document.getElementById("text-input");
	
	if (text.value == "") return;
	let req = new XMLHttpRequest();
	req.responseType =	"json";
	req.open('POST', '/', true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	req.addEventListener("readystatechange", () => {
		if(req.readyState == XMLHttpRequest.DONE && req.status == 201) {
			
			let res = req.response;
			let ul = document.getElementById("list-item");
			let li = document.createElement("li");
			let number = "<a class= id>" + res.ID + "</a>"
			let value = "<a class= value>" + res.Value + "</a>";
			
			li.innerHTML = number + value + blockOfButtons;
			ul.append(li);
			text.value = "";
			
		} else if (req.readyState == XMLHttpRequest.DONE) {
			window.alert('Add error!');
		}
	});
	
	req.send("value=" + text.value);
}

//функция для сортировки ul списка, где fields - входное условие для выбора сортировки
function Sorting(fields) {
    let listUl = document.getElementById('list-item');
    let parent = listUl.parentNode;
	let newList = Sort(fields); 
	
    parent.insertBefore(newList, listUl);
    parent.removeChild(listUl);
    
    newList.id = 'list-item';
}

//функция создания ul по входному массиву
function makeUl(array) {
    let list = document.createElement('ul'); 

    for (let i = 0; i < array.length; i++) {
        list.appendChild(array[i]);
    }

    return list;
}

//функция сортировки массива по id или value
function Sort(fields) {
    var nodeList = document.querySelectorAll('li');
    var itemsArray = [];

    for (var i = 0; i < nodeList.length; i++) {    
        itemsArray.push(nodeList[i]);
    }

    itemsArray.sort(function(nodeA, nodeB) {
        //выбор нужнго поля для сортировки
        let textA = nodeA.querySelector('.' + fields.value).text;
        let textB = nodeB.querySelector('.' + fields.value).text;
        //проверка числовая или текстовая сортировка
        let A = parseInt(textA);
        let B = parseInt(textB);
        
        if (!A) A = textA;        
        if (!B) B = textB;
        
        if (A < B) return -1;
        if (A > B) return 1;

        return 0;
    });

    if (fields.className.indexOf('asc') == -1) itemsArray.reverse();
    
    return makeUl(itemsArray);
}
