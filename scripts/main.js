function Constants() {
	const rows = 3;
	const cols = 3;

	return { rows, cols };
}

function Cell() {
	let value = 0;

	const addToken = (token) => {
		value = token;
	};

	const getValue = () => value;

	return { addToken, getValue };
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

function GameController(playerOneName = 'Tom', playerTwoName = 'Jerry') {
	const players = [
		{ name: playerOneName, token: 1, won: false },
		{ name: playerTwoName, token: 2, won: false },
	];
	let activePlayer = players[0];

	const gameBoard = GameBoard();

	const switchPlayerTurn = () => {
		activePlayer = activePlayer === players[0] ? players[1] : players[0];
	};

	const getActivePlayer = () => activePlayer;

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
						}
					}
					if (count >= 3) return true;
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
			activePlayer.won = true;
			gameBoard.printBoard();
			console.log(`${getActivePlayer().name} won the game!`);
			return;
		} else if (checkTie(gameBoard.getBoard())) {
			gameBoard.printBoard();
			console.log("No one won the game. It's a tie!");
			return;
		}

		switchPlayerTurn();
		printNewRound();
	};

	const resetGame = () => {
		gameBoard.setBoard();
		activePlayer = players[0];
		printNewRound();
	};

	resetGame();

	return {
		playRound,
		getActivePlayer,
		resetGame,
		getBoard: gameBoard.getBoard,
	};
}

(function ScreenController() {
	const game = GameController();

	const xIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
	const oIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle"><circle cx="12" cy="12" r="10"/></svg>`;

	const turnInfoDom = document.querySelector('.turn-info');
	const endInfo = document.querySelector('.end-info');
	const boardDom = document.querySelector('.board');

	const updateScreen = () => {
		// Clear board
		boardDom.innerHTML = '';

		// Get newest version of the board and the turn info
		const board = game.getBoard();
		const activePlayer = game.getActivePlayer();

		// Display turn info
		turnInfoDom.textContent = `${activePlayer.name}'s turn ...`;

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

				boardDom.appendChild(cellDom);
			});
		});
	};

	function boardClickHandler(e) {
		const row = e.target.dataset.row;
		const col = e.target.dataset.col;

		if (!row || !col) return;

		console.log(row + ', ' + col);
		game.playRound(row, col);

		updateScreen();
	}

	boardDom.addEventListener('click', boardClickHandler);

	updateScreen();
})();
