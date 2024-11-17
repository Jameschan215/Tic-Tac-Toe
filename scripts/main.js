function constants() {
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
	const { rows, cols } = constants();
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
		{ name: playerOneName, token: 1 },
		{ name: playerTwoName, token: 2 },
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
		const { rows, cols } = constants();
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
		const { rows, cols } = constants();
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
		const { rows, cols } = constants();
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

	return { playRound, getActivePlayer, resetGame };
}

const game = GameController();
