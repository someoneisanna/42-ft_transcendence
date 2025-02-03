var totalGuests = 1;

function nameValidate(element) {
	if (element !== null) {
		let value = element.value;
	
		if (value.length > 0 && value[value.length - 1] === ' ')
			value = value.substring(0, value.length - 1);
		element.value = value;
	}

	// iterate for each participant name
	// and check if they repeat or if they are empty
	// if they do, make the border scary red and disable the start button
	let participants = document.getElementsByClassName('participant');
	
	document.getElementById('tournamentStartButton').disabled = false;
	for (let i = 0; i < participants.length; i++) {
		participants[i].getElementsByClassName('participantName')[0].style.borderColor = 'black';
	}
	for (let i = 0; i < participants.length; i++) {
		for (let j = 0; j < participants.length; j++) {
			if (i === j)
				continue;

			let participant1 = participants[i];
			let participant2 = participants[j];
			let name1 = participant1.getElementsByClassName('participantName')[0].value;
			let name2 = participant2.getElementsByClassName('participantName')[0].value;
			if (name1 === name2) {
				participant1.getElementsByClassName('participantName')[0].style.borderColor = 'red';
				participant2.getElementsByClassName('participantName')[0].style.borderColor = 'red';
				document.getElementById('tournamentStartButton').disabled = true;
				continue;
			}
		}
		if (participants[i].getElementsByClassName('participantName')[0].value.length === 0) {
			participants[i].getElementsByClassName('participantName')[0].style.borderColor = 'red';
			document.getElementById('tournamentStartButton').disabled = true;
		}	
	}	
}

function getParticipantElement() {
	totalGuests++;

	const participantDiv = document.createElement('div');
	participantDiv.classList.add('participantsBoxElement', 'participant', 'd-flex', 'flex-column', 'align-items-center', 'justify-content-center', 'position-relative');

	const removeElement = document.createElement('i');
	removeElement.classList.add('fas', 'fa-minus-circle', 'fa-2x', 'remove-icon');
	removeElement.onclick = () => pongTournamentRemoveParticipant(removeElement);

	const imgElement = document.createElement('img');
	imgElement.classList.add('participantProfilePicture', 'rounded-circle');
	imgElement.setAttribute('src', '/media/default.jpg');
	imgElement.setAttribute('width', '150');
	imgElement.setAttribute('height', '150');

	const inputElement = document.createElement('input');
	inputElement.classList.add('participantName');
	inputElement.setAttribute('type', 'text');
	inputElement.setAttribute('maxlength', "20");
	inputElement.setAttribute('placeholder', "Guest name...");
	inputElement.setAttribute('value', "Guest#" + totalGuests);
	inputElement.oninput = () => nameValidate(inputElement);
	
	participantDiv.appendChild(removeElement);
	participantDiv.appendChild(imgElement);
	participantDiv.appendChild(inputElement);

	return participantDiv;
}

function pongTournamentAddParticipant() {
	let participantsBox = document.getElementById("participantsBox");
	let newParticipantDiv = getParticipantElement();
	
	let children = participantsBox.children;
	participantsBox.insertBefore(newParticipantDiv, children[children.length - 1]);

	nameValidate(newParticipantDiv.getElementsByClassName('participantName')[0]);
}

function pongTournamentRemoveParticipant(button) {
	button.parentElement.remove();
	nameValidate(null);
}

function pongTournamentStart() {
	let participantNames = Array.from(document.getElementsByClassName('participantName')).map(input => input.value.trim());
	tournamentPlayerNames = shuffleArray(participantNames);
	pongIsTournament = true;
	loadPage('/pong_game/', false);
}

function initializeJS() {
	pong_localTournament(false);
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
