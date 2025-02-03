// EN PT FR ES
var tlIndex = 0;

const tl = {
	"" : ["",
		  "",
		  "",
		  ""],

	"en-US": ["en-US",
			  "pt-BR",
			  "fr-FR",
			  "es-ES"],

	"cookieconsentLabel": ["Cookies Notice",
						  "Aviso de Cookies",
						  "Avis sur les Cookies",
						  "Aviso de Cookies"],

	"tlCookieModal": ["We use only strictly necessary cookies to ensure our website functions properly. These cookies are essential for core functionalities like security, session management, and accessibility. No tracking, analytics, or third-party cookies are used. By continuing to use our website, you consent to the use of these essential cookies.",
					  "Utilizamos apenas cookies estritamente necessários para garantir o funcionamento adequado do nosso website. Estes cookies são essenciais para funcionalidades principais, como segurança, gestão de sessões e acessibilidade. Não utilizamos cookies de rastreamento, analíticos ou de terceiros. Ao continuar a utilizar o nosso website, consente na utilização destes cookies essenciais.",
					  "Nous utilisons uniquement des cookies strictement nécessaires pour garantir le bon fonctionnement de notre site web. Ces cookies sont essentiels pour les fonctionnalités de base telles que la sécurité, la gestion des sessions et l'accessibilité. Nous n'utilisons pas de cookies de suivi, d'analyse ou de tiers. En continuant à utiliser notre site, vous acceptez l'utilisation de ces cookies essentiels.",
					  "Utilizamos únicamente cookies estrictamente necesarios para garantizar que nuestro sitio web funcione correctamente. Estas cookies son esenciales para funcionalidades básicas como la seguridad, la gestión de sesiones y la accesibilidad. No utilizamos cookies de seguimiento, analíticas ni de terceros. Al continuar utilizando nuestro sitio web, usted acepta el uso de estas cookies esenciales."],

	"confirmModalLabel1": ["Welcome back to ft_transcendence!", 
						   "Bem-vindo de volta ao ft_transcendence!", 
						   "Bienvenue de retour à ft_transcendence!", 
						   "¡Bienvenido de nuevo a ft_transcendence!"],

	"confirmModalLabel2": ["Do you want to continue as ",
						   "Quer continuar como ",
						   "Voulez-vous continuer comme ",
						   "¿Quieres continuar como "],

	"clickAnywhereMessage": ["Click anywhere on the page to login or register",
							 "Clique em qualquer lugar da página para fazer login ou registrar-se",
							 "Cliquez n'importe où sur la page pour vous connecter ou vous inscrire",
							 "Haga clic en cualquier lugar de la página para iniciar sesión o registrarse"],

	"confirmSignOut": ["Sign Out",
					   "Sair",
					   "Déconnexion",
					   "Cerrar sesión"],

	"confirmYes": ["Yes",
				   "Sim",
				   "Oui",
				   "Sí"],

	"quitMessage": ["Are you sure you want to quit?",
					"Tem certeza que deseja sair?",
					"Êtes-vous sûr de vouloir quitter?",
					"¿Estás seguro de que quieres salir?"],

	"inputLogin2FA": ["2FA Code", 
					  "Código 2FA", 
					  "Code 2FA", 
					  "Código 2FA"],

	"tlLoginButton" : ["Login",
					   "Entrar",
					   "Connexion",
					   "Iniciar sesión"],

	"forgotPasswordLabel": ["Forgot Password",
							"Esqueceu a senha",
							"Mot de passe oublié",
							"Contraseña olvidada"],

	"tlForgotPasswordModal": ["Forgot Password?",
							  "Esqueceu a senha?",
							  "Mot de passe oublié?",
							  "¿Contraseña olvidada?"],

	"tlForgotPasswordEmailInput": ["Enter your email address below, and we'll send you a verification code to reset your password.",
								   "Digite seu endereço de e-mail abaixo e enviaremos um código de verificação para redefinir sua senha.",
								   "Entrez votre adresse e-mail ci-dessous et nous vous enverrons un code de vérification pour réinitialiser votre mot de passe.",
								   "Ingrese su dirección de correo electrónico a continuación y le enviaremos un código de verificación para restablecer su contraseña."],

	"tlInputForgotPasswordEmail": ["Email Address",
								   "Endereço de e-mail",
								   "Adresse e-mail",
								   "Correo electrónico"],
	
	"tlEmailCancel": ["Cancel",
					  "Cancelar",
					  "Annuler",
					  "Cancelar"],

	"sendEmailButton": ["Send Email",
						"Enviar e-mail",
						"Envoyer un e-mail",
						"Enviar correo electrónico"],
	
	"Sending...": ["Sending...",
				   "Enviando...",
				   "Envoi...",
				   "Enviando..."],

	"tlRegisterUsername": ["Username",
						   "Nome de usuário",
						   "Nom d'utilisateur",
						   "Nombre de usuario"],

	"tlRegisterEmail": ["Email",
						"Email",
						"Email",
						"Correo electrónico"],

	"tlRegisterPassword": ["Password",
						   "Senha",
						   "Mot de passe",
						   "Contraseña"],

	"tlConfirmPassword": ["Confirm Password",
						  "Confirmar senha",
						  "Confirmer le mot de passe",
						  "Confirmar contraseña"],

	"tl2FAConfirmUse": ["Check this box if you want to enable 2FA",
						"Marque esta caixa se deseja ativar 2FA",
						"Cochez cette case si vous souhaitez activer 2FA",
						"Marque esta casilla si desea habilitar 2FA"],

	"registerButton": ["Register",
					   "Registrar",
					   "S'inscrire",
					   "Registrarse"],

	"tlPasswordsDoNotMatch": ["Passwords do not match!",
							  "As senhas não coincidem!",
							  "Les mots de passe ne correspondent pas!",
							  "Las contraseñas no coinciden!"],

	"Username already exists. Please login.": ["Username already exists. Please login.",
											   "Nome de usuário já existe. Por favor, faça login.",
											   "Le nom d'utilisateur existe déjà. Veuillez vous connecter.",
											   "El nombre de usuario ya existe. Por favor inicie sesión."],

	"Email already exists. Please login.": ["Email already exists. Please login.",
											"O e-mail já existe. Por favor, faça login.",
											"L'email existe déjà. Veuillez vous connecter.",
											"El correo electrónico ya existe. Por favor inicie sesión."],

	"login-tab": ["Login",
				  "Entrar",
				  "Connexion",
				  "Iniciar sesión"],

	"register-tab": ["Register",
					 "Registrar",
					 "S'inscrire",
					 "Registrarse"],

	"Username doesn\'t exist. Please register.": ["Username doesn't exist. Please register.",
												  "Nome de usuário não existe. Por favor, registre-se.",
												  "Le nom d'utilisateur n'existe pas. Veuillez vous inscrire.",
												  "El nombre de usuario no existe. Por favor regístrese."],

	"Incorrect password. Please try again.": ["Incorrect password. Please try again.",
											  "Senha incorreta. Por favor, tente novamente.",
											  "Mot de passe incorrect. Veuillez réessayer.",
											  "Contraseña incorrecta. Por favor, inténtelo de nuevo."],

	"tlInputLoginUsername": ["Username",
							 "Nome de usuário",
							 "Nom d'utilisateur",
							 "Nombre de usuario"],

	"tlInputLoginPassword": ["Password",
							 "Senha",
							 "Mot de passe",
							 "Contraseña"],

	"forgotPasswordCodeHeader1": ["A verification code has been sent to: ",
											   "Um código de verificação foi enviado para: ",
											   "Un code de vérification a été envoyé à: ",
											   "Se ha enviado un código de verificación a: "],

	"forgotPasswordCodeHeader3": ["Please enter the code below, as well as your new password.",
																	 "Por favor, insira o código abaixo, bem como sua nova senha.",
																	 "Veuillez saisir le code ci-dessous, ainsi que votre nouveau mot de passe.",
																	 "Por favor ingrese el código a continuación, así como su nueva contraseña."],

	"Incorrect verification code. Please try again.": ["Incorrect verification code. Please try again.",
													   "Código de verificação incorreto. Por favor, tente novamente.",
													   "Code de vérification incorrect. Veuillez réessayer.",
													   "Código de verificación incorrecto. Por favor, inténtelo de nuevo."],

	"tlLoginRegisterTextNew": ["New password",
							  "Nova senha",
							  "Nouveau mot de passe",
							  "Nueva contraseña"],

	"tlLoginRegisterTextConfirmNew": ["Confirm new password",
							"Confirmar nova senha",
							"Confirmer le nouveau mot de passe",
							"Confirmar nueva contraseña"],

	"tlBackToEmail": ["Back",
					  "Voltar",
					  "Retour",
					  "Volver"],

	"tlContinueToEmail": ["Continue",
						 "Continuar",
						 "Continuer",
						 "Continuar"],

	"tlPendingInvitations": ["Pending Invitations",
							 "Convites Pendentes",
							 "Invitations en attente",
							 "Invitaciones pendientes"],

	"tlNoPendingInvitations": ["No Pending Invitations",
							   "Sem convites pendentes",
							   "Aucune invitation en attente",
							   "No hay invitaciones pendientes"],

	"dropdownEN": ["🇬🇧 English",
				   "🇬🇧 Inglês",
				   "🇬🇧 Anglais",
				   "🇬🇧 Inglés"],

	"dropdownPT": ["🇧🇷 Portuguese",
				   "🇧🇷 Português",
				   "🇧🇷 Portugais",
				   "🇧🇷 Portugués"],

	"dropdownFR": ["🇫🇷 French",
				   "🇫🇷 Francês",
				   "🇫🇷 Français",
				   "🇫🇷 Francés"],

	"dropdownES": ["🇪🇸 Spanish",
				   "🇪🇸 Espanhol",
				   "🇪🇸 Espagnol",
				   "🇪🇸 Español"],

	"tlDropdownProfile": ["Profile",
						  "Perfil",
						  "Profil",
						  "Perfil"],

	"tlDropdownFriends": ["Friends",
						  "Amigos",
						  "Amis",
						  "Amigos"],

	"tlDropdownSettings": ["Settings",
						   "Configurações",
						   "Paramètres",
						   "Ajustes"],

	"tlDropdownLogout": ["Sign out",
						 "Sair",
						 "Déconnexion",
						 "Cerrar sesión"],

	"Go to User Profile": ["Go to User Profile",
						   "Visitar Perfil do Usuário",
						   "Aller au Profil de l'Utilisateur",
						   "Ir al Perfil de Usuario"],

	"Invite User to a Match": ["Invite User to a Match",
							   "Convidar Usuário para uma Partida",
							   "Inviter l'Utilisateur à un Match",
							   "Invitar a Usuario a una Partida"],

	"You already invited user to a match. Click to cancel.": ["You already invited user to a match. Click to cancel.",
															  "Você já convidou o usuário para uma partida. Clique para cancelar.",
															  "Vous avez déjà invité l'utilisateur à un match. Cliquez pour annuler.",
															  "Ya invitaste al usuario a una partida. Haz clic para cancelar."],
	
	"Block User": ["Block User",
				   "Bloquear Usuário",
				   "Bloquer l'Utilisateur",
				   "Bloquear Usuario"],

	"sendMessageInput": ["Type message",
						"Digite a mensagem",
						"Tapez le message",
						"Escriba el mensaje"],

	"pongStartMatchModalLongTitle1": ["Start Pong Match?",
									 "Iniciar Partida de Pong?",
									 "Démarrer le Match de Pong?",
									 "¿Iniciar Partido de Pong?"],

	"startPongMatchChat": ["Yes",
						   "Sim",
						   "Oui",
						   "Sí"],

	"cancelPongMatchChat": ["Cancel Match",
							"Cancelar Partida",
							"Annuler le Match",
							"Cancelar Partido"],

	"pongStartMatchModalLongTitle2": ["Waiting for opponent...",
									"Aguardando oponente...",
									"En attente de l'adversaire...",
									"Esperando oponente..."],

	"Would you like to start your Pong Match with ": ["Would you like to start your Pong Match with ",
													   "Gostaria de iniciar sua Partida de Pong com ",
													   "Voulez-vous commencer votre Match de Pong avec ",
													   "¿Te gustaría comenzar tu Partido de Pong con "],

	"tlLoading": ["Loading...",
				  "Carregando...",
				  "Chargement...",
				  "Cargando..."],

	" has cancelled the Pong Match.": [" has cancelled the Pong Match.",
									   " cancelou a Partida de Pong.",
									   " a annulé le Match de Pong.",
									   " ha cancelado el Partido de Pong."],

	" has declined your invitation to a Pong Match.": [" has declined your invitation to a Pong Match.",
													   " recusou seu convite para uma Partida de Pong.",
													   " a décliné votre invitation à un Match de Pong.",
													   " ha rechazado tu invitación a un Partido de Pong."],

	"s invitation ": ["s invitation ",
					  "O convite de ",
					  "L'invitation de ",
					  "La invitación de "],
	
	"has expired. Open the chat again to refresh.": ["has expired. Open the chat again to refresh.",
													 " expirou. Abra o chat novamente para atualizar.",
													 " a expiré. Ouvrez à nouveau le chat pour actualiser.",
													 " ha expirado. Abre el chat de nuevo para actualizar."],

	" has invited you to a Pong Match.": [" has invited you to a Pong Match.",
										  " convidou você para uma Partida de Pong.",
										  " vous a invité à un Match de Pong.",
										  " te ha invitado a un Partido de Pong."],

	" does not accept game invitations.": [" does not accept game invitations.",
										  " não aceita convites para jogos.",
										  " n'accepte pas les invitations aux jeux.",
										  " no acepta invitaciones a juegos."],

	"Your invitation to a Pong Match was cancelled.": ["Your invitation to a Pong Match was cancelled.",
														"Seu convite para uma Partida de Pong foi cancelado.",
														"Votre invitation à un Match de Pong a été annulée.",
														"Tu invitación a un Partido de Pong fue cancelada."],

	" Your invitation to a Pong Match has expired because ": [" Your invitation to a Pong Match has expired because ",
															  " Seu convite para uma Partida de Pong expirou porque ",
															  " Votre invitation à un Match de Pong a expiré parce que ",
															  " Tu invitación a un Partido de Pong ha expirado porque "],

	" is now offline.": [" is now offline.",
						 " ficou offline.",
						 " est maintenant hors ligne.",
						 " ahora está desconectado."],

	"You have invited ": ["You have invited ",
						"Você convidou ",
						"Vous avez invité ",
						"Has invitado a "],

	"to a Pong Match": [" to a Pong Match",
						" para uma Partida de Pong",
						" à un Match de Pong",
						" a un Partido de Pong"],

	"is offline. Try again when they are online.": [" is offline. Try again when they are online.",
													" está offline. Tente novamente quando estiver online.",
													" est hors ligne. Réessayez quand il sera en ligne.",
													" está desconectado. Inténtalo de nuevo cuando esté en línea."],

	"tlUploadButton": ["Upload",
					   "Enviar",
					   "Télécharger",
					   "Subir"],

	"tlMotto": ["Your Motto",
				"Sua Frase",
				"Votre Devise",
				"Tu lema"],

	"tlUpdateMotto": ["Update",
					  "Atualizar",
					  "Mettre à jour",
					  "Actualizar"],

	"removeProfilePicture": ["Remove Profile Picture",
							 "Remover Foto de Perfil",
							 "Supprimer la Photo de Profil",
							 "Eliminar Foto de Perfil"],

	"tlUpdateEmailText": ["Update Email",
						  "Atualizar Email",
						  "Mettre à jour l'email",
						  "Actualizar Correo Electrónico"],

	"tlUpdateEmail": ["Update",
					  "Atualizar",
					  "Mettre à jour",
					  "Actualizar"],

	"tlChangePasswordText": ["Change Password",
							 "Alterar Senha",
							 "Changer le mot de passe",
							 "Cambiar Contraseña"],

	"tlChangePasswordButton": ["Change",
							   "Alterar",
							   "Changer",
							   "Cambiar"],

	"tlLanguage": ["Change Default Language", 
				   "Alterar Idioma Padrão",
				   "Changer la Langue par Défaut",
				   "Cambiar Idioma Predeterminado"],

	"tlEN": ["English", "Inglês", "Anglais", "Inglés"],
	"tlPT": ["Portuguese", "Português", "Portugais", "Portugués"],
	"tlFR": ["French", "Francês", "Français", "Francés"],
	"tlES": ["Spanish", "Espanhol", "Espagnol", "Español"],

	"tlChangeLanguageButton": ["Change", 
							   "Alterar", 
							   "Changer", 
							   "Cambiar"],

	"tl2FAText": ["Two-factor authentication",
				  "Autenticação de dois fatores",
				  "Authentification à deux facteurs",
				  "Autenticación de dos factores"],

	"tlAllowCommentsText": ["Allow comments on your profile",
							"Permitir comentários em seu perfil",
							"Autoriser les commentaires sur votre profil",
							"Permitir comentarios en su perfil"],

	"tlFromAnyone": ["From anyone",
					 "De qualquer pessoa",
					 "De n'importe qui",
					 "De cualquiera"],

	"tlFromFriendsOnly": ["From friends only",
						  "Apenas de amigos",
						  "De amis seulement",
						  "Solo de amigos"],

	"tlDontAllow": ["Don't allow",
					"Não permitir",
					"Ne pas autoriser",
					"No permitir"],

	"tlAllowInvites": ["Allow people to invite you to games",
					   "Permitir que as pessoas o convidem para jogos",
					   "Autoriser les gens à vous inviter à des jeux",
					   "Permitir que las personas lo inviten a juegos"],

	"tlResetStatsText": ["Reset Stats",
						 "Apagar Estatísticas",
						 "Réinitialiser les Statistiques",
						 "Restablecer Estadísticas"],

	"tlResetStats": ["Reset",
					 "Apagar",
					 "Réinitialiser",
					 "Restablecer"],

	"tlDeleteAccountText": ["Delete account",
							"Excluir conta",
							"Supprimer le compte",
							"Eliminar cuenta"],

	"deleteAccount": ["Delete",
					  "Excluir",
					  "Supprimer",
					  "Eliminar"],

	"Motto is already set to this value.": ["Motto is already set to this value.",
											"Frase já definida para este valor.",
											"La devise est déjà définie à cette valeur.",
											"El lema ya está establecido en este valor."],

	"Motto changed successfully!": ["Motto changed successfully!",
									"Frase alterada com sucesso!",
									"La devise a été modifiée avec succès!",
									"¡El lema se cambió con éxito!"],

	"Comments policy was updated successfully!": ["Comments policy was updated successfully!",
												  "A política de comentários foi atualizada com sucesso!",
												  "La politique de commentaires a été mise à jour avec succès!",
												  "¡La política de comentarios se actualizó con éxito!"],

	"Are you sure you want to delete your account?": ["Are you sure you want to delete your account?",
													  "Tem certeza de que deseja excluir sua conta?",
													  "Êtes-vous sûr de vouloir supprimer votre compte?",
													  "¿Estás seguro de que quieres eliminar tu cuenta?"],

	"Motto cannot exceed 100 characters!": ["Motto cannot exceed 100 characters!",
											"A frase não pode exceder 100 caracteres!",
											"La devise ne peut pas dépasser 100 caractères!",
											"¡El lema no puede exceder los 100 caracteres!"],

	"All fields are required!": ["All fields are required!",
								"Todos os campos são obrigatórios!",
								"Tous les champs sont obligatoires!",
								"¡Todos los campos son obligatorios!"],

	"Email already exists. Please try again.": ["Email already exists. Please try again.",
												"O e-mail já existe. Por favor, tente novamente.",
												"L'email existe déjà. Veuillez réessayer.",
												"El correo electrónico ya existe. Por favor, inténtelo de nuevo."],

	"Incorrect password. Please try again.": ["Incorrect password. Please try again.",
											  "Senha incorreta. Por favor, tente novamente.",
											  "Mot de passe incorrect. Veuillez réessayer.",
											  "Contraseña incorrecta. Por favor, inténtelo de nuevo."],

	"Email updated successfully!": ["Email updated successfully!",
									"Email atualizado com sucesso!",
									"Email mis à jour avec succès!",
									"Correo electrónico actualizado con éxito!"],

	"New password must be different from the old password!": ["New password must be different from the old password!",
															  "A nova senha deve ser diferente da senha antiga!",
															  "Le nouveau mot de passe doit être différent de l'ancien mot de passe!",
															  "¡La nueva contraseña debe ser diferente de la antigua contraseña!"],

	"Passwords do not match!": ["Passwords do not match!",
							   "As senhas não coincidem!",
							   "Les mots de passe ne correspondent pas!",
							   "Las contraseñas no coinciden!"],

	"Password updated successfully!": ["Password updated successfully!",
									   "Senha atualizada com sucesso!",
									   "Mot de passe mis à jour avec succès!",
									   "Contraseña actualizada con éxito!"],

	"Password was changed successfully!": ["Password was changed successfully!",
										   "Senha alterada com sucesso!",
										   "Le mot de passe a été modifié avec succès!",
										   "¡La contraseña se cambió con éxito!"],

	"Language was updated successfully!": ["Language was updated successfully!",
										   "Idioma atualizado com sucesso!",
										   "La langue a été mise à jour avec succès!",
										   "¡El idioma se actualizó con éxito!"],

	"Invalid language selected!": ["Invalid language selected!",
								   "Idioma selecionado inválido!",
								   "Langue sélectionnée invalide!",
								   "¡Idioma seleccionado no válido!"],

	"qrCodeSettingsText": ["Scan this QR code with your 2FA app to enable 2FA:",
						  "Escaneie este código QR com seu aplicativo 2FA para ativar 2FA:",
						  "Scannez ce code QR avec votre application 2FA pour activer 2FA:",
						  "Escanee este código QR con su aplicación 2FA para habilitar 2FA:"],

	"tlFriendsText": ["Friends",
					  "Amigos",
					  "Amis",
					  "Amigos"],

	"Add Friend": ["Add Friend",
				   "Adicionar Amigo",
				   "Ajouter un Ami",
				   "Agregar Amigo"],

	"Remove Friend": ["Remove Friend",
					  "Remover Amigo",
					  "Supprimer l'Ami",
					  "Eliminar Amigo"],

	"Cancel Invite": ["Cancel Invite",
					  "Cancelar Convite",
					  "Annuler l'Invitation",
					  "Cancelar Invitación"],

	"Reject": ["Reject",
			   "Rejeitar",
			   "Rejeter",
			   "Rechazar"],

	"Accept": ["Accept",
			   "Aceitar",
			   "Accepter",
			   "Aceptar"],

	"Unblock User": ["Unblock User",
					 "Desbloquear Usuário",
					 "Débloquer l'Utilisateur",
					 "Desbloquear Usuario"],

	"tlGreetings": ["Greetings, ",
					"Saudações, ",
					"Salutations, ",
					"Saludos, "],

	"tlJoined": ["Joined: ",
				 "Entrou: ",
				 "Rejoint: ",
				 "Unido: "],

	"tlPlayed": ["Games Played:",
				 "Jogos Jogados:",
				 "Jeux Joués:",
				 "Juegos Jugados:"],

	"tlWon": ["Games Won:",
			  "Jogos Vencidos:",
			  "Jeux Gagnés:",
			  "Juegos Ganados:"],

	"tlLost": ["Games Lost:",
			   "Jogos Perdidos:",
			   "Jeux Perdus:",
			   "Juegos Perdidos:"],

	"tlTournamentGamesPlayed": ["Tournament Games Played:",
							"Jogos de Torneio Jogados:",
							"Jeux de Tournoi Joués:",
							"Juegos de Torneo Jugados:"],

	"tlTournamentGamesWon": ["Tournament Games Won:",
							 "Jogos de Torneio Vencidos:",
							 "Jeux de Tournoi Gagnés:",
							 "Juegos de Torneo Ganados:"],
	
	"tlTournamentGamesLost": ["Tournament Games Lost:",
							  "Jogos de Torneio Perdidos:",
							  "Jeux de Tournoi Perdus:",
							  "Juegos de Torneo Perdidos:"],

	"tlTournamentsWon": ["Number of Tournaments Won:",
						 "Número de Torneios Vencidos:",
						 "Nombre de Tournois Gagnés:",
						 "Número de Torneos Ganados:"],

	"tlStats": ["Stats",
				"Estatísticas",
				"Statistiques",
				"Estadísticas"],

	"tlGameHistory": ["Game History",
					  "Histórico de Jogos",
					  "Historique de Jeu",
					  "Historial de Juegos"],

	"previousPage": [" Previous",
					 " Anterior",
					 " Précédent",
					 " Anterior"],

	"nextPage": ["Next ",
				 " Próximo",
				 " Suivant",
				 " Siguiente"],

	"tlComments": ["Comments",
				   "Comentários",
				   "Commentaires",
				   "Comentarios"],

	"postCommentButton": ["Post",
						  "Postar",
						  "Poster",
						  "Publicar"],

	"tlTableDate": ["Date",
					"Data",
					"Date",
					"Fecha"],

	"tlTableTime": ["Time",
					"Hora",
					"Heure",
					"Hora"],

	"tlTableType": ["Game Type",
						"Tipo de Jogo",
						"Type de Jeu",
						"Tipo de Juego"],

	"tlTableUsername": ["User",
						"Usuário",
						"Utilisateur",
						"Usuario"],

	"tlTableScore": ["Result",
					  "Resultado",
					  "Résultat",
					  "Resultado"],

	"tlTableOpponent": ["Opponent",
						"Oponente",
						"Adversaire",
						"Oponente"],

	"Local": ["Local",
			  "Local",
			  "Local",
			  "Local"],

	"Online": ["Online",
			   "Online",
			   "En ligne",
			   "En línea"],

	"vs. AI": ["vs. AI",
			   "vs. IA",
			   "vs. IA",
			   "vs. IA"],

	"Custom": ["Custom",
			   "Personalizado",
			   "Personnalisé",
			   "Personalizado"],

	"User Left": ["User Left",
				  "Usuário Saiu",
				  "Utilisateur Parti",
				  "Usuario se Fue"],

	"Opponent Left": ["Opponent Left",
					  "Oponente Saiu",
					  "Adversaire Parti",
					  "Oponente se Fue"],

	"Single Game": ["Single Game",
					"Jogo Único",
					"Jeu Unique",
					"Juego Único"],

	"Tournament": ["Tournament",
				   "Torneio",
				   "Tournoi",
				   "Torneo"],

	"Delete": ["Delete",
			   "Excluir",
			   "Supprimer",
			   "Eliminar"],

	"inputLoginUsername": ["Enter Username",
					   "Digite o Nome de Usuário",
					   "Entrez le Nom d'Utilisateur",
					   "Ingrese el Nombre de Usuario"],

	"inputRegisterUsername": ["Enter Username",
							  "Digite o Nome de Usuário",
							  "Entrez le Nom d'Utilisateur",
							  "Ingrese el Nombre de Usuario"],

	"Password": ["Password",
				 "Senha",
				 "Mot de Passe",
				 "Contraseña"],

	"inputRegisterConfirmPassword": ["Confirm Password",
									 "Confirmar Senha",
									 "Confirmer le Mot de Passe",
									 "Confirmar Contraseña"],

	"inputForgotPasswordConfirmPassword": ["Confirm Password",
										   "Confirmar Senha",
										   "Confirmer le Mot de Passe",
										   "Confirmar Contraseña"],

	"inputRegisterEmail": ["Enter Email",
						   "Digite o Email",
						   "Entrez l'Email",
						   "Ingrese el Correo Electrónico"],

	"inputRegisterPassword": ["Password",
							  "Senha",
							  "Mot de Passe",
							  "Contraseña"],

	"inputForgotPasswordEmail": ["Enter your email",
								 "Digite seu email",
								 "Entrez votre email",
								 "Ingrese su correo electrónico"],

	"inputForgotPasswordPassword": ["Password",
									"Senha",
									"Mot de Passe",
									"Contraseña"],



	"motto": ["Your motto",
			  "Sua frase",
			  "Votre devise",
			  "Tu lema"],

	"New email": ["New email",
				  "Novo email",
				  "Nouvel email",
				  "Nuevo correo electrónico"],

	"old-password": ["Old password",
					 "Senha antiga",
					 "Ancien mot de passe",
					 "Contraseña anterior"],

	"new-password": ["New password",
					 "Nova senha",
					 "Nouveau mot de passe",
					 "Nueva contraseña"],

	"new-password-confirmation": ["Confirm new password",
							 "Confirmar nova senha",
							 "Confirmer le nouveau mot de passe",
							 "Confirmar nueva contraseña"],

	"tlMenuDuel": ["1 VS 1",
				   "1 VS 1",
				   "1 VS 1",
				   "1 VS 1"],

	"tlMenuDuelDesc": ["PLAY AGAINST ANOTHER PLAYER",
					   "JOGUE CONTRA OUTRO JOGADOR",
					   "JOUEZ CONTRE UN AUTRE JOUEUR",
					   "JUEGA CONTRA OTRO JUGADOR"],

	"tlMenuTournament": ["TOURNAMENT",
						 "TORNEIO",
						 "TOURNOI",
						 "TORNEO"],

	"tlMenuTournamentDesc": ["MATCH WITH SEVERAL PLAYERS IN A TOURNAMENT",
							 "PARTIDA COM VÁRIOS JOGADORES EM UM TORNEIO",
							 "MATCH AVEC PLUSIEURS JOUEURS DANS UN TOURNOI",
							 "PARTIDO CON VARIOS JUGADORES EN UN TORNEO"],

	"tlQuickplayLocal": ["LOCAL DUEL",
						 "DUELO LOCAL",
						 "DUEL LOCAL",
						 "DUELO LOCAL"],

	"tlQuickplayLocalDesc": ["PLAY LOCALLY WITH A FRIEND",
							 "JOGUE LOCALMENTE COM UM AMIGO",
							 "JOUEZ LOCALEMENT AVEC UN AMI",
							 "JUEGA LOCALMENTE CON UN AMIGO"],

	"tlQuickplayOnline": ["ONLINE DUEL",
						  "DUELO ONLINE",
						  "DUEL EN LIGNE",
						  "DUELO EN LÍNEA"],

	"tlQuickplayOnlineDesc": ["PLAY ONLINE AGAINST A RANDOM PLAYER",
							  "JOGUE ONLINE CONTRA UM JOGADOR ALEATÓRIO",
							  "JOUEZ EN LIGNE CONTRE UN JOUEUR ALÉATOIRE",
							  "JUEGA EN LÍNEA CONTRA UN JUGADOR ALEATORIO"],

	"tlQuickplayAi": ["AI MATCH",
					  "PARTIDA CONTRA IA",
					  "MATCH CONTRE IA",
					  "PARTIDO CONTRA IA"],

	"tlQuickplayAiDesc": ["PLAY AGAINST AN AI OPPONENT",
						  "JOGUE CONTRA UM OPONENTE IA",
						  "JOUEZ CONTRE UN ADVERSAIRE IA",
						  "JUEGA CONTRA UN ADVERSARIO IA"],

	"tlQuickplayCustom": ["CUSTOM GAME",
						  "JOGO PERSONALIZADO",
						  "JEU PERSONNALISÉ",
						  "JUEGO PERSONALIZADO"],

	"tlQuickplayCustomDesc": ["CREATE A GAME WITH CUSTOM RULES",
							  "CRIE UM JOGO COM REGRAS PERSONALIZADAS",
							  "CRÉEZ UN JEU AVEC DES RÈGLES PERSONNALISÉES",
							  "CREA UN JUEGO CON REGLAS PERSONALIZADAS"],

	"tlTargetScore": ["Target Score",
					  "Pontuação Alvo",
					  "Score Cible",
					  "Puntuación Objetivo"],

	"tlPaddleSpeed": ["Paddle Speed",
					  "Velocidade da Raquete",
					  "Vitesse de la Raquette",
					  "Velocidad de la Paleta"],

	"tlInitialBallSpeed": ["Initial Ball Speed",
						   "Velocidade Inicial da Bola",
						   "Vitesse Initiale de la Balle",
						   "Velocidad Inicial de la Pelota"],

	"tlBallSpeedIncreaseRate": ["Ball Speed Increase Rate",
								"Taxa de Aumento de Velocidade da Bola",
								"Taux d'Augmentation de la Vitesse de la Balle",
								"Velocidad de Aumento de la Pelota"],

	"tlPowerUps": ["Power-ups",
				   "Power-ups",
				   "Power-ups",
				   "Power-ups"],

	"tlPowerUpSpawnInterval": ["Power-up Spawn Interval",
							   "Intervalo de Aparição de Power-up",
							   "Intervalle d'Apparition de Power-up",
							   "Intervalo de Aparición de Power-up"],

	"tlPowerUpEffectsIntensity": ["Power-up Effects Intensity",
								  "Intensidade dos Efeitos de Power-up",
								  "Intensité des Effets de Power-up",
								  "Intensidad de los Efectos de Power-up"],

	"tlPowerUpEffectsDuration": ["Power-up Time Until Despawn",
								 "Tempo do Power-up até Desaparecer",
								 "Temps du Power-up Jusqu'à Disparition",
								 "Tiempo del Power-up Hasta Desaparición"],

	"tlBackgroundColor": ["Background Color",
						 "Cor de Fundo",
						 "Couleur de Fond",
						 "Color de Fondo"],

	"tlPaddleColorLeft": ["Left Paddle Color",
						  "Cor da Raquete Esquerda",
						  "Couleur de la Raquette Gauche",
						  "Color de la Paleta Izquierda"],

	"tlPaddleColorRight": ["Right Paddle Color",
						   "Cor da Raquete Direita",
						   "Couleur de la Raquette Droite",
						   "Color de la Paleta Derecha"],

	"tlBallColor": ["Ball Color",
					"Cor da Bola",
					"Couleur de la Balle",
					"Color de la Pelota"],

	"tlBallTrailColor": ["Ball Trail Color",
						 "Cor do Rastro da Bola",
						 "Couleur de la Trace de la Balle",
						 "Color de la Estela de la Pelota"],

	"customGameDefaultButton": ["Default Settings",
								"Configurações Padrão",
								"Paramètres par Défaut",
								"Configuración Predeterminada"],

	"customGameCreateButton": ["Start Custom Game",
						 "Iniciar Jogo Personalizado",
						 "Démarrer le Jeu Personnalisé",
						 "Iniciar Juego Personalizado"],

	"matchmaking-title": ["LOOKING FOR PLAYERS",
						  "PROCURANDO JOGADORES",
						  "RECHERCHE DE JOUEURS",
						  "BUSCANDO JUGADORES"],

	"tlPongTounamentLocal": ["LOCAL TOURNAMENT",
							 "TORNEIO LOCAL",
							 "TOURNOI LOCAL",
							 "TORNEO LOCAL"],

	"tlPongTounamentLocalDesc": ["RUN A LOCAL TOURNAMENT",
								 "REALIZE UM TORNEIO LOCAL",
								 "ORGANISER UN TOURNOI LOCAL",
								 "REALIZAR UN TORNEO LOCAL"],

	"tlPongTounamentOnline": ["ONLINE TOURNAMENT",
							  "TORNEIO ONLINE",
							  "TOURNOI EN LIGNE",
							  "TORNEO EN LÍNEA"],

	"tlPongTounamentOnlineDesc": ["PLAY AN ONLINE TOURNAMENT AGAINST RANDOM PLAYERS",
								  "JOGUE UM TORNEIO ONLINE CONTRA JOGADORES ALEATÓRIOS",
								  "JOUEZ UN TOURNOI EN LIGNE CONTRE DES JOUEURS ALÉATOIRES",
								  "JUEGA UN TORNEO EN LÍNEA CONTRA JUGADORES ALEATORIOS"],

	"tournamentStartButton": ["Start Tournament",
							  "Iniciar Torneio",
							  "Démarrer le Tournoi",
							  "Iniciar Torneo"],

	"Go to": ["Go to ",
			  "Visitar o perfil de ",
			  "Visiter le profil de ",
			  "Ir al perfil de "],

	"You were invited to a match by ": ["You were invited to a match by ",
									   "Você foi convidado para uma partida por ",
									   "Vous avez été invité à un match par ",
									   "Fuiste invitado a un partido por "],

	". Click to accept.": [". Click to accept.",
						  ". Clique para aceitar.",
						  ". Cliquez pour accepter.",
						  ". Haz clic para aceptar."],

	"You invited ": ["You invited ",
					 "Você convidou ",
					 "Vous avez invité ",
					 "Invitaste a "],

	" to a match. Click to cancel.": [" to a match. Click to cancel.",
									" para uma partida. Clique para cancelar.",
									" à un match. Cliquez pour annuler.",
									" a una partida. Haz clic para cancelar."],

	"Invite ": ["Invite ",
				"Convidar ",
				"Inviter ",
				"Invitar "],

	" to a match": [" to a match",
					" para uma partida",
					" à un match",
					" a una partida"],

	"Block ": ["Block ",
			   "Bloquear ",
			   "Bloquer ",
			   "Bloquear "],

	"commentInput": ["Write your comment here...",
					 "Escreva seu comentário aqui...",
					 "Écrivez votre commentaire ici...",
					 "Escribe tu comentario aquí..."],

	"new-email": ["New email",
				  "Novo email",
				  "Nouvel email",
				  "Nuevo correo electrónico"],

	"current-password": ["Password",
						 "Senha",
						 "Mot de Passe",
						 "Contraseña"],

	"inputLoginPassword": ["Password",
						   "Senha",
						   "Mot de Passe",
						   "Contraseña"],

	"tournamentAlert": ["It's your turn to play. Good luck!",
						"É a sua vez de jogar. Boa sorte!",
						"C'est à votre tour de jouer. Bonne chance!",
						"Es tu turno de jugar. ¡Buena suerte!"],

	"tournamentMapToggleButton": ["Tournament Map",
								 "Mapa do Torneio",
								 "Carte du Tournoi",
								 "Mapa del Torneo"],

	" Left": [" Left",
			  " Saiu",
			  " Parti",
			  " se Fue"],

	"Game Over": ["Game Over",
				  "Fim de Jogo",
				  "Fin de la Partie",
				  "Fin del Juego"],

	"searchInput": ["Search usernames",
					"Procurar nomes de usuário",
					"Rechercher des noms d'utilisateur",
					"Buscar nombres de usuario"],

	"Invalid 2FA code. Please try again.": ["Invalid 2FA code. Please try again.",
											"Código 2FA inválido. Por favor, tente novamente.",
											"Code 2FA invalide. Veuillez réessayer.",
											"Código 2FA inválido. Por favor, inténtelo de nuevo."],

	"Are you sure you want to block ": ["Are you sure you want to block ",
										"Tem certeza de que deseja bloquear ",
										"Êtes-vous sûr de vouloir bloquer ",
										"¿Estás seguro de que quieres bloquear "],
}

function changeLanguage(index) {
	localStorage.setItem('language_chosen', index);
	loadTranslationScript(currURL);
}

function getLanguage() {
	var language = localStorage.getItem('language_chosen');
	if (language == 0 || language == 1 || language == 2 || language == 3)
		tlIndex = language;
	else
		tlIndex = 0;
}

function translateElement(elementId) {
	var element = document.getElementById(elementId);
	if (element)
		element.innerHTML = tl[elementId][tlIndex];
	// else
	// 	console.error("Element not found: " + elementId);
}

function translatePlaceholder(elementId) {
	var element = document.getElementById(elementId);
	if (element)
		element.placeholder = getTranslation(elementId);
	// else
	// 	console.error("Element not found: " + elementId);
}

function translateTitle(elementId) {
	var element = document.getElementById(elementId);
	if (element)
		element.title = getTranslation(element.title);
}

function getTranslation(elementId) {
	let ret;
	try {
		ret	= tl[elementId][tlIndex];
	}
	catch(error) {
		// console.error(error, elementId);
		return "No translation";
	}
	return ret;
}

function loadTranslationScript(url) {
	const script = document.createElement('script');
	script.src = '/static/js/translate.js'
	let cleanUrl = url.replaceAll("/", "")
	script.onload = () => {
		if (typeof window[cleanUrl] === 'function') {
			window[cleanUrl]();
		} else {
			console.error(`Function "${cleanUrl}" does not exist.`);
		}
	};
	document.body.appendChild(script);
}
