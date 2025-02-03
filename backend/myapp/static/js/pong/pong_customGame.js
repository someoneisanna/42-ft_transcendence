var customSettings;

// var roomNameInput;

var sliderTargetScoreInput;
var sliderTargetScoreLabel;

var sliderPaddleSpeedInput;
var sliderPaddleSpeedLabel;

var sliderBallSpeedInput;
var sliderBallSpeedLabel;

var sliderBallSpeedIncreaseInput;
var sliderBallSpeedIncreaseLabel;

var checkboxPowerupsInput;

var sliderPowerupsIntervalInput;
var sliderPowerupsIntervalLabel;

var sliderPowerupsStrengthInput;
var sliderPowerupsStrengthLabel;

var sliderPowerupsDurationInput;
var sliderPowerupsDurationLabel;

var colorBackgroundInput;

var colorPaddleLeftInput;

var colorPaddleRightInput;

var colorBallInput;

var colorTrailInput;

function initializeJS() {
	customSettings = getDefaultSettings();

	sliderTargetScoreInput = document.getElementById('customGameTargetScoreInput');
	sliderTargetScoreLabel = document.getElementById('customGameTargetScoreValue');
	sliderTargetScoreInput.addEventListener('input', () => {
		sliderTargetScoreLabel.innerHTML = sliderTargetScoreInput.value;
	});
	
	sliderPaddleSpeedInput = document.getElementById('customGamePaddleSpeedInput');
	sliderPaddleSpeedLabel = document.getElementById('customGamePaddleSpeedValue');
	sliderPaddleSpeedInput.addEventListener('input', () => {
		sliderPaddleSpeedLabel.innerHTML = sliderPaddleSpeedInput.value;
	});
	
	sliderBallSpeedInput = document.getElementById('customGameBallSpeedInput');
	sliderBallSpeedLabel = document.getElementById('customGameBallSpeedValue');
	sliderBallSpeedInput.addEventListener('input', () => {
		sliderBallSpeedLabel.innerHTML = sliderBallSpeedInput.value;
	});
	
	sliderBallSpeedIncreaseInput = document.getElementById('customGameBallSpeedIncreaseInput');
	sliderBallSpeedIncreaseLabel = document.getElementById('customGameBallSpeedIncreaseValue');
	sliderBallSpeedIncreaseInput.addEventListener('input', () => {
		sliderBallSpeedIncreaseLabel.innerHTML = sliderBallSpeedIncreaseInput.value;
	});

	checkboxPowerupsInput = document.getElementById('customGameSwitchID');
	checkboxPowerupsInput.addEventListener('change', (event) => {
		if (event.target.checked == true)
			document.querySelector('.customGamePowerUpSettings').classList.remove('hide');
		else
			document.querySelector('.customGamePowerUpSettings').classList.add('hide');
	});

	sliderPowerupsIntervalInput = document.getElementById('customPowerupsIntervalInput');
	sliderPowerupsIntervalLabel = document.getElementById('customPowerupsIntervalValue');
	sliderPowerupsIntervalInput.addEventListener('input', () => {
		sliderPowerupsIntervalLabel.innerHTML = sliderPowerupsIntervalInput.value;
	});

	sliderPowerupsStrengthInput = document.getElementById('customPowerupsStrengthInput');
	sliderPowerupsStrengthLabel = document.getElementById('customPowerupsStrengthValue');
	sliderPowerupsStrengthInput.addEventListener('input', () => {
		sliderPowerupsStrengthLabel.innerHTML = sliderPowerupsStrengthInput.value;
	});

	sliderPowerupsDurationInput = document.getElementById('customPowerupsDurationInput');
	sliderPowerupsDurationLabel = document.getElementById('customPowerupsDurationValue');
	sliderPowerupsDurationInput.addEventListener('input', () => {
		sliderPowerupsDurationLabel.innerHTML = sliderPowerupsDurationInput.value;
	});

	colorBackgroundInput = document.getElementById('colorPickerBackground');
	colorPaddleLeftInput = document.getElementById('colorPickerPaddleLeft');
	colorPaddleRightInput = document.getElementById('colorPickerPaddleRight');
	colorBallInput = document.getElementById('colorPickerBall');
	colorTrailInput = document.getElementById('colorPickerTrail');

	resetToDefaults();

	pong_customGame(false);
}

function pongCustomGameStart() {
	customSettings.targetScore = Number(sliderTargetScoreInput.value);
	customSettings.paddleSpeed = Number(sliderPaddleSpeedInput.value);
	customSettings.initialSpeed = Number(sliderBallSpeedInput.value);
	customSettings.speedIncrease = Number(sliderBallSpeedIncreaseInput.value);
	customSettings.modifiers = checkboxPowerupsInput.checked ? ["speed", "height"] : [];
	customSettings.modifierCooldown = Number(sliderPowerupsIntervalInput.value);
	customSettings.modifierStrength = Number(sliderPowerupsStrengthInput.value);
	customSettings.modifierDuration = Number(sliderPowerupsDurationInput.value);
	customSettings.colorBackground = colorBackgroundInput.value;
	customSettings.colorPaddleLeft = colorPaddleLeftInput.value;
	customSettings.colorPaddleRight = colorPaddleRightInput.value;
	customSettings.colorBall = colorBallInput.value;
	customSettings.colorTrail = colorTrailInput.value;

	pongIsCustom = true;
	loadPage('/pong_game/', false);
}

function resetToDefaults() {
	sliderTargetScoreInput.value = customSettings.targetScore;
	sliderTargetScoreLabel.innerHTML = customSettings.targetScore;

	sliderPaddleSpeedInput.value = customSettings.paddleSpeed;
	sliderPaddleSpeedLabel.innerHTML = customSettings.paddleSpeed;

	sliderBallSpeedInput.value = customSettings.initialSpeed;
	sliderBallSpeedLabel.innerHTML = customSettings.initialSpeed;

	sliderBallSpeedIncreaseInput.value = customSettings.speedIncrease;
	sliderBallSpeedIncreaseLabel.innerHTML = customSettings.speedIncrease;

	checkboxPowerupsInput.checked = customSettings.modifiers.length > 0 ? true : false;
	if (checkboxPowerupsInput.checked == true)
		document.querySelector('.customGamePowerUpSettings').classList.remove('hide');
	else
		document.querySelector('.customGamePowerUpSettings').classList.add('hide');

	sliderPowerupsIntervalInput.value = customSettings.modifierCooldown;
	sliderPowerupsIntervalLabel.innerHTML = customSettings.modifierCooldown;

	sliderPowerupsStrengthInput.value = customSettings.modifierStrength;
	sliderPowerupsStrengthLabel.innerHTML = customSettings.modifierStrength;
	
	sliderPowerupsDurationInput.value = customSettings.modifierDuration;
	sliderPowerupsDurationLabel.innerHTML = customSettings.modifierDuration;
	
	colorBackgroundInput.value = customSettings.colorBackground;
	colorPaddleLeftInput.value = customSettings.colorPaddleLeft;
	colorPaddleRightInput.value = customSettings.colorPaddleRight;
	colorBallInput.value = customSettings.colorBall;
	colorTrailInput.value = customSettings.colorTrail;
}
