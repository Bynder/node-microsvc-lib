build:
	@npm ci && npm run build

bump_version:
	@git fetch https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/Bynder/js-components-lib.git master
	@git config --global user.email "jenkins@bynder.com"
	@git config --global user.name "Your bro Jenkins"
	@npm version patch
	@git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/Bynder/js-components-lib.git HEAD:master
	@npm pack
	ls
