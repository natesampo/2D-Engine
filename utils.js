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