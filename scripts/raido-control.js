const tokenOneDom = document.querySelector('#x-token');
const tokenTwoDom = document.querySelector('#o-token');
const playerOneNameInputWrapper = document.querySelector('.name-1');
const playerTwoNameInputWrapper = document.querySelector('.name-2');

tokenOneDom.addEventListener('change', () => {
	if (tokenOneDom.checked) {
		playerOneNameInputWrapper.classList.add('checked');
		playerTwoNameInputWrapper.classList.remove('checked');
	}
});

tokenTwoDom.addEventListener('change', () => {
	if (tokenTwoDom.checked) {
		playerTwoNameInputWrapper.classList.add('checked');
		playerOneNameInputWrapper.classList.remove('checked');
	}
});
