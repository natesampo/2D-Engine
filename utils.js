function contains(list, item) {
	for (var i=0; i<list.length; i++) {
		if (list[i] == item) {
			return true;
		}
	}

	return false;
}