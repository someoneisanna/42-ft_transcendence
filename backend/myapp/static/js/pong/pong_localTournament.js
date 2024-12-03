var totalGuests = 1;

function nameValidate(element) {
	let value = element.value;

	if (value.length > 0 && value[value.length - 1] === ' ')
		value = value.substring(0, value.length - 1);
	element.value = value;
}

function getParticipantElement() {
	totalGuests++;
	let participantsBox = document.getElementById("participantsBox");

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
}

function pongTournamentRemoveParticipant(button) {
	button.parentElement.remove();
}

function pongTournamentStart() {
	
}

function initializeJS() {

}