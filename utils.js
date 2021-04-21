function contains(list, item) {
	for (var i=0; i<list.length; i++) {
		if (list[i] == item) {
			return true;
		}
	}

	return false;
}

function remove(list, item) {
	for (var i=0; i<list.length; i++) {
		if (list[i] == item) {
			list.splice(i, 1);
			break;
		}
	}
}

function getIndex(list, item) {
	for (var i=0; i<list.length; i++) {
		if (list[i] == item) {
			return i;
		}
	}

	return -1;
}

function copyArray(list) {
	let copy = [];
	for (var i=0; i<list.length; i++) {
		copy.push(list[i]);
	}

	return copy;
}