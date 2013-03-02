JSON.stringify(Array.prototype.slice.call(document.querySelectorAll('#available_players tbody tr')).map(function(item) { 
	var cells = item.querySelectorAll('td');
	
	return {
		name: cells[1].innerText.replace(/[^\w ]*/gi, '')
		, rank: cells[2].innerHTML
		, position: cells[3].innerHTML
		, runs: cells[4].innerHTML
		, hrs: cells[5].innerHTML
		, rbi: cells[6].innerHTML
		, steals: cells[7].innerHTML
		, avg: cells[8].innerHTML
		, wins: cells[10].innerHTML
		, ks: cells[12].innerHTML
		, era: cells[13].innerHTML
		, whip: cells[14].innerHTML
		, saves: cells[15].innerHTML

	}
}))