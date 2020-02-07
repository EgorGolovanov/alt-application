//основные константы для ипользования
const dbutton = "<button class=\"delete\" id=\"dbutton\">X</button>";
const editbutton = "<button class=\"edit\" id=\"editbutton\">Edit</button>";
const okbutton = "<button class=\"ok\" id=\"okbutton\">Ok</button>";
const canselbutton = "<button class=\"cansel\" id=\"canselbutton\">Cansel</button>";
const blockOfButtons = dbutton + editbutton + okbutton + canselbutton;

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

//слушатель для обработки событий при нажатии на кнопку "cansel" или "ok"
document.querySelector('ul').addEventListener("click", function(e) {
	const canselbutton = e.target.closest('.cansel');
	const okbutton = e.target.closest('.ok');
	
	if (!okbutton && !canselbutton) {
		return;
	}
	
	let li = okbutton ? okbutton.parentElement : canselbutton.parentElement;
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
		listSort(e.target.value);
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
			let number = "<a>" + res.ID + "</a>"
			let value = "<a>" + res.Value + "</a>";
			
			li.innerHTML = number + value + blockOfButtons;
			ul.append(li);
			text.value = "";
			
		} else if (req.readyState == XMLHttpRequest.DONE) {
			window.alert('Add error!');
		}
	});
	
	req.send("value=" + text.value);
}


//функция для сортировки списка
function listSort(fields) {
	let textList = [], numberList = [], index;
	let list = li = document.getElementsByTagName("li");
	
	//создание временных массивов для сортировки 
	for (let i = 0; i < list.length; i++) {
		textList.push(list[i].children[1].text.toLowerCase());
		numberList.push(list[i].children[0].text);
	}
	
	let newTextList = textList.slice();
	let newNumberList = numberList.slice();
	
	//сортировка в зависимости от входных параметров
	if (fields.indexOf('number') == -1) {
		textList.sort();
		
		if (fields.indexOf('asc') == -1) textList.reverse();
		
		//относительно сортировки по алфавиту меняем числовой массив
		for (let i = 0; i < newTextList.length; i++) {
			index = newTextList.indexOf(textList[i]);
			newNumberList[i] = numberList[index];
		}
		
		newTextList = textList;
	} else {
		numberList.sort();
		
		if (fields.indexOf('asc') == -1) numberList.reverse();
		
		//относительно сортировки по числам меняем текстовый массив
		for (let i = 0; i < newNumberList.length; i++) {
			index = newNumberList.indexOf(numberList[i]);
			newTextList[i] = textList[index];
		}
		
		newNumberList = numberList;
	}
	
	//перезапись отсортированных массивов в исходный список
	for (let i = 0; i < list.length; i++) {
		list[i].children[0].text = newNumberList[i];
		list[i].children[1].text = newTextList[i];
	}
}

