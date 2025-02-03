getLanguage();

function translateChat() {
	translateElement("tlPendingInvitations");
	translateElement("tlNoPendingInvitations");
	translateElement("dropdownEN");
	translateElement("dropdownPT");
	translateElement("dropdownFR");
	translateElement("dropdownES");
	translateElement("tlDropdownProfile");
	translateElement("tlDropdownFriends");
	translateElement("tlDropdownSettings");
	translateElement("tlDropdownLogout");
	translateTitle("Go to User Profile");
	translateTitle("Invite User to a Match");
	translateTitle("You already invited user to a match. Click to cancel.");
	translateTitle("Block User");
	translatePlaceholder("sendMessageInput");
	translateElement("pongStartMatchModalLongTitle1");
	translateElement("startPongMatchChat");
	translateElement("cancelPongMatchChat");
	translateElement("pongStartMatchModalLongTitle2");
	translateElement("tlLoading");
}

function landing() {
	translateElement("confirmModalLabel1");
	translateElement("confirmModalLabel2");
	translateElement("clickAnywhereMessage");
	translateElement("confirmSignOut");
	translateElement("confirmYes");
	translateElement("inputLogin2FA");
	translateElement("tlLoginButton");
	translateElement("forgotPasswordLabel");
	translateElement("tlForgotPasswordModal");
	translateElement("tlForgotPasswordEmailInput");
	translateElement("tlInputForgotPasswordEmail");
	translateElement("tlEmailCancel");
	translateElement("sendEmailButton");
	translateElement("tlRegisterUsername");
	translateElement("tlRegisterEmail");
	translateElement("tlRegisterPassword");
	translateElement("tlConfirmPassword");
	translateElement("tl2FAConfirmUse");
	translateElement("registerButton");
	translateElement("login-tab");
	translateElement("register-tab");
	translateElement("tlInputLoginUsername");
	translateElement("tlInputLoginPassword");
	translateElement("tlLoginRegisterTextNew");
	translateElement("tlLoginRegisterTextConfirmNew");
	translateElement("tlBackToEmail");
	translateElement("tlContinueToEmail");
	translatePlaceholder("inputLoginUsername")
	translatePlaceholder("inputLoginPassword")
	translatePlaceholder("inputRegisterUsername")
	translatePlaceholder("inputRegisterEmail")
	translatePlaceholder("inputRegisterPassword")
	translatePlaceholder("inputRegisterConfirmPassword")
	translatePlaceholder("inputForgotPasswordEmail")
	translatePlaceholder("inputForgotPasswordPassword")
	translatePlaceholder("inputForgotPasswordConfirmPassword")
	translateElement('forgotPasswordCodeHeader1');
	translateElement('forgotPasswordCodeHeader3');
}

function game_choice(translate_chat = true) {
	if (translate_chat)
		translateChat();
	translateElement("tlPendingInvitations");
	translateElement("dropdownEN");
	translateElement("dropdownPT");
	translateElement("dropdownFR");
	translateElement("dropdownES");
	translateElement("tlDropdownProfile");
	translateElement("tlDropdownFriends");
	translateElement("tlDropdownSettings");
	translateElement("tlDropdownLogout");
	translateTitle("Go to User Profile");
	translateTitle("Invite User to a Match");
	translateTitle("You already invited user to a match. Click to cancel.");
	translateTitle("Block User");
	translatePlaceholder("sendMessageInput");
	translateElement("pongStartMatchModalLongTitle1");
	translateElement("startPongMatchChat");
	translateElement("cancelPongMatchChat");
	translateElement("pongStartMatchModalLongTitle2");
	translateElement("tlLoading");
}

function dropdown_profile(translate_chat = true) {
	if (translate_chat)
		translateChat();
	translateElement("tlGreetings");
	translateElement("tlJoined");
	translateElement("tlPlayed");
	translateElement("tlWon");
	translateElement("tlLost");
	translateElement("tlTournamentGamesPlayed");
	translateElement("tlTournamentGamesWon");
	translateElement("tlTournamentGamesLost");
	translateElement("tlTournamentsWon");
	translateElement("tlStats");
	translateElement("tlGameHistory");
	translateElement("previousPage");
	translateElement("nextPage");
	translateElement("tlComments");
	translateElement("postCommentButton");
	translateElement("tlTableDate");
	translateElement("tlTableTime");
	translateElement("tlTableType");
	translateElement("tlTableUsername");
	translateElement("tlTableScore");
	translateElement("tlTableOpponent");
	translateElement("tlDeleteButton");
	translatePlaceholder("commentInput");
}

function dropdown_friends(translate_chat = true) {
	if (translate_chat)
		translateChat();
	translateElement("tlFriendsText");
	translatePlaceholder("searchInput");
}

function dropdown_settings(translate_chat = true) {
	if (translate_chat)
		translateChat();
	getLanguage();
	translateElement("tlUploadButton");
	translateElement("tlMotto");
	translateElement("tlUpdateMotto");
	translateElement("removeProfilePicture");
	translateElement("tlUpdateEmailText");
	translateElement("tlUpdateEmail");
	translateElement("tlChangePasswordText");
	translateElement("tlChangePasswordButton");
	translateElement("tlLanguage");
	translateElement("tlEN");
	translateElement("tlPT");
	translateElement("tlFR");
	translateElement("tlES");
	translateElement("tlChangeLanguageButton");
	translateElement("tl2FAText");
	translateElement("tlAllowCommentsText");
	if (document.getElementById('qrCodeSettingsText').innerText !== '')
		translateElement("qrCodeSettingsText");
	translateElement("tlFromAnyone");
	translateElement("tlFromFriendsOnly");
	translateElement("tlDontAllow");
	translateElement("tlAllowInvites");
	translateElement("tlResetStatsText");
	translateElement("tlResetStats");
	translateElement("tlDeleteAccountText");
	translateElement("deleteAccount");
	translatePlaceholder("motto");
	translatePlaceholder("new-email");
	translatePlaceholder("current-password");
	translatePlaceholder("old-password");
	translatePlaceholder("new-password");
	translatePlaceholder("new-password-confirmation");
}

function pong_menu(translate_chat = true) {
	if (translate_chat)
		translateChat();
	translateElement("tlMenuDuel");
	translateElement("tlMenuDuelDesc");
	translateElement("tlMenuTournament");
	translateElement("tlMenuTournamentDesc");
}

function pong_quickplay(translate_chat = true) {
	if (translate_chat)
		translateChat();
	translateElement("tlQuickplayLocal");
	translateElement("tlQuickplayLocalDesc");
	translateElement("tlQuickplayOnline");
	translateElement("tlQuickplayOnlineDesc");
	translateElement("tlQuickplayAi");
	translateElement("tlQuickplayAiDesc");
	translateElement("tlQuickplayCustom");
	translateElement("tlQuickplayCustomDesc");
}

function pong_tournament(translate_chat = true) {
	if (translate_chat)
		translateChat();
	translateElement("tlPongTounamentLocal");
	translateElement("tlPongTounamentLocalDesc");
	translateElement("tlPongTounamentOnline");
	translateElement("tlPongTounamentOnlineDesc");
}

function pong_customGame(translate_chat = true) {
	if (translate_chat)
		translateChat();
	translateElement("tlTargetScore");
	translateElement("tlPaddleSpeed");
	translateElement("tlInitialBallSpeed");
	translateElement("tlBallSpeedIncreaseRate");
	translateElement("tlPowerUps");
	translateElement("tlPowerUpSpawnInterval");
	translateElement("tlPowerUpEffectsIntensity");
	translateElement("tlPowerUpEffectsDuration");
	translateElement("tlBackgroundColor");
	translateElement("tlPaddleColorLeft");
	translateElement("tlPaddleColorRight");
	translateElement("tlBallColor");
	translateElement("tlBallTrailColor");
	translateElement("customGameDefaultButton");
	translateElement("customGameCreateButton");
}

function pong_game(translate_chat = true) {
	if (translate_chat)
		translateChat();
	translateElement("tournamentAlert");
	translateElement("tournamentMapToggleButton");
}

function pong_localTournament(translate_chat = true) {
	if (translate_chat)
		translateChat();
	translateElement("tournamentStartButton");
}

function pong_matchmaking(translate_chat = true) {
	if (translate_chat)
		translateChat();
	translateElement("matchmaking-title");
}

function pong_remoteTournament(translate_chat = true) {
	if (translate_chat)
		translateChat();
	translateElement("matchmaking-title");
}
