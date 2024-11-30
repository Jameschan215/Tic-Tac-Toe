/* ------------------ Constants ------------------ */
const ROWS = 3;
const COLS = 3;
const X_TOKEN = 1;
const O_TOKEN = 2;
const X_ICON = `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-x">
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>`;
const O_ICON = `
<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class="lucide lucide-circle">
	<circle cx="12" cy="12" r="10" />
</svg>`;

/* ------------------ Modules ------------------ */
// 1. Board cell module
function Cell() {
	let value = 0;
	let inLineThree = false;

	const addToken = (token) => {
		value = token;
	};

	const getValue = () => value;

	const getInLineThree = () => inLineThree;

	const setInLineThree = (value) => {
		inLineThree = value;
	};

	return { addToken, getValue, setInLineThree, getInLineThree };
}

// 2. Game board module
function GameBoard() {
	const board = [];

	// Create a 2d array that will represent the state of the game board
	const setBoard = () => {
		for (let row = 0; row < ROWS; row++) {
			board[row] = [];
			for (let col = 0; col < COLS; col++) {
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

	return { setBoard, getBoard, dropToken };
}

// 3. Player module
function Player(name) {
	return {
		name: name,
		token: null,
		win: false,
		count: 0,
		setToken(token) {
			this.token = token;
		},
	};
}

// 4. Game controller module
function GameController() {
	const gameBoard = GameBoard();
	let tie = false;
	let players = [];
	let activePlayerToken = 1;

	// Initialize the players
	const setPlayers = (
		playerOneName,
		playerTwoName,
		playerOneToken = X_TOKEN
	) => {
		players = [];
		if (!playerOneName) playerOneName = 'Tom';
		if (!playerTwoName) playerTwoName = 'Jerry';

		const playerOne = Player(playerOneName);
		const playerTwo = Player(playerTwoName);

		// If player token must be 1 or 2
		if (playerOneToken !== X_TOKEN && playerOneToken !== O_TOKEN) return;

		// Set player token, one is 1, the other must be 2
		playerOne.setToken(playerOneToken);
		playerTwo.setToken(playerOneToken === X_TOKEN ? O_TOKEN : X_TOKEN);

		players.push(playerOne);
		players.push(playerTwo);
	};

	const getActivePlayer = () =>
		players.find((p) => p.token === activePlayerToken);

	const switchPlayerTurn = () => {
		activePlayerToken = activePlayerToken === X_TOKEN ? O_TOKEN : X_TOKEN;
	};

	const getPlayers = () => players;

	const getTie = () => tie;

	// If all cells are occupied, i.e. there is no cell's value is 0, it's a tie.
	const checkTie = (board) =>
		!board.flat().some((cell) => cell.getValue() === 0);

	const checkWin = (board) => {
		const token = getActivePlayer().token;

		// There are four ways to win:
		// 3 in a row horizontally, 3 in a row vertically,
		// 3 in a row diagonally (forward), and 3 in a row diagonally (backward)
		const directions = [
			[0, 1], // the horizontal way 					-
			[1, 0], // the vertical way   					|
			[1, 1], // the diagonal (forward) way 	/
			[1, -1], // the diagonal (backward) way  \
		];

		for (let row = 0; row < ROWS; row++) {
			for (let col = 0; col < COLS; col++) {
				// Ignore any cell occupied by the opponent
				if (board[row][col].getValue() !== token) continue;

				// Check all the 4 ways to win
				for ([dr, dc] of directions) {
					// Get 'checkThreeInLine' result, it's an array or null
					const cellsInLine = checkThreeInLine(board, row, col, dr, dc, token);

					// If the result exists, convert all cell's state to 'inLineThree'
					// and return true
					if (cellsInLine) {
						cellsInLine.forEach((cell) => cell.setInLineThree(true));
						return true;
					}
				}
			}
		}

		return false;
	};

	function checkThreeInLine(board, row, col, dr, dc, token) {
		let count = 0;
		let cellsInLineThree = [];

		// Use current cell's coordinate to calculate current cell
		// and its next two neighbors's coordinates in four directions
		for (let i = 0; i < 3; i++) {
			const rowIndex = row + dr * i;
			const colIndex = col + dc * i;

			// Then check if these coordinates are out of the board range
			if (
				rowIndex >= 0 &&
				rowIndex < ROWS &&
				colIndex >= 0 &&
				colIndex < COLS &&
				// And if these coordinates contain the same value
				board[rowIndex][colIndex].getValue() === token
			) {
				// Count the cells which contains the same value
				// and push them into an array
				count += 1;
				cellsInLineThree.push(board[rowIndex][colIndex]);
			}
		}

		// Lastly, if there are 3 cells in the array,
		// return it, otherwise return null
		return count >= 3 ? cellsInLineThree : null;
	}

	const playRound = (row, col) => {
		// You can't put tokens out of the board
		if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

		// You can't put tokens on cells occupied
		if (gameBoard.getBoard()[row][col].getValue() !== 0) return;

		// Current player drop a token
		gameBoard.dropToken(row, col, getActivePlayer().token);

		// Check win and tie here
		if (checkWin(gameBoard.getBoard())) {
			const activePlayer = getActivePlayer();
			activePlayer.win = true;
			activePlayer.count += 1;
			return;
		} else if (checkTie(gameBoard.getBoard())) {
			tie = true;
			return;
		}

		switchPlayerTurn();
	};

	const nextGame = () => {
		gameBoard.setBoard();
		tie = false;
		activePlayerToken = 1;
		players.forEach((player) => (player.win = false));
	};

	const restart = () => {
		nextGame();
		players.forEach((player) => (player.count = 0));
	};

	restart();

	return {
		getTie,
		playRound,
		setPlayers,
		getPlayers,
		getActivePlayer,
		restart,
		nextGame,
		getBoard: gameBoard.getBoard,
	};
}

// 5. Update screen module
function UpdateScreen() {
	const playerOneInfoDom = document.querySelector('.player-1');
	const playerTwoInfoDom = document.querySelector('.player-2');
	const boardDom = document.querySelector('.board');
	const gameInfoDom = document.querySelector('.game-info');

	const toggleBoardFrozen = () => {
		boardDom
			.querySelectorAll('button')
			.forEach((btn) => (btn.disabled = !btn.disabled));
	};

	const updateScreen = (game) => {
		// Clear board
		boardDom.innerHTML = '';

		// Get newest version of the board and the turn info
		const board = game.getBoard();
		const players = game.getPlayers();
		const activePlayer = game.getActivePlayer();

		/* --------------- Render board --------------- */
		board.forEach((row, rowIndex) => {
			row.forEach((cell, colIndex) => {
				const cellDom = document.createElement('button');
				cellDom.dataset.row = rowIndex;
				cellDom.dataset.col = colIndex;

				cellDom.classList.add('cell');

				if (cell.getValue() === 1) {
					cellDom.classList.add('x-token');
					cellDom.innerHTML = X_ICON;
				} else if (cell.getValue() === 2) {
					cellDom.classList.add('o-token');
					cellDom.innerHTML = O_ICON;
				}

				// if cells in line 3
				if (cell.getInLineThree()) {
					cellDom.classList.add('three-in-line');
				}

				boardDom.appendChild(cellDom);
			});
		});

		/* --------------- Render players information --------------- */
		// 1. The content
		playerOneInfoDom.innerHTML = `
			<p class='token ${players[0].token === 1 ? 'x-token' : 'o-token'}'>${
			players[0].token === 1 ? X_ICON : O_ICON
		}</p>
			<p>${players[0].name}</p>
			<p>${players[0].count === 0 ? '-' : players[0].count}</p>
		`;
		playerTwoInfoDom.innerHTML = `
		<p>${players[1].count === 0 ? '-' : players[1].count}</p>
		<p>${players[1].name}</p>
		<p class='token ${players[0].token === 1 ? 'x-token' : 'o-token'}'>${
			players[1].token === 1 ? X_ICON : O_ICON
		}</p>
		`;

		// 2. The color
		if (players[0].token === 1) {
			playerOneInfoDom.classList.add('x-token');
			playerOneInfoDom.classList.remove('o-token');
			playerTwoInfoDom.classList.add('o-token');
			playerTwoInfoDom.classList.remove('x-token');
		} else if (players[1].token === 1) {
			playerOneInfoDom.classList.add('o-token');
			playerOneInfoDom.classList.remove('x-token');
			playerTwoInfoDom.classList.add('x-token');
			playerTwoInfoDom.classList.remove('o-token');
		}

		// 3. Highlighted when active
		if (players[0] === activePlayer) {
			playerOneInfoDom.classList.add('active');
			playerTwoInfoDom.classList.remove('active');
		} else if (players[1] === activePlayer) {
			playerOneInfoDom.classList.remove('active');
			playerTwoInfoDom.classList.add('active');
		}

		/* --------------- Display turn information --------------- */
		if (activePlayer.win) {
			gameInfoDom.textContent = `${activePlayer.name} wins!`;
			gameInfoDom.classList.add('win-info');
			toggleBoardFrozen();
		} else if (game.getTie()) {
			gameInfoDom.textContent = `It's a tie.`;
		} else {
			gameInfoDom.textContent = `${activePlayer.name}'s turn.`;
		}
	};

	return { updateScreen, toggleBoardFrozen };
}

// 6. Display controller IIFE module
(function DisplayController() {
	const game = GameController();
	const { updateScreen, toggleBoardFrozen } = UpdateScreen();
	game.setPlayers();

	const gameInfoDom = document.querySelector('.game-info');
	const boardDom = document.querySelector('.board');
	const restartBtnDom = document.querySelector('#restart-game');
	const nextBtnDom = document.querySelector('#next-game');
	const setBtnDom = document.querySelector('#set-game');

	// ---------- Dialog element references ----------
	const dialogDom = document.querySelector('dialog');
	const closeDom = document.querySelector('#close');
	const formDom = document.querySelector('form');

	function boardClickHandler(e) {
		const rowIndex = e.target.dataset.row;
		const colIndex = e.target.dataset.col;

		if (!rowIndex || !colIndex) return;

		game.playRound(rowIndex, colIndex);
		updateScreen(game);
	}

	const restart = () => {
		game.restart();
		toggleBoardFrozen();
		gameInfoDom.classList.remove('win-info');
		updateScreen(game);
	};

	const nextGame = () => {
		game.nextGame();
		toggleBoardFrozen();
		gameInfoDom.classList.remove('win-info');
		updateScreen(game);
	};

	const showDialog = (players) => {
		// Make current players displayed in form
		if (players) {
			const playerOneNameDom = document.querySelector('#playerOneName');
			const playerTwoNameDom = document.querySelector('#playerTwoName');
			const tokenOneDom = document.querySelector('#x-token');
			const tokenTwoDom = document.querySelector('#o-token');

			playerOneNameDom.value = players[0]?.name || '';
			playerTwoNameDom.value = players[1]?.name || '';
			tokenOneDom.checked = players[0]?.token === 1;
			tokenTwoDom.checked = players[1]?.token === 1;
		}
		dialogDom.showModal();
	};

	function submitForm(event) {
		event.preventDefault();

		const formData = new FormData(event.target);
		const token = +formData.get('token');
		const playerOneName = formData.get('playerOneName');
		const playerTwoName = formData.get('playerTwoName');
		game.setPlayers(playerOneName, playerTwoName, token);

		formDom.reset();
		dialogDom.close();
		updateScreen(game);
	}

	/* ---------- Event handlers ---------- */
	function setupEventListeners() {
		boardDom.addEventListener('click', boardClickHandler);
		restartBtnDom.addEventListener('click', restart);
		nextBtnDom.addEventListener('click', nextGame);
		setBtnDom.addEventListener('click', () => showDialog(game.getPlayers()));

		// Dialog event handlers
		closeDom.addEventListener('click', () => dialogDom.close());
		formDom.addEventListener('submit', submitForm);
	}

	setupEventListeners();
	updateScreen(game);
	showDialog();
})();
