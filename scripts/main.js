function Constants() {
	const rows = 3;
	const cols = 3;

	return { rows, cols };
}

function Cell() {
	let value = 0;
	let inGroup = false;

	const addToken = (token) => {
		value = token;
	};

	const getValue = () => value;

	const setInGroup = (value) => {
		inGroup = value;
	};
	const getInGroup = () => inGroup;

	return { addToken, getValue, setInGroup, getInGroup };
}

function GameBoard() {
	const { rows, cols } = Constants();
	const board = [];

	// Create a 2d array that will represent the state of the game board
	const setBoard = () => {
		for (let row = 0; row < rows; row++) {
			board[row] = [];
			for (let col = 0; col < cols; col++) {
				board[row].push(Cell());
			}
		}
	};

	// This will be the method of getting the entire board that our
	// UI will eventually need to render it.
	const getBoard = () => board;

	const dropToken = (row, col, token) => {
		if (board[row][col].getValue() !== 0) return;
		board[row][col].addToken(token);
	};

	// This method will be used to print our board to the console.
	const printBoard = () => {
		const boardWithValues = board.map((row) =>
			row.map((cell) => cell.getValue())
		);
		console.log(boardWithValues);
	};

	return { setBoard, getBoard, dropToken, printBoard };
}

function GamePlayer(name, token) {
	return {
		name: name,
		token: token,
		win: false,
		count: 0,
	};
}

function GameController() {
	const playerOne = GamePlayer('Player 1', 1);
	const playerTwo = GamePlayer('Player 2', 2);
	console.log({ playerOne });

	let activePlayer = playerOne;
	let tie = false;

	const gameBoard = GameBoard();

	const switchPlayerTurn = () => {
		activePlayer = activePlayer === playerOne ? playerTwo : playerOne;
	};

	const getActivePlayer = () => activePlayer;

	const getTie = () => tie;

	const printNewRound = () => {
		gameBoard.printBoard();
		console.log(`${getActivePlayer().name}'s turn.`);
	};

	const checkTie = (board) => {
		const { rows, cols } = Constants();
		let count = 0;

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				if (board[row][col].getValue() === 0) {
					count += 1;
				}
			}
		}

		if (count === 0) return true;

		return false;
	};

	const checkWin = (board) => {
		const { rows, cols } = Constants();
		const token = getActivePlayer().token;
		const directions = [
			[0, 1],
			[1, 0],
			[1, 1],
			[1, -1],
		];

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				if (board[row][col].getValue() !== token) continue;

				for ([dr, dc] of directions) {
					let count = 0;
					let winGroup = [];

					for (let i = 0; i < 3; i++) {
						const rowIndex = row + dr * i;
						const colIndex = col + dc * i;

						if (
							rowIndex >= 0 &&
							rowIndex < rows &&
							colIndex >= 0 &&
							colIndex < cols &&
							board[rowIndex][colIndex].getValue() === token
						) {
							count += 1;
							winGroup.push(board[rowIndex][colIndex]);
						}
					}
					if (count >= 3) {
						winGroup.forEach((cell) => cell.setInGroup(true));
						return true;
					} else {
						winGroup = [];
					}
				}
			}
		}

		return false;
	};

	const playRound = (row, col) => {
		// You can't put tokens out of the board
		const { rows, cols } = Constants();
		if (row < 0 || row >= rows || col < 0 || col >= cols) {
			console.log('Out of the board!');
			return;
		}

		// You can't put tokens on cells occupied
		if (gameBoard.getBoard()[row][col].getValue() !== 0) {
			console.log('Cell occupied!');
			return;
		}

		// Current player drop a token
		console.log(
			`${getActivePlayer().name} is dropping token into (${row}, ${col}).`
		);
		gameBoard.dropToken(row, col, getActivePlayer().token);

		// Check win and tie here
		if (checkWin(gameBoard.getBoard())) {
			activePlayer.win = true;
			activePlayer.count += 1;
			gameBoard.printBoard();
			console.log(`${getActivePlayer().name} win the game!`);
			return;
		} else if (checkTie(gameBoard.getBoard())) {
			tie = true;
			console.log({ tie });

			gameBoard.printBoard();
			console.log("No one win the game. It's a tie!");
			return;
		}

		switchPlayerTurn();
		printNewRound();
	};

	const resetGame = () => {
		nextGame();
		playerOne.count = 0;
		playerTwo.count = 0;
	};

	const nextGame = () => {
		gameBoard.setBoard();

		activePlayer = playerOne;
		playerOne.win = false;
		playerTwo.win = false;
		tie = false;
	};

	resetGame();

	return {
		getTie,
		playRound,
		getActivePlayer,
		playerOne,
		playerTwo,
		resetGame,
		nextGame,
		getBoard: gameBoard.getBoard,
	};
}

(function ScreenController() {
	const game = GameController();

	const xIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
	const oIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle"><circle cx="12" cy="12" r="10"/></svg>`;

	const turnInfoDom = document.querySelector('.turn-info');
	const boardDom = document.querySelector('.board');
	const resetBtnDom = document.querySelector('.buttons #reset');
	const nextBtnDom = document.querySelector('.buttons #next');
	const playerOneName = document.querySelector('#player-1 .name');
	const playerTwoName = document.querySelector('#player-2 .name');
	const countOneDom = document.querySelector('#player-1 .count');
	const countTwoDom = document.querySelector('#player-2 .count');
	const playerInfoOne = document.querySelector('#player-1');
	const playerInfoTwo = document.querySelector('#player-2');

	const updateScreen = () => {
		// Clear board
		boardDom.innerHTML = '';

		// Get newest version of the board and the turn info
		const board = game.getBoard();
		const activePlayer = game.getActivePlayer();

		// Render players information
		playerOneName.textContent = game.playerOne.name;
		countOneDom.textContent =
			game.playerOne.count === 0 ? '-' : game.playerOne.count;
		playerTwoName.textContent = game.playerTwo.name;
		countTwoDom.textContent =
			game.playerTwo.count === 0 ? '-' : game.playerTwo.count;

		if (activePlayer.token === 1) {
			playerInfoOne.classList.add('active');
			playerInfoTwo.classList.remove('active');
		} else {
			playerInfoOne.classList.remove('active');
			playerInfoTwo.classList.add('active');
		}

		// Render board
		board.forEach((row, rowIndex) => {
			row.forEach((cell, colIndex) => {
				const cellDom = document.createElement('button');
				cellDom.dataset.row = rowIndex;
				cellDom.dataset.col = colIndex;

				cellDom.classList.add('cell');

				if (cell.getValue() === 1) {
					cellDom.classList.add('cellX');
					cellDom.innerHTML = xIcon;
				} else if (cell.getValue() === 2) {
					cellDom.classList.add('cellO');
					cellDom.innerHTML = oIcon;
				}

				// if cells in line 3
				if (cell.getInGroup()) {
					cellDom.classList.add('win-group');
				}

				boardDom.appendChild(cellDom);
			});
		});

		// Display turn info
		if (activePlayer.win) {
			turnInfoDom.textContent = `${activePlayer.name} wins!`;
			turnInfoDom.classList.add('win-info');
			toggleBoardFrozen();
		} else if (game.getTie()) {
			turnInfoDom.textContent = `Tie.`;
		} else {
			turnInfoDom.textContent = `${activePlayer.name}'s turn.`;
		}
	};

	const toggleBoardFrozen = () => {
		boardDom
			.querySelectorAll('button')
			.forEach((btn) => (btn.disabled = !btn.disabled));
	};

	function boardClickHandler(e) {
		const row = e.target.dataset.row;
		const col = e.target.dataset.col;

		if (!row || !col) return;

		console.log(row + ', ' + col);
		game.playRound(row, col);

		updateScreen();
	}

	const resetGame = () => {
		game.resetGame();
		toggleBoardFrozen();
		turnInfoDom.classList.remove('win-info');
		updateScreen();
	};

	const nextGame = () => {
		game.nextGame();
		toggleBoardFrozen();
		turnInfoDom.classList.remove('win-info');
		updateScreen();
	};

	boardDom.addEventListener('click', boardClickHandler);
	resetBtnDom.addEventListener('click', resetGame);
	nextBtnDom.addEventListener('click', nextGame);

	playerOneName.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();

			game.playerOne.name = event.target.value;
			playerOneName.blur();
			updateScreen();
		}
	});

	playerOneName.addEventListener('focusout', (event) => {
		event.preventDefault();

		game.playerOne.name = event.target.value;
		playerOneName.blur();
		updateScreen();
	});

	playerTwoName.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();

			game.playerTwo.name = event.target.value;
			playerTwoName.blur();

			updateScreen();
		}
	});

	playerTwoName.addEventListener('focusout', (event) => {
		event.preventDefault();

		game.playerTwo.name = event.target.value;
		playerOneName.blur();
		updateScreen();
	});

	updateScreen();
	showForm();
})();

function showForm() {
	const dialogDom = document.querySelector('dialog');
	const closeDom = document.querySelector('#close');
	const formDom = document.querySelector('form');

	dialogDom.showModal();

	formDom.addEventListener('submit', (event) => {
		event.preventDefault();

		const formData = new FormData(event.target);
		console.log(Object.fromEntries(formData.entries()));

		formDom.reset();
		dialogDom.close();
	});

	closeDom.addEventListener('click', () => dialogDom.close());
}
