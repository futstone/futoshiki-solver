var allSlots = [];
var allArrowA = [];
var allArrowB = [];

function run(index) {
	while (true) {
		if (index > 24) {
			return 1;
		}
		if (allSlots[index].isMutable === true) {
			break;
		} else {
			index++;
		}
	}
	var possibleValues = getPossibleValues(index);
	if (possibleValues.length === 0) {
		return 0;
	}
	outer:
		while (possibleValues.length > 0) {
			setToZero(index);
			var took = possibleValues.shift();
			allSlots[index].currentValue = took;
			if (allSlots[index].greaterThan.length > 0) {
				for (var i = 0; i < allSlots[index].greaterThan.length; i++) {
					var idOfGreaterThan = allSlots[index].greaterThan[i];
					let currentVal = allSlots[idOfGreaterThan].currentValue;
					if (currentVal !== 0 && currentVal > allSlots[index].currentValue) {
						continue outer;
					}
				}
			}
			if (allSlots[index].smallerThan.length > 0) {
				for (let i = 0; i < allSlots[index].smallerThan.length; i++) {
					var idOfSmallerThan = allSlots[index].smallerThan[i];
					let currentVal = allSlots[idOfSmallerThan].currentValue;
					if (currentVal !== 0 && currentVal < allSlots[index].currentValue) {
						continue outer;
					}
				}
			}
			if (run(index + 1) == 1) {
				return 1;
			}
		}
	return 0;
}

function getPossibleValues(id) {
	var possibleValues = [];
	var valuesReserved = [];
	setToZero(id);

	for (var i = 0; i < 25; i++) {
		if (allSlots[i].row == allSlots[id].row || allSlots[i].col == allSlots[id].col) {
			if (allSlots[i].currentValue !== 0) {
				valuesReserved.push(allSlots[i].currentValue);
			}
		}
	}

	for (var j = 1; j < 6; j++) {
		if (valuesReserved.indexOf(j) > -1) {
			continue;
		} else {
			possibleValues.push(j);
		}
	}
	//remove 100% impossible values 5 and 1 if rules set:
	if (allSlots[id].smallerThan.length > 0) {
		if (possibleValues.indexOf(5) > -1) {
			possibleValues.splice(possibleValues.indexOf(5), 1);
		}
	}
	if (allSlots[id].greaterThan.length > 0) {
		if (possibleValues.indexOf(1) > -1) {
			possibleValues.splice(possibleValues.indexOf(1), 1);
		}
	}
	return possibleValues;
}

function setToZero(index) {
	for (var i = index; i < allSlots.length; i++) {
		if (allSlots[i].isMutable === true) {
			allSlots[i].currentValue = 0;
		}
	}
}

function Slot() {
	this.possibleValues;
	this.currentValue;
	this.greaterThan = [];
	this.smallerThan = [];
	this.row;
	this.col;
	this.isMutable;
}

function Arrow(id) {
	this.id = id;
	this.slot1_ID;
	this.slot2_ID;
	this.state = 0;
}

function createAllSlots() {
	var row = 1;
	var col = 1;
	for (var i = 0; i < 25; i++) {
		var newSlot = new Slot();
		newSlot.row = row;
		newSlot.col = col;
		newSlot.currentValue = 0;
		newSlot.isMutable = true;
		col++;
		if (col == 6) {
			row++;
			col = 1;
		}
		allSlots.push(newSlot);
	}
}

function initAllSlots() {
	var cells = document.getElementsByTagName('input');
	for (let i = 0; i < 25; i++) {
		if ($(cells[i]).val()) {
			allSlots[i].currentValue = parseInt($(cells[i]).val(), 10);
			allSlots[i].isMutable = false;
		} else {
			allSlots[i].isMutable = true;
		}
	}
}

function createAllArrows() {
	for (var i = 1; i < 21; i++) {
		allArrowA.push(new Arrow(i));
		allArrowB.push(new Arrow(i));
	}
}

function initAllArrows() {
	var counter = 0;
	var offset = 0;
	for (var i = 0; i < 20; i++) {
		allArrowA[i].slot1_ID = i + offset;
		allArrowA[i].slot2_ID = i + 1 + offset;
		counter++;
		if (counter == 4) {
			offset++;
			counter = 0;
		}
	}

	for (var j = 0; j < 20; j++) {
		allArrowB[j].slot1_ID = j;
		allArrowB[j].slot2_ID = j + 5;
	}
}

function init() {
	createAllSlots();
	createAllArrows();
	initAllArrows();
	var arrows = document.querySelectorAll(".arrowA, .arrowB");

	for (var i = 0; i < arrows.length; i++) {
		$(arrows[i]).fadeTo("slow", 0.05);
	}
}

$('.arrowA, .arrowB').on('click', function() {
	var id = $(this).attr('id') - 1;
	var classname = $(this).attr('class');
	var selectedArrows = [];

	if (classname.includes("arrowA")) {
		selectedArrows = allArrowA;
	} else {
		selectedArrows = allArrowB;
	}
	var id1 = selectedArrows[id].slot1_ID;
	var id2 = selectedArrows[id].slot2_ID;
	var slot1 = allSlots[id1];
	var slot2 = allSlots[id2];

	if (selectedArrows[id].state === 0) {
		$(this).fadeTo("fast", 1);
		selectedArrows[id].state = 1;
		slot1.greaterThan.push(id2);
		slot2.smallerThan.push(id1);
	} else if (selectedArrows[id].state == 1) {
		selectedArrows[id].state = 2;
		slot1.greaterThan.splice(slot1.greaterThan.indexOf(id2), 1);
		slot2.smallerThan.splice(slot2.smallerThan.indexOf(id1), 1);
		slot1.smallerThan.push(id2);
		slot2.greaterThan.push(id1);
		$(this).toggleClass('rotate');
	} else if (selectedArrows[id].state == 2) {
		selectedArrows[id].state = 0;
		slot1.smallerThan.splice(slot1.smallerThan.indexOf(id2), 1);
		slot2.greaterThan.splice(slot2.greaterThan.indexOf(id1), 1);
		$(this).fadeTo("fast", 0.05);
		$(this).toggleClass('rotate');
	}
});

$('#clear').on('click', function() {
	var arrows = document.querySelectorAll(".arrowA, .arrowB");
	var slots = document.querySelectorAll("input");

	for (var j = 0; j < arrows.length; j++) {
		$(arrows[j]).fadeTo("fast", 1);
	}
	for (var i = 0; i < arrows.length; i++) {
		if ($(arrows[i]).hasClass('rotate')) {
			$(arrows[i]).removeClass('rotate');
		}
		$(arrows[i]).fadeTo("fast", 0.05);
	}
	for (var n = 0; n < arrows.length / 2; n++) {
		allArrowA[n].state = 0;
		allArrowB[n].state = 0;
	}

	for (var m = 0; m < allSlots.length; m++) {
		allSlots[m].greaterThan = [];
		allSlots[m].smallerThan = [];
		allSlots[m].currentValue = 0;
	}

	for (var a = 0; a < slots.length; a++) {
		$(slots[a]).val('');
	}
});

$('#solve').on('click', function() {
	initAllSlots();
	var result = run(0);
	if (result == 1) {
		for (var i = 1; i < 26; i++) {
			var slot = $('input#' + i);
			slot.val(allSlots[i - 1].currentValue);
		}
	} else {
		modal = document.getElementById('modal-error');
		modal.style.display = "block";
	}
});

var modal = document.getElementById('modal-guide');

$('#btnGuide').on('click', function() {
	modal = document.getElementById('modal-guide');
	modal.style.display = "block";
});

$('.close').on('click', function() {
	modal.style.display = "none";
});

window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}